'use client'

import { useEffect, useState } from 'react'
import type { ModelVersionSummary } from '@/app/api/model/versions/route'
import type { RetrainResponse } from '@/app/api/model/retrain/route'

interface ModelVersionsViewProps {
  onRetrained: () => void
}

type RetrainState = 'idle' | 'loading' | 'error'

export function ModelVersionsView({ onRetrained }: ModelVersionsViewProps) {
  const [versions, setVersions] = useState<ModelVersionSummary[] | null>(null)
  const [error, setError] = useState<string>()
  const [retrainState, setRetrainState] = useState<RetrainState>('idle')
  const [retrainError, setRetrainError] = useState<string>()
  const [lastResult, setLastResult] = useState<RetrainResponse | null>(null)

  const loadVersions = () => {
    fetch('/api/model/versions')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setVersions(data.versions)
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
  }

  useEffect(loadVersions, [])

  const handleRetrain = async () => {
    setRetrainState('loading')
    setRetrainError(undefined)
    try {
      const res = await fetch('/api/model/retrain', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al recalcular el modelo.')
      setLastResult(data as RetrainResponse)
      setRetrainState('idle')
      loadVersions()
      onRetrained()
    } catch (e) {
      setRetrainState('error')
      setRetrainError(e instanceof Error ? e.message : 'Error al recalcular el modelo.')
    }
  }

  if (error) {
    return (
      <div className="csm-cartera-wrap">
        <div className="csm-section-card">
          <h2>
            <span className="csm-section-num">MOD</span> Modelo
          </h2>
          <p className="csm-section-desc">
            {error} Configurá las variables de entorno de Supabase (ver .env.local.example) para
            habilitar esta pestaña.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="csm-cartera-wrap">
      <div className="csm-section-card">
        <h2>
          <span className="csm-section-num">MOD</span> Recalibración del modelo
        </h2>
        <p className="csm-section-desc">
          Reentrena la regresión logística de forma offline con el dataset base (1.000 solicitudes
          históricas) más todos los créditos otorgados que ya tienen un resultado real cargado
          (pagó o default). Crea una nueva versión del modelo y la activa; las evaluaciones
          siguientes usan los coeficientes recalibrados.
        </p>
        <button className="csm-load-btn" onClick={handleRetrain} disabled={retrainState === 'loading'}>
          {retrainState === 'loading' ? 'Recalculando…' : 'Recalcular modelo'}
        </button>
        {retrainState === 'error' && <div className="csm-grant-error">{retrainError}</div>}
      </div>

      {lastResult && (
        <div className="csm-section-card">
          <h2>
            <span className="csm-section-num">RESULT</span> Resultado de la recalibración
          </h2>
          <div className="csm-summary-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="csm-summary-stat">
              <div className="csm-slabel">AUC anterior</div>
              <div className="csm-sval">
                {lastResult.previousVersion?.auc != null ? lastResult.previousVersion.auc.toFixed(3) : '—'}
              </div>
            </div>
            <div className="csm-summary-stat csm-aprobar">
              <div className="csm-slabel">AUC nuevo</div>
              <div className="csm-sval">{lastResult.newVersion.auc?.toFixed(3) ?? '—'}</div>
            </div>
            <div className="csm-summary-stat">
              <div className="csm-slabel">Muestras de entrenamiento</div>
              <div className="csm-sval">{lastResult.newVersion.n_training_samples}</div>
            </div>
          </div>

          <p className="csm-section-desc" style={{ marginTop: '16px' }}>
            Variables cuyo coeficiente cambió más respecto de la versión anterior:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="csm-cartera-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Coef. anterior</th>
                  <th>Coef. nuevo</th>
                  <th>Δ</th>
                </tr>
              </thead>
              <tbody>
                {lastResult.topDeltas.map((d) => (
                  <tr key={d.feature}>
                    <td>{d.feature}</td>
                    <td className="csm-mono">{d.before != null ? d.before.toFixed(3) : '—'}</td>
                    <td className="csm-mono">{d.after.toFixed(3)}</td>
                    <td className={`csm-mono ${d.delta >= 0 ? 'csm-pos-text' : 'csm-neg-text'}`}>
                      {d.delta >= 0 ? '+' : ''}
                      {d.delta.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="csm-section-card">
        <h2>
          <span className="csm-section-num">HIST</span> Historial de versiones
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="csm-cartera-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>AUC</th>
                <th>Muestras</th>
                <th>Notas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {versions?.map((v) => (
                <tr key={v.id}>
                  <td className="csm-mono">{v.id}</td>
                  <td className="csm-mono">{new Date(v.created_at).toLocaleString('es-AR')}</td>
                  <td className="csm-mono">{v.auc != null ? v.auc.toFixed(3) : '—'}</td>
                  <td className="csm-mono">{v.n_training_samples ?? '—'}</td>
                  <td>{v.notes}</td>
                  <td>
                    {v.is_active ? (
                      <span className="csm-pill csm-aprobar">Activo</span>
                    ) : (
                      <span className="csm-pill csm-revisar">Histórico</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
