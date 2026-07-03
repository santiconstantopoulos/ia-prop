'use client'

import { useEffect, useState } from 'react'
import { CAT_LABELS, formatARS } from '@/lib/credit-scoring/data'
import { DECISION_LABEL } from '@/lib/credit-scoring/engine'
import { computeAUC } from '@/lib/credit-scoring/metrics'
import type { LoanApplicationRow } from '@/app/api/applications/route'

type Outcome = LoanApplicationRow['outcome']

function matches(app: LoanApplicationRow): boolean {
  if (app.outcome === 'pending') return false
  const actualGood = app.outcome === 'paid'
  return app.decision === 'rechazar' ? !actualGood : actualGood
}

export function LoanTrackingView() {
  const [apps, setApps] = useState<LoanApplicationRow[] | null>(null)
  const [error, setError] = useState<string>()

  const load = () => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setApps(data.applications)
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
  }

  useEffect(load, [])

  const handleOutcomeChange = async (id: string, outcome: Outcome) => {
    setApps((prev) => prev?.map((a) => (a.id === id ? { ...a, outcome } : a)) ?? null)
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome }),
    })
    load()
  }

  if (error) {
    return (
      <div className="csm-cartera-wrap">
        <div className="csm-section-card">
          <h2>
            <span className="csm-section-num">SEG</span> Seguimiento de créditos
          </h2>
          <p className="csm-section-desc">
            {error} Configurá las variables de entorno de Supabase (ver .env.local.example) para
            habilitar esta pestaña.
          </p>
        </div>
      </div>
    )
  }

  if (!apps) {
    return (
      <div className="csm-cartera-wrap">
        <div className="csm-section-card">
          <p className="csm-section-desc">Cargando…</p>
        </div>
      </div>
    )
  }

  const resolved = apps.filter((a) => a.outcome !== 'pending')
  const matchCount = resolved.filter(matches).length
  const matchRate = resolved.length > 0 ? (matchCount / resolved.length) * 100 : null
  const auc = computeAUC(resolved.map((a) => ({ score: a.probability, label: a.outcome === 'paid' ? 1 : 0 })))

  return (
    <div className="csm-cartera-wrap">
      <div className="csm-section-card">
        <h2>
          <span className="csm-section-num">SEG</span> Seguimiento de créditos otorgados
        </h2>
        <p className="csm-section-desc">
          Marcá el resultado real de cada crédito otorgado a medida que se conoce (pagó a término o
          entró en default). Con esos datos se mide qué tan bien está prediciendo el modelo hoy, y se
          usan como insumo para recalibrarlo.
        </p>
      </div>

      <div className="csm-summary-row">
        <div className="csm-summary-stat">
          <div className="csm-slabel">Créditos otorgados</div>
          <div className="csm-sval">{apps.length}</div>
        </div>
        <div className="csm-summary-stat">
          <div className="csm-slabel">Con resultado conocido</div>
          <div className="csm-sval">{resolved.length}</div>
        </div>
        <div className="csm-summary-stat">
          <div className="csm-slabel">Tasa de acierto</div>
          <div className="csm-sval">{matchRate != null ? `${matchRate.toFixed(0)}%` : '—'}</div>
        </div>
        <div className="csm-summary-stat">
          <div className="csm-slabel">AUC en producción</div>
          <div className="csm-sval">{auc != null ? auc.toFixed(3) : '—'}</div>
        </div>
      </div>

      <div className="csm-section-card">
        <h2>
          <span className="csm-section-num">TABLA</span> Créditos otorgados
        </h2>
        <p className="csm-section-desc">Ordenados del más reciente al más antiguo.</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="csm-cartera-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Perfil</th>
                <th>Monto</th>
                <th>Score</th>
                <th>Decisión</th>
                <th>Resultado real</th>
                <th>Coincide</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td className="csm-mono">{new Date(a.created_at).toLocaleDateString('es-AR')}</td>
                  <td>{CAT_LABELS.purpose?.[String(a.features.purpose)] ?? String(a.features.purpose)}</td>
                  <td className="csm-mono">{formatARS(Number(a.features.amount))}</td>
                  <td className="csm-mono">{a.score}</td>
                  <td>
                    <span className={`csm-pill csm-${a.decision}`}>{DECISION_LABEL[a.decision]}</span>
                  </td>
                  <td>
                    <select
                      value={a.outcome}
                      onChange={(e) => handleOutcomeChange(a.id, e.target.value as Outcome)}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagó</option>
                      <option value="default">Default</option>
                    </select>
                  </td>
                  <td className={a.outcome === 'pending' ? '' : matches(a) ? 'csm-match-ok' : 'csm-match-bad'}>
                    {a.outcome === 'pending' ? '—' : matches(a) ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={7} className="csm-section-desc">
                    Todavía no se otorgó ningún crédito. Hacelo desde la pestaña &quot;Evaluación
                    individual&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
