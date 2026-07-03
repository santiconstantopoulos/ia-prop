import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { DATA, ScoringModel } from '@/lib/credit-scoring/data'

export interface ActiveModelResponse {
  model: ScoringModel
  source: 'db' | 'fallback'
  meta: {
    id: number | null
    auc: number | null
    n_training_samples: number | null
    notes: string | null
    created_at: string | null
  }
}

const FALLBACK_RESPONSE: ActiveModelResponse = {
  model: DATA,
  source: 'fallback',
  meta: { id: null, auc: 0.771, n_training_samples: 1000, notes: 'modelo base (hardcodeado)', created_at: null },
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(FALLBACK_RESPONSE)
  }

  const sb = getSupabase()!
  const { data, error } = await sb
    .from('model_versions')
    .select('id, coefficients, auc, n_training_samples, notes, created_at')
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json(FALLBACK_RESPONSE)
  }

  const response: ActiveModelResponse = {
    model: data.coefficients as ScoringModel,
    source: 'db',
    meta: {
      id: data.id,
      auc: data.auc,
      n_training_samples: data.n_training_samples,
      notes: data.notes,
      created_at: data.created_at,
    },
  }
  return NextResponse.json(response)
}
