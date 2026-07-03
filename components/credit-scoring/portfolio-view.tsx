'use client'

import { useState } from 'react'
import { CAT_LABELS, formatARS, PORTFOLIO, PortfolioApplicant } from '@/lib/credit-scoring/data'
import { computeScoreFor, decisionOf, Decision, DECISION_LABEL } from '@/lib/credit-scoring/engine'

interface ResultRow {
  rec: PortfolioApplicant
  score: number
  proba: number
  decision: Decision
  actualLabel: string
  matches: boolean
}

function evaluatePortfolio(): ResultRow[] {
  const results = PORTFOLIO.map((rec) => {
    const { score, proba } = computeScoreFor(rec)
    const decision = decisionOf(score)
    const actualLabel = rec.actual === 1 ? 'Buen pagador' : 'Default'
    const matches = (decision === 'rechazar' && rec.actual === 0) || (decision !== 'rechazar' && rec.actual === 1)
    return { rec, score, proba, decision, actualLabel, matches }
  })
  results.sort((a, b) => a.score - b.score)
  return results
}

export function PortfolioView() {
  const [results, setResults] = useState<ResultRow[] | null>(null)

  const counts = { aprobar: 0, revisar: 0, rechazar: 0 }
  results?.forEach((r) => counts[r.decision]++)

  return (
    <div className="csm-cartera-wrap">
      <div className="csm-section-card">
        <h2>
          <span className="csm-section-num">LOTE</span> Cartera de solicitudes
        </h2>
        <p className="csm-section-desc">
          20 solicitudes reales tomadas del set de test (no usadas para entrenar el modelo), con su
          resultado histórico conocido. Simula la cola de solicitudes que el área de créditos procesaría
          en un día.
        </p>
        <button className="csm-load-btn" onClick={() => setResults(evaluatePortfolio())}>
          Cargar cartera de ejemplo (20 solicitudes)
        </button>
      </div>

      {results && (
        <div className="csm-summary-row">
          <div className="csm-summary-stat">
            <div className="csm-slabel">Solicitudes procesadas</div>
            <div className="csm-sval">{results.length}</div>
          </div>
          <div className="csm-summary-stat csm-aprobar">
            <div className="csm-slabel">Aprobar</div>
            <div className="csm-sval">{counts.aprobar}</div>
          </div>
          <div className="csm-summary-stat csm-revisar">
            <div className="csm-slabel">Revisar</div>
            <div className="csm-sval">{counts.revisar}</div>
          </div>
          <div className="csm-summary-stat csm-rechazar">
            <div className="csm-slabel">Rechazar</div>
            <div className="csm-sval">{counts.rechazar}</div>
          </div>
        </div>
      )}

      {results && (
        <div className="csm-section-card">
          <h2>
            <span className="csm-section-num">TABLA</span> Resultado por solicitud
          </h2>
          <p className="csm-section-desc">
            Ordenado de menor a mayor score. &quot;Coincide&quot; compara la decisión sugerida por el
            modelo contra el resultado real.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="csm-cartera-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Perfil</th>
                  <th>Monto</th>
                  <th>Plazo</th>
                  <th>Score</th>
                  <th>Prob.</th>
                  <th>Decisión modelo</th>
                  <th>Resultado real</th>
                  <th>Coincide</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td className="csm-mono">{idx + 1}</td>
                    <td>{CAT_LABELS.purpose?.[String(r.rec.purpose)] ?? r.rec.purpose}</td>
                    <td className="csm-mono">{formatARS(Number(r.rec.amount))}</td>
                    <td className="csm-mono">{r.rec.duration} m</td>
                    <td className="csm-mono">{Math.round(r.score)}</td>
                    <td className="csm-mono">{(r.proba * 100).toFixed(0)}%</td>
                    <td>
                      <span className={`csm-pill csm-${r.decision}`}>{DECISION_LABEL[r.decision]}</span>
                    </td>
                    <td>{r.actualLabel}</td>
                    <td className={r.matches ? 'csm-match-ok' : 'csm-match-bad'}>
                      {r.matches ? '✓' : '✗'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
