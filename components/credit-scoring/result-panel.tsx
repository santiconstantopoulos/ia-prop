'use client'

import { Contribution } from '@/lib/credit-scoring/engine'
import { Decision, DECISION_LABEL } from '@/lib/credit-scoring/engine'

export type GrantState = 'idle' | 'loading' | 'success' | 'error'

interface ResultPanelProps {
  score: number
  proba: number
  decision: Decision
  contributions: Contribution[]
  onGrant: () => void
  grantState: GrantState
  grantError?: string
}

function impactClass(points: number, maxAbs: number): string {
  const intensity = Math.abs(points) / Math.max(maxAbs, 1)
  const band = intensity >= 0.75 ? 'strong' : intensity >= 0.45 ? 'medium' : 'soft'
  return `csm-impact-${points >= 0 ? 'pos' : 'neg'}-${band}`
}

export function ResultPanel({
  score,
  proba,
  decision,
  contributions,
  onGrant,
  grantState,
  grantError,
}: ResultPanelProps) {
  const top = [...contributions].sort((a, b) => Math.abs(b.pts) - Math.abs(a.pts)).slice(0, 6)
  const maxAbs = Math.max(...top.map((c) => Math.abs(c.pts)), 1)

  return (
    <div className="csm-panel">
      <div className="csm-gauge-card">
        <div className="csm-eyebrow">Resultado de la evaluación</div>
        <div className="csm-score-value">{Math.round(score)}</div>
        <div className="csm-score-sub">Score crediticio (rango 300–700)</div>
        <div className={`csm-badge csm-${decision}`}>
          <span className="csm-dot" />
          <span>{DECISION_LABEL[decision]}</span>
        </div>
        <div className="csm-prob-row">
          <span className="csm-plabel">PROB. DE BUEN PAGADOR</span>
          <span className="csm-pval">{(proba * 100).toFixed(1)}%</span>
        </div>
        <div className="csm-grant-row">
          <button
            className="csm-grant-btn"
            onClick={onGrant}
            disabled={grantState === 'loading' || grantState === 'success'}
          >
            {grantState === 'loading' ? 'Otorgando…' : grantState === 'success' ? 'Crédito otorgado ✓' : 'Otorgar crédito'}
          </button>
          {grantState === 'error' && <div className="csm-grant-error">{grantError}</div>}
        </div>
      </div>

      <div className="csm-factors-card">
        <h3>Factores con mayor peso</h3>
        <p className="csm-section-desc">Contribución al score de esta solicitud puntual, en puntos.</p>
        <div>
          {top.map((c) => {
            const isPos = c.pts >= 0
            const impact = impactClass(c.pts, maxAbs)
            return (
              <div className="csm-factor-row" key={c.label}>
                <div className="csm-factor-label">
                  <span className="csm-fname">{c.label}</span>
                  <span className={`csm-fpts ${impact}`}>
                    {isPos ? '+' : ''}
                    {c.pts.toFixed(1)} pts
                  </span>
                </div>
                <div className="csm-factor-bar-bg">
                  <div
                    className={`csm-factor-bar-fill ${impact}`}
                    style={{ width: `${((Math.abs(c.pts) / maxAbs) * 100).toFixed(0)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="csm-footnote">
          Score calculado en vivo con los coeficientes reales de la Regresión Logística entrenada (método
          PDO — Points to Double the Odds, base 600 pts / odds 50:1). Corte sugerido: &lt;475 rechazar ·
          475–505 revisar · &gt;505 aprobar.
        </div>
      </div>
    </div>
  )
}
