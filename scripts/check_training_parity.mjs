// Valida que el pipeline de entrenamiento en TypeScript (lib/credit-scoring/train.ts)
// reproduce, sobre el dataset base (seed_training_data), un modelo estadísticamente
// equivalente al modelo desplegado en lib/credit-scoring/data.ts.
//
// Uso: npx tsx scripts/check_training_parity.mjs
//
// Nota sobre coeficientes: como el split train/test es aleatorio (distinto al usado
// para entrenar el modelo original) y se aplica regularización L2, los coeficientes
// individuales no van a coincidir exactamente con data.ts, especialmente en categorías
// poco frecuentes (alta varianza con pocas observaciones). Lo que importa para la
// paridad es el AUC del modelo re-entrenado, que sí debería quedar muy cerca de 0.771.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { trainModel } from '../lib/credit-scoring/train.ts'
import { DATA } from '../lib/credit-scoring/data.ts'

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

const { data, error } = await sb.from('seed_training_data').select('features, label')
if (error) throw new Error(error.message)
console.log('Filas cargadas desde seed_training_data:', data.length)

const examples = data.map((r) => ({ features: r.features, label: r.label }))

const t0 = Date.now()
const result = trainModel(examples)
console.log('Tiempo de entrenamiento (ms):', Date.now() - t0)
console.log('nTrain:', result.nTrain, ' nTest:', result.nTest)
console.log('AUC (test held-out):', result.auc?.toFixed(4), ' — modelo base: 0.771')
console.log('intercept:', result.model.intercept.toFixed(4), ' — modelo base:', DATA.intercept.toFixed(4))

console.log('\nDirección (signo) de los coeficientes con mayor peso en el modelo base:')
const top = [...DATA.scorecard].sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef)).slice(0, 8)
top.forEach((o) => {
  const trained = result.model.scorecard.find((r) => r.feature === o.feature)?.coef ?? NaN
  const sameSign = Math.sign(trained) === Math.sign(o.coef) ? 'coincide' : 'DIFIERE'
  console.log(` - ${o.feature.padEnd(45)} base=${o.coef.toFixed(3).padStart(7)}  reentrenado=${trained.toFixed(3).padStart(7)}  (${sameSign})`)
})
