'use client'

import { ApplicantState, CAT_LABELS, COL_LABELS, DATA, NUM_CONFIG } from '@/lib/credit-scoring/data'

interface FormFieldProps {
  fieldName: string
  state: ApplicantState
  onChange: (field: string, value: string | number) => void
}

export function FormField({ fieldName, state, onChange }: FormFieldProps) {
  const isCategorical = DATA.cat_cols.includes(fieldName)

  return (
    <div className="csm-field">
      <label htmlFor={`field-${fieldName}`}>{COL_LABELS[fieldName]}</label>
      {isCategorical ? (
        <select
          id={`field-${fieldName}`}
          value={String(state[fieldName])}
          onChange={(e) => onChange(fieldName, e.target.value)}
        >
          {DATA.cat_categories[fieldName].map((cat) => (
            <option key={cat} value={cat}>
              {CAT_LABELS[fieldName]?.[cat] ?? cat}
            </option>
          ))}
        </select>
      ) : (
        <NumberField fieldName={fieldName} state={state} onChange={onChange} />
      )}
    </div>
  )
}

function NumberField({ fieldName, state, onChange }: FormFieldProps) {
  const cfg = NUM_CONFIG[fieldName]
  const value = Number(state[fieldName])
  const display = cfg.format ? cfg.format(value) : `${value}${cfg.unit ? ' ' + cfg.unit : ''}`

  return (
    <div className="csm-range-row">
      <input
        id={`field-${fieldName}`}
        type="range"
        min={cfg.min}
        max={cfg.max}
        step={cfg.step}
        value={value}
        onChange={(e) => onChange(fieldName, Number(e.target.value))}
      />
      <span className="csm-range-val">{display}</span>
    </div>
  )
}
