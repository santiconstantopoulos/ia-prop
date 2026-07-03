'use client'

import { Contribution } from '@/lib/credit-scoring/engine'
import { Decision, DECISION_LABEL } from '@/lib/credit-scoring/engine'

interface ResultPanelProps {
  score: number
  proba: number
  decision: Decision
  contributions: Contribution[]
}

export function ResultPanel({ score, proba, decision, contributions }: ResultPanelProps) {
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
      </div>

      <div className="csm-factors-card">
        <h3>Factores con mayor peso</h3>
        <p className="csm-section-desc">Contribución al score de esta solicitud puntual, en puntos.</p>
        <div>
          {top.map((c) => {
            const isPos = c.pts >= 0
            return (
              <div className="csm-factor-row" key={c.label}>
                <div className="csm-factor-label">
                  <span className="csm-fname">{c.label}</span>
                  <span className={`csm-fpts ${isPos ? 'csm-pos-text' : 'csm-neg-text'}`}>
                    {isPos ? '+' : ''}
                    {c.pts.toFixed(1)} pts
                  </span>
                </div>
                <div className="csm-factor-bar-bg">
                  <div
                    className={`csm-factor-bar-fill ${isPos ? 'csm-pos' : 'csm-neg'}`}
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
