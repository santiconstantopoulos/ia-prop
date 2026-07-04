// Carga el JSON generado por prepare_seed.py en la tabla seed_training_data.
// Uso: node --env-file=.env.local scripts/load_seed.mjs _seed_output.json
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const file = process.argv[2]
if (!file) {
  console.error('Uso: node scripts/load_seed.mjs <archivo.json>')
  process.exit(1)
}

const rows = JSON.parse(readFileSync(file, 'utf8'))
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY,
  {
    auth: { persistSession: false },
  },
)

// Reset: dejamos la tabla en un estado conocido antes de cargar (idempotente si se corre de nuevo).
const { error: delErr } = await sb.from('seed_training_data').delete().gte('id', 0)
if (delErr) throw new Error(`Error limpiando seed_training_data: ${delErr.message}`)

const chunkSize = 200
for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize)
  const { error } = await sb.from('seed_training_data').insert(chunk)
  if (error) throw new Error(`Error insertando filas ${i}-${i + chunk.length}: ${error.message}`)
  console.log(`Insertadas ${i + chunk.length}/${rows.length}`)
}

const { count } = await sb.from('seed_training_data').select('*', { count: 'exact', head: true })
console.log(`OK: seed_training_data tiene ${count} filas.`)
