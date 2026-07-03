import { ApplicantState, DATA, ScorecardRow, ScoringModel } from './data'

export type Decision = 'aprobar' | 'revisar' | 'rechazar'

export const DECISION_LABEL: Record<Decision, string> = {
  aprobar: 'Aprobar',
  revisar: 'Revisar',
  rechazar: 'Rechazar',
}

export function decisionOf(score: number): Decision {
  if (score >= 505) return 'aprobar'
  if (score >= 475) return 'revisar'
  return 'rechazar'
}

function findRow(model: ScoringModel, featureName: string): ScorecardRow | undefined {
  return model.scorecard.find((r) => r.feature === featureName)
}

export interface Contribution {
  label: string
  pts: number
}

export interface ScoreResult {
  score: number
  proba: number
  contributions: Contribution[]
}

/** Calcula score + probabilidad + contribución de cada variable, con etiquetas legibles. */
export function computeScore(
  model: ScoringModel,
  state: ApplicantState,
  colLabels: Record<string, string>,
  catLabels: Record<string, Record<string, string>>,
  numConfig: Record<string, { unit?: string }>,
): ScoreResult {
  let logit = model.intercept
  const contributions: Contribution[] = []

  model.num_cols.forEach((c) => {
    const { mean, std } = model.num_info[c]
    const value = Number(state[c])
    const z = (value - mean) / std
    const row = findRow(model, c)
    if (!row) return
    const pts = row.coef * z * model.factor
    logit += row.coef * z
    const unit = numConfig[c]?.unit
    contributions.push({
      label: `${colLabels[c]}: ${value}${unit ? ' ' + unit : ''}`,
      pts,
    })
  })

  model.cat_cols.forEach((c) => {
    const cat = String(state[c])
    const baseline = model.cat_categories[c][0]
    if (cat === baseline) return
    const row = findRow(model, `${c}_${cat}`)
    if (!row) return
    logit += row.coef
    contributions.push({
      label: `${colLabels[c]}: ${(catLabels[c] && catLabels[c][cat]) || cat}`,
      pts: row.coef * model.factor,
    })
  })

  const score = model.offset + model.factor * logit
  const proba = 1 / (1 + Math.exp(-logit))
  return { score, proba, contributions }
}

export interface ScoreOnly {
  score: number
  proba: number
}

/** Igual que computeScore pero sin desglose de factores, para procesar lotes/carteras. */
export function computeScoreFor(model: ScoringModel, applicantState: ApplicantState): ScoreOnly {
  let logit = model.intercept

  model.num_cols.forEach((c) => {
    const { mean, std } = model.num_info[c]
    const z = (Number(applicantState[c]) - mean) / std
    const row = findRow(model, c)
    if (row) logit += row.coef * z
  })

  model.cat_cols.forEach((c) => {
    const cat = String(applicantState[c])
    const baseline = model.cat_categories[c][0]
    if (cat === baseline) return
    const row = findRow(model, `${c}_${cat}`)
    if (row) logit += row.coef
  })

  const score = model.offset + model.factor * logit
  const proba = 1 / (1 + Math.exp(-logit))
  return { score, proba }
}

/** Modelo por defecto (fallback) cuando no hay conexion a la DB o falla el fetch. */
export const DEFAULT_MODEL: ScoringModel = DATA
