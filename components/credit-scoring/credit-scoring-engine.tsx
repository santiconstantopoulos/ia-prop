'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ApplicantState,
  CAT_LABELS,
  COL_LABELS,
  DATA,
  NUM_CONFIG,
  Preset,
  PRESETS,
  ScoringModel,
  SECTIONS,
} from '@/lib/credit-scoring/data'
import { computeScore, decisionOf } from '@/lib/credit-scoring/engine'
import type { ActiveModelResponse } from '@/app/api/model/active/route'
import { FormField } from './form-field'
import { ResultPanel, GrantState } from './result-panel'
import { PortfolioView } from './portfolio-view'
import { LoanTrackingView } from './loan-tracking-view'
import './credit-scoring-engine.css'

function buildInitialState(): ApplicantState {
  const state: ApplicantState = {}
  DATA.cat_cols.forEach((c) => (state[c] = DATA.cat_categories[c][0]))
  DATA.num_cols.forEach((c) => (state[c] = NUM_CONFIG[c].def))
  return state
}

type Tab = 'individual' | 'cartera' | 'seguimiento'

export function CreditScoringEngine() {
  const [tab, setTab] = useState<Tab>('individual')
  const [state, setState] = useState<ApplicantState>(buildInitialState)
  const [model, setModel] = useState<ScoringModel>(DATA)
  const [modelMeta, setModelMeta] = useState<ActiveModelResponse['meta'] | null>(null)

  useEffect(() => {
    fetch('/api/model/active')
      .then((r) => r.json())
      .then((data: ActiveModelResponse) => {
        setModel(data.model)
        setModelMeta(data.meta)
      })
      .catch(() => {
        // Sin conexion o error de red: seguimos usando DATA (ya seteado como default).
      })
  }, [])

  const [grantState, setGrantState] = useState<GrantState>('idle')
  const [grantError, setGrantError] = useState<string>()

  const handleChange = (field: string, value: string | number) => {
    setState((prev) => ({ ...prev, [field]: value }))
    setGrantState('idle')
  }

  const applyPreset = (preset: Preset) => {
    setState((prev) => ({ ...prev, ...preset.data }))
    setGrantState('idle')
  }

  const { score, proba, contributions } = useMemo(
    () => computeScore(model, state, COL_LABELS, CAT_LABELS, NUM_CONFIG),
    [model, state],
  )
  const decision = decisionOf(score)

  const handleGrant = async () => {
    setGrantState('loading')
    setGrantError(undefined)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: state, score, probability: proba, decision }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al otorgar el crédito.')
      setGrantState('success')
    } catch (e) {
      setGrantState('error')
      setGrantError(e instanceof Error ? e.message : 'Error al otorgar el crédito.')
    }
  }

  const aucLabel = modelMeta?.auc != null ? modelMeta.auc.toFixed(3) : '0.771'
  const samplesLabel = modelMeta?.n_training_samples != null
    ? modelMeta.n_training_samples.toLocaleString('es-AR')
    : '1.000'

  return (
    <div className="csm-root">
      <div className="csm-topbar">
        <div className="csm-brand">
          <div className="csm-brand-mark">BC</div>
          <div className="csm-brand-text">
            <div className="csm-eyebrow">Banco Continental — Área de Créditos</div>
            <h1>Motor de Scoring Crediticio</h1>
          </div>
        </div>
        <div className="csm-topbar-meta">
          MODELO: REGRESIÓN LOGÍSTICA · AUC {aucLabel}
          <br />
          ENTRENADO SOBRE {samplesLabel} SOLICITUDES HISTÓRICAS
        </div>
      </div>

      <div className="csm-tabbar">
        <button
          className={`csm-tab-btn ${tab === 'individual' ? 'csm-active' : ''}`}
          onClick={() => setTab('individual')}
        >
          Evaluación individual
        </button>
        <button
          className={`csm-tab-btn ${tab === 'cartera' ? 'csm-active' : ''}`}
          onClick={() => setTab('cartera')}
        >
          Modo cartera (lote)
        </button>
        <button
          className={`csm-tab-btn ${tab === 'seguimiento' ? 'csm-active' : ''}`}
          onClick={() => setTab('seguimiento')}
        >
          Seguimiento
        </button>
      </div>

      {tab === 'individual' && (
        <div className="csm-layout">
          <div>
            <div className="csm-presets-card">
              <h3>Casos de ejemplo — un click para cargar</h3>
              <p className="csm-section-desc">
                Precarga los 20 campos con un perfil típico, para agilizar la demo.
              </p>
              <div className="csm-presets-row">
                {PRESETS.map((p) => (
                  <button key={p.name} className="csm-preset-btn" onClick={() => applyPreset(p)}>
                    <span className={`csm-preset-dot csm-${p.tag}`} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {SECTIONS.map((sec) => (
              <div className="csm-section-card" key={sec.num}>
                <h2>
                  <span className="csm-section-num">{sec.num}</span> {sec.title}
                </h2>
                <p className="csm-section-desc">{sec.desc}</p>
                <div className="csm-grid-2">
                  {sec.fields.map((fieldName) => (
                    <FormField key={fieldName} fieldName={fieldName} state={state} onChange={handleChange} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <ResultPanel
            score={score}
            proba={proba}
            decision={decision}
            contributions={contributions}
            onGrant={handleGrant}
            grantState={grantState}
            grantError={grantError}
          />
        </div>
      )}

      {tab === 'cartera' && <PortfolioView model={model} />}

      {tab === 'seguimiento' && <LoanTrackingView />}
    </div>
  )
}
