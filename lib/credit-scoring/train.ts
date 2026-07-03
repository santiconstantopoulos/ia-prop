import { ApplicantState, DATA, NumColInfo, ScorecardRow, ScoringModel } from './data'
import { computeAUC } from './metrics'

// Convencion PDO (Points to Double the Odds) del scorecard: score = offset + factor*logit.
// Mismos parametros que usa el modelo base (ver footnote en la UI: "base 600 pts / odds 50:1").
const PDO = 20
const BASE_SCORE = 600
const BASE_ODDS = 50
const FACTOR = PDO / Math.log(2)
const OFFSET = BASE_SCORE - FACTOR * Math.log(BASE_ODDS)

export interface TrainingExample {
  features: ApplicantState
  label: 0 | 1 // 1 = buen pagador, 0 = default
}

export interface TrainOptions {
  testFraction?: number
  learningRate?: number
  iterations?: number
  l2?: number
  /** Semilla para el shuffle del split train/test (reproducibilidad). */
  seed?: number
}

export interface TrainResult {
  model: ScoringModel
  auc: number | null
  nTrain: number
  nTest: number
}

/** PRNG determinístico (mulberry32) para que el split train/test sea reproducible. */
function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

interface DesignMatrix {
  columns: string[] // orden de las columnas de X (numericas + dummies), sin intercept
  X: number[][]
  y: number[]
}

function buildDesignMatrix(
  examples: TrainingExample[],
  numInfo: Record<string, NumColInfo>,
): DesignMatrix {
  const numColumns = DATA.num_cols
  const dummyColumns: string[] = []
  DATA.cat_cols.forEach((c) => {
    DATA.cat_categories[c].slice(1).forEach((cat) => dummyColumns.push(`${c}_${cat}`))
  })
  const columns = [...numColumns, ...dummyColumns]

  const X = examples.map((ex) => {
    const row: number[] = []
    numColumns.forEach((c) => {
      const { mean, std } = numInfo[c]
      row.push((Number(ex.features[c]) - mean) / std)
    })
    DATA.cat_cols.forEach((c) => {
      DATA.cat_categories[c].slice(1).forEach((cat) => {
        row.push(String(ex.features[c]) === cat ? 1 : 0)
      })
    })
    return row
  })

  const y = examples.map((ex) => ex.label)
  return { columns, X, y }
}

function computeNumInfo(examples: TrainingExample[]): Record<string, NumColInfo> {
  const info: Record<string, NumColInfo> = {}
  DATA.num_cols.forEach((c) => {
    const values = examples.map((ex) => Number(ex.features[c]))
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
    info[c] = { mean, std: Math.sqrt(variance) }
  })
  return info
}

/** Regresión logística por descenso de gradiente batch, con regularización L2. */
function gradientDescent(
  X: number[][],
  y: number[],
  learningRate: number,
  iterations: number,
  l2: number,
): { weights: number[]; intercept: number } {
  const n = X.length
  const p = X[0].length
  let weights = new Array(p).fill(0)
  let intercept = 0

  for (let it = 0; it < iterations; it++) {
    const gradW = new Array(p).fill(0)
    let gradB = 0

    for (let i = 0; i < n; i++) {
      let z = intercept
      for (let j = 0; j < p; j++) z += weights[j] * X[i][j]
      const err = sigmoid(z) - y[i]
      for (let j = 0; j < p; j++) gradW[j] += err * X[i][j]
      gradB += err
    }

    for (let j = 0; j < p; j++) {
      weights[j] -= learningRate * (gradW[j] / n + l2 * weights[j])
    }
    intercept -= learningRate * (gradB / n)
  }

  return { weights, intercept }
}

/**
 * Entrena una regresión logística sobre `examples` (mismo esquema de 20 variables que
 * el motor de scoring), reconstruye el scorecard en escala PDO, y evalúa el AUC en un
 * split de test held-out. Usado tanto para validar paridad con el modelo base (Etapa 6)
 * como para la recalibración en vivo (Etapa 7).
 */
export function trainModel(examples: TrainingExample[], opts: TrainOptions = {}): TrainResult {
  const testFraction = opts.testFraction ?? 0.3
  const learningRate = opts.learningRate ?? 0.5
  const iterations = opts.iterations ?? 1500
  const l2 = opts.l2 ?? 0.01
  const seed = opts.seed ?? 42

  const rand = mulberry32(seed)
  const shuffled = shuffle(examples, rand)
  const nTest = Math.round(shuffled.length * testFraction)
  const testSet = shuffled.slice(0, nTest)
  const trainSet = shuffled.slice(nTest)

  const numInfo = computeNumInfo(trainSet)
  const { columns, X, y } = buildDesignMatrix(trainSet, numInfo)
  const { weights, intercept } = gradientDescent(X, y, learningRate, iterations, l2)

  const scorecard: ScorecardRow[] = columns.map((feature, idx) => ({
    feature,
    coef: weights[idx],
    points: weights[idx] * FACTOR,
  }))

  const model: ScoringModel = {
    intercept,
    offset: OFFSET,
    factor: FACTOR,
    num_cols: DATA.num_cols,
    num_info: numInfo,
    cat_cols: DATA.cat_cols,
    cat_categories: DATA.cat_categories,
    scorecard,
  }

  // AUC en el split de test, usando la probabilidad predicha por el modelo recien entrenado.
  const { X: testX } = buildDesignMatrix(testSet, numInfo)
  const scored = testSet.map((ex, i) => {
    let z = intercept
    for (let j = 0; j < testX[i].length; j++) z += weights[j] * testX[i][j]
    return { score: sigmoid(z), label: ex.label }
  })
  const auc = computeAUC(scored)

  return { model, auc, nTrain: trainSet.length, nTest: testSet.length }
}
