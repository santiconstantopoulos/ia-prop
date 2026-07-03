import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { ApplicantState } from '@/lib/credit-scoring/data'
import { Decision } from '@/lib/credit-scoring/engine'

export interface LoanApplicationRow {
  id: string
  created_at: string
  features: ApplicantState
  score: number
  probability: number
  decision: Decision
  model_version_id: number | null
  outcome: 'pending' | 'paid' | 'default'
  outcome_updated_at: string | null
}

interface CreateApplicationBody {
  features: ApplicantState
  score: number
  probability: number
  decision: Decision
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ applications: [] as LoanApplicationRow[] })
  }

  const sb = getSupabase()!
  const { data, error } = await sb
    .from('loan_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ applications: (data ?? []) as LoanApplicationRow[] })
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase no esta configurado: no se puede otorgar/persistir el credito.' },
      { status: 400 },
    )
  }

  const body = (await req.json()) as CreateApplicationBody
  if (!body.features || typeof body.score !== 'number' || typeof body.probability !== 'number' || !body.decision) {
    return NextResponse.json({ error: 'Body invalido.' }, { status: 400 })
  }

  const sb = getSupabase()!

  // Buscamos el id del modelo activo server-side (no confiamos en lo que mande el cliente).
  const { data: activeModel } = await sb.from('model_versions').select('id').eq('is_active', true).single()

  const { data, error } = await sb
    .from('loan_applications')
    .insert({
      features: body.features,
      score: Math.round(body.score),
      probability: body.probability,
      decision: body.decision,
      model_version_id: activeModel?.id ?? null,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ application: data as LoanApplicationRow })
}
