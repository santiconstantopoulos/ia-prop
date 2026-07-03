import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { LoanApplicationRow } from '../route'

interface UpdateOutcomeBody {
  outcome: 'pending' | 'paid' | 'default'
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no esta configurado.' }, { status: 400 })
  }

  const { id } = await params
  const body = (await req.json()) as UpdateOutcomeBody
  if (!['pending', 'paid', 'default'].includes(body.outcome)) {
    return NextResponse.json({ error: 'outcome invalido.' }, { status: 400 })
  }

  const sb = getSupabase()!
  const { data, error } = await sb
    .from('loan_applications')
    .update({
      outcome: body.outcome,
      outcome_updated_at: body.outcome === 'pending' ? null : new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ application: data as LoanApplicationRow })
}
