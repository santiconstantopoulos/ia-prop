export interface ScoredLabel {
  score: number
  label: 0 | 1
}

/**
 * AUC (Area Under the ROC Curve) via el metodo de rangos (equivalente a la U de
 * Mann-Whitney): AUC = (sum de rangos de la clase positiva - nPos*(nPos+1)/2) / (nPos*nNeg).
 * Empates se resuelven con el rango promedio. Devuelve null si falta alguna clase.
 */
export function computeAUC(items: ScoredLabel[]): number | null {
  const nPos = items.filter((i) => i.label === 1).length
  const nNeg = items.length - nPos
  if (nPos === 0 || nNeg === 0) return null

  const sorted = [...items].sort((a, b) => a.score - b.score)
  const ranks = new Array<number>(sorted.length)

  let i = 0
  while (i < sorted.length) {
    let j = i
    while (j + 1 < sorted.length && sorted[j + 1].score === sorted[i].score) j++
    const avgRank = (i + j) / 2 + 1 // rango 1-indexado
    for (let k = i; k <= j; k++) ranks[k] = avgRank
    i = j + 1
  }

  let rankSumPos = 0
  sorted.forEach((item, idx) => {
    if (item.label === 1) rankSumPos += ranks[idx]
  })

  return (rankSumPos - (nPos * (nPos + 1)) / 2) / (nPos * nNeg)
}
