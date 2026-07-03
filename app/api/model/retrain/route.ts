import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { trainModel, TrainingExample } from '@/lib/credit-scoring/train'
import { ScorecardRow } from '@/lib/credit-scoring/data'

export interface VersionSnapshot {
  id: number
  auc: number | null
  n_training_samples: number | null
  notes: string | null
  created_at: string
}

export interface CoefficientDelta {
  feature: string
  before: number | null
  after: number
  delta: number
}

export interface RetrainResponse {
  newVersion: VersionSnapshot
  previousVersion: VersionSnapshot | null
  topDeltas: CoefficientDelta[]
}

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no esta configurado.' }, { status: 400 })
  }
  const sb = getSupabase()!

  // 1. Dataset base + creditos otorgados con resultado real conocido (no 'pending').
  const [{ data: seedRows, error: seedErr }, { data: appRows, error: appErr }] = await Promise.all([
    sb.from('seed_training_data').select('features, label'),
    sb.from('loan_applications').select('features, outcome').neq('outcome', 'pending'),
  ])
  if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 })
  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 })
  if (!seedRows || seedRows.length === 0) {
    return NextResponse.json(
      { error: 'No hay dataset base cargado (seed_training_data esta vacia).' },
      { status: 400 },
    )
  }

  const examples: TrainingExample[] = [
    ...seedRows.map((r) => ({ features: r.features, label: r.label as 0 | 1 })),
    ...(appRows ?? []).map((r) => ({
      features: r.features,
      label: (r.outcome === 'paid' ? 1 : 0) as 0 | 1,
    })),
  ]

  // 2. Entrenar.
  const result = trainModel(examples)

  // 3. Version activa actual (para el before/after y para desactivarla).
  const { data: previous } = await sb
    .from('model_versions')
    .select('id, coefficients, auc, n_training_samples, notes, created_at')
    .eq('is_active', true)
    .single()

  // 4. Desactivar la version vieja antes de insertar la nueva (el indice unico solo
  // permite una fila con is_active=true).
  if (previous) {
    await sb.from('model_versions').update({ is_active: false }).eq('id', previous.id)
  }

  const nNew = (appRows ?? []).length
  const notes = `Recalibrado: ${seedRows.length} casos base + ${nNew} otorgados con resultado real (${result.nTrain} train / ${result.nTest} test)`

  const { data: inserted, error: insertErr } = await sb
    .from('model_versions')
    .insert({
      coefficients: result.model,
      auc: result.auc,
      n_training_samples: examples.length,
      notes,
      is_active: true,
    })
    .select('id, auc, n_training_samples, notes, created_at')
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // 5. Deltas de coeficientes vs la version anterior, para mostrar en el before/after.
  const previousScorecard: ScorecardRow[] = previous?.coefficients?.scorecard ?? []
  const deltas: CoefficientDelta[] = result.model.scorecard.map((row) => {
    const before = previousScorecard.find((p) => p.feature === row.feature)?.coef ?? null
    return { feature: row.feature, before, after: row.coef, delta: row.coef - (before ?? 0) }
  })
  deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

  const response: RetrainResponse = {
    newVersion: inserted as VersionSnapshot,
    previousVersion: previous
      ? {
          id: previous.id,
          auc: previous.auc,
          n_training_samples: previous.n_training_samples,
          notes: previous.notes,
          created_at: previous.created_at,
        }
      : null,
    topDeltas: deltas.slice(0, 8),
  }
  return NextResponse.json(response)
}
