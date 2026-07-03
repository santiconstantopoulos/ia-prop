import { ApplicantState, DATA, ScorecardRow } from './data'

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

function findRow(featureName: string): ScorecardRow | undefined {
  return DATA.scorecard.find((r) => r.feature === featureName)
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
  state: ApplicantState,
  colLabels: Record<string, string>,
  catLabels: Record<string, Record<string, string>>,
  numConfig: Record<string, { unit?: string }>,
): ScoreResult {
  let logit = DATA.intercept
  const contributions: Contribution[] = []

  DATA.num_cols.forEach((c) => {
    const { mean, std } = DATA.num_info[c]
    const value = Number(state[c])
    const z = (value - mean) / std
    const row = findRow(c)
    if (!row) return
    const pts = row.coef * z * DATA.factor
    logit += row.coef * z
    const unit = numConfig[c]?.unit
    contributions.push({
      label: `${colLabels[c]}: ${value}${unit ? ' ' + unit : ''}`,
      pts,
    })
  })

  DATA.cat_cols.forEach((c) => {
    const cat = String(state[c])
    const baseline = DATA.cat_categories[c][0]
    if (cat === baseline) return
    const row = findRow(`${c}_${cat}`)
    if (!row) return
    logit += row.coef
    contributions.push({
      label: `${colLabels[c]}: ${(catLabels[c] && catLabels[c][cat]) || cat}`,
      pts: row.coef * DATA.factor,
    })
  })

  const score = DATA.offset + DATA.factor * logit
  const proba = 1 / (1 + Math.exp(-logit))
  return { score, proba, contributions }
}

export interface ScoreOnly {
  score: number
  proba: number
}

/** Igual que computeScore pero sin desglose de factores, para procesar lotes/carteras. */
export function computeScoreFor(applicantState: ApplicantState): ScoreOnly {
  let logit = DATA.intercept

  DATA.num_cols.forEach((c) => {
    const { mean, std } = DATA.num_info[c]
    const z = (Number(applicantState[c]) - mean) / std
    const row = findRow(c)
    if (row) logit += row.coef * z
  })

  DATA.cat_cols.forEach((c) => {
    const cat = String(applicantState[c])
    const baseline = DATA.cat_categories[c][0]
    if (cat === baseline) return
    const row = findRow(`${c}_${cat}`)
    if (row) logit += row.coef
  })

  const score = DATA.offset + DATA.factor * logit
  const proba = 1 / (1 + Math.exp(-logit))
  return { score, proba }
}
