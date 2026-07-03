import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

export interface ModelVersionSummary {
  id: number
  auc: number | null
  n_training_samples: number | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ versions: [] as ModelVersionSummary[] })
  }

  const sb = getSupabase()!
  const { data, error } = await sb
    .from('model_versions')
    .select('id, auc, n_training_samples, notes, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ versions: (data ?? []) as ModelVersionSummary[] })
}
