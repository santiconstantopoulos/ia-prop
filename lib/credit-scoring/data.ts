// Modelo de scoring crediticio (Regresión Logística, método PDO) entrenado sobre
// el dataset German Credit (1.000 solicitudes históricas). Coeficientes y estadísticas
// portados desde el artefacto original "Motor de Scoring Crediticio".

export interface NumColInfo {
  mean: number
  std: number
}

export interface ScorecardRow {
  feature: string
  coef: number
  points: number
}

export interface ScoringModel {
  intercept: number
  offset: number
  factor: number
  num_cols: string[]
  num_info: Record<string, NumColInfo>
  cat_cols: string[]
  cat_categories: Record<string, string[]>
  scorecard: ScorecardRow[]
}

export const DATA: ScoringModel = {
  intercept: -1.2538466727023883,
  offset: 487.1228762045055,
  factor: 28.85390081777927,
  num_cols: [
    'duration',
    'amount',
    'installment_rate',
    'present_residence',
    'age',
    'number_credits',
    'people_liable',
  ],
  num_info: {
    duration: { mean: 20.981333333333332, std: 12.243623574016894 },
    amount: { mean: 2092699.2666666666, std: 1815432.9105522265 },
    installment_rate: { mean: 2.978666666666667, std: 1.1181285952678053 },
    present_residence: { mean: 2.8306666666666667, std: 1.11085232541904 },
    age: { mean: 35.296, std: 11.321265418082321 },
    number_credits: { mean: 1.412, std: 0.5653223269368841 },
    people_liable: { mean: 1.1613333333333333, std: 0.3678381286502106 },
  },
  cat_cols: [
    'status',
    'credit_history',
    'purpose',
    'savings',
    'employment_duration',
    'personal_status_sex',
    'other_debtors',
    'property',
    'other_installment_plans',
    'housing',
    'job',
    'telephone',
    'foreign_worker',
  ],
  cat_categories: {
    status: [
      '... < 100 DM',
      '... >= 200 DM / salary for at least 1 year',
      '0 <= ... < 200 DM',
      'no checking account',
    ],
    credit_history: [
      'all credits at this bank paid back duly',
      'critical account/other credits existing',
      'delay in paying off in the past',
      'existing credits paid back duly till now',
      'no credits taken/all credits paid back duly',
    ],
    purpose: [
      'business',
      'car (new)',
      'car (used)',
      'domestic appliances',
      'education',
      'furniture/equipment',
      'others',
      'radio/television',
      'repairs',
      'retraining',
    ],
    savings: [
      '... < 100 DM',
      '... >= 1000 DM',
      '100 <= ... < 500 DM',
      '500 <= ... < 1000 DM',
      'unknown/no savings account',
    ],
    employment_duration: [
      '... < 1 year',
      '... >= 7 years',
      '1 <= ... < 4 years',
      '4 <= ... < 7 years',
      'unemployed',
    ],
    personal_status_sex: [
      'female : divorced/separated/married',
      'male : divorced/separated',
      'male : married/widowed',
      'male : single',
    ],
    other_debtors: ['co-applicant', 'guarantor', 'none'],
    property: [
      'building society savings agreement/life insurance',
      'car or other',
      'real estate',
      'unknown/no property',
    ],
    other_installment_plans: ['bank', 'none', 'stores'],
    housing: ['for free', 'own', 'rent'],
    job: [
      'management/self-employed/highly qualified employee/officer',
      'skilled employee/official',
      'unemployed/unskilled - non-resident',
      'unskilled - resident',
    ],
    telephone: ['no', 'yes'],
    foreign_worker: ['no', 'yes'],
  },
  scorecard: [
    { feature: 'duration', coef: -0.3047603640234697, points: -8.7935253167235 },
    { feature: 'amount', coef: -0.3651832330123951, points: -10.536960785655625 },
    { feature: 'installment_rate', coef: -0.23880945653430355, points: -6.890584373188564 },
    { feature: 'present_residence', coef: -0.02180525253514502, points: -0.6291665939557044 },
    { feature: 'age', coef: 0.19200371433110194, points: 5.54005612995484 },
    { feature: 'number_credits', coef: 0.013968139127040504, points: 0.4030353009805686 },
    { feature: 'people_liable', coef: 0.02672719303192353, points: 0.7711837768807627 },
    {
      feature: 'status_... >= 200 DM / salary for at least 1 year',
      coef: 0.9398516499575376,
      points: 27.11838629130099,
    },
    { feature: 'status_0 <= ... < 200 DM', coef: 0.3400796356594442, points: 9.812624077464113 },
    { feature: 'status_no checking account', coef: 1.572218812984095, points: 45.36464569368973 },
    {
      feature: 'credit_history_critical account/other credits existing',
      coef: 1.077526112270888,
      points: 31.09083157203149,
    },
    {
      feature: 'credit_history_delay in paying off in the past',
      coef: 0.16899880255677027,
      points: 4.876274687296511,
    },
    {
      feature: 'credit_history_existing credits paid back duly till now',
      coef: 0.2150643593962676,
      points: 6.205445695459141,
    },
    {
      feature: 'credit_history_no credits taken/all credits paid back duly',
      coef: -0.2769330530298081,
      points: -7.99059884528689,
    },
    { feature: 'purpose_car (new)', coef: -0.7155337032006508, points: -20.645938503929887 },
    { feature: 'purpose_car (used)', coef: 1.4401882789989415, points: 41.55504976116368 },
    { feature: 'purpose_domestic appliances', coef: 0.21424586401892187, points: 6.181828911021396 },
    { feature: 'purpose_education', coef: -0.6820547043055094, points: -19.679938790330937 },
    { feature: 'purpose_furniture/equipment', coef: -0.10111335217107749, points: -2.917514634897456 },
    { feature: 'purpose_others', coef: 0.023376840870042163, points: 0.6745130478972055 },
    { feature: 'purpose_radio/television', coef: 0.08726091750765727, points: 2.5178178590343614 },
    { feature: 'purpose_repairs', coef: 0.053256754266320955, points: 1.5366651054772678 },
    { feature: 'purpose_retraining', coef: -0.9739750372116329, points: -28.10297912269733 },
    { feature: 'savings_... >= 1000 DM', coef: 1.0192086463028074, points: 29.408145193044277 },
    { feature: 'savings_100 <= ... < 500 DM', coef: 0.3831980194996003, points: 11.056757648210914 },
    { feature: 'savings_500 <= ... < 1000 DM', coef: 0.550017073029338, points: 15.870138073273775 },
    { feature: 'savings_unknown/no savings account', coef: 0.8008300708952264, points: 23.107071437506004 },
    {
      feature: 'employment_duration_... >= 7 years',
      coef: 0.05943222924786575,
      points: 1.7148516480974387,
    },
    {
      feature: 'employment_duration_1 <= ... < 4 years',
      coef: 0.12054675264212716,
      points: 3.478244044641308,
    },
    {
      feature: 'employment_duration_4 <= ... < 7 years',
      coef: 0.7057069907511779,
      points: 20.36239951754796,
    },
    {
      feature: 'employment_duration_unemployed',
      coef: -0.07842235225355655,
      points: -2.2627907738210693,
    },
    {
      feature: 'personal_status_sex_male : divorced/separated',
      coef: -0.1429204991285303,
      points: -4.1238139066821216,
    },
    {
      feature: 'personal_status_sex_male : married/widowed',
      coef: 0.21831758093571954,
      points: 6.29931382709675,
    },
    {
      feature: 'personal_status_sex_male : single',
      coef: 0.3766597409313037,
      points: 10.868102806882272,
    },
    { feature: 'other_debtors_guarantor', coef: 1.1340375930240205, points: 32.72140823274822 },
    { feature: 'other_debtors_none', coef: 0.20245506120315065, points: 5.841618256013141 },
    { feature: 'property_car or other', coef: 0.16352086481013753, points: 4.7182148148692 },
    { feature: 'property_real estate', coef: 0.30256097970054735, points: 8.73006449960972 },
    { feature: 'property_unknown/no property', coef: -0.4754677570296656, points: -13.719099503385943 },
    {
      feature: 'other_installment_plans_none',
      coef: 0.6913114212015119,
      points: 19.947031181546453,
    },
    {
      feature: 'other_installment_plans_stores',
      coef: -0.18064067969651465,
      points: -5.212188255619467,
    },
    { feature: 'housing_own', coef: 0.03821091613204836, points: 1.1025339842306054 },
    { feature: 'housing_rent', coef: -0.39967253270947295, points: -11.532111618389774 },
    {
      feature: 'job_skilled employee/official',
      coef: -0.20510867272467667,
      points: -5.918185299664168,
    },
    {
      feature: 'job_unemployed/unskilled - non-resident',
      coef: -0.22830670505045939,
      points: -6.58753902355994,
    },
    { feature: 'job_unskilled - resident', coef: -0.04697407288313293, points: -1.355385239977052 },
    { feature: 'telephone_yes', coef: 0.3734708797965782, points: 10.776091723979231 },
    { feature: 'foreign_worker_yes', coef: -1.0738934346322604, points: -30.986014651743567 },
  ],
}

export const COL_LABELS: Record<string, string> = {
  status: 'Estado de cuenta corriente',
  duration: 'Plazo del crédito (meses)',
  credit_history: 'Historial crediticio',
  purpose: 'Propósito del crédito',
  amount: 'Monto solicitado',
  savings: 'Cuenta de ahorros',
  employment_duration: 'Antigüedad laboral',
  installment_rate: 'Cuota (% del ingreso)',
  personal_status_sex: 'Estado civil / género',
  other_debtors: 'Codeudores / garantes',
  present_residence: 'Años en residencia actual',
  property: 'Propiedad',
  age: 'Edad',
  other_installment_plans: 'Otros planes de cuotas',
  housing: 'Vivienda',
  number_credits: 'Créditos vigentes en el banco',
  job: 'Situación laboral',
  people_liable: 'Personas a cargo',
  telephone: 'Teléfono registrado',
  foreign_worker: 'Trabajador extranjero',
}

export const CAT_LABELS: Record<string, Record<string, string>> = {
  status: {
    'no checking account': 'Sin cuenta corriente',
    '... < 100 DM': 'Cuenta corriente < $65.000',
    '0 <= ... < 200 DM': 'Cuenta corriente entre $0 y $130.000',
    '... >= 200 DM / salary for at least 1 year': 'Cuenta ≥ $130.000 o nómina domiciliada',
  },
  credit_history: {
    'no credits taken/all credits paid back duly': 'Sin créditos previos / todos pagados',
    'all credits at this bank paid back duly': 'Todos los créditos en este banco, pagados',
    'existing credits paid back duly till now': 'Créditos actuales al día',
    'delay in paying off in the past': 'Atrasos en el pasado',
    'critical account/other credits existing': 'Cuenta crítica / otros créditos vigentes',
  },
  purpose: {
    'car (new)': 'Auto 0km',
    'car (used)': 'Auto usado',
    'furniture/equipment': 'Muebles / equipamiento',
    'radio/television': 'Electrónica (TV/audio)',
    'domestic appliances': 'Electrodomésticos',
    repairs: 'Refacciones',
    education: 'Educación',
    retraining: 'Recapacitación laboral',
    business: 'Negocio propio',
    others: 'Otros',
  },
  savings: {
    '... < 100 DM': 'Ahorros < $65.000',
    '100 <= ... < 500 DM': 'Ahorros entre $65.000 y $325.000',
    '500 <= ... < 1000 DM': 'Ahorros entre $325.000 y $650.000',
    '... >= 1000 DM': 'Ahorros ≥ $650.000',
    'unknown/no savings account': 'Sin cuenta de ahorros',
  },
  employment_duration: {
    unemployed: 'Desempleado',
    '... < 1 year': 'Menos de 1 año',
    '1 <= ... < 4 years': '1 a 4 años',
    '4 <= ... < 7 years': '4 a 7 años',
    '... >= 7 years': '7 años o más',
  },
  personal_status_sex: {
    'male : single': 'Hombre soltero',
    'female : divorced/separated/married': 'Mujer (divorciada / separada / casada)',
    'male : married/widowed': 'Hombre casado / viudo',
    'male : divorced/separated': 'Hombre divorciado / separado',
  },
  other_debtors: {
    none: 'Ninguno',
    'co-applicant': 'Co-solicitante',
    guarantor: 'Garante',
  },
  property: {
    'real estate': 'Inmueble',
    'building society savings agreement/life insurance': 'Seguro de vida / ahorro previsional',
    'car or other': 'Auto u otro bien',
    'unknown/no property': 'Sin propiedad registrada',
  },
  other_installment_plans: {
    none: 'Ninguno',
    bank: 'Otro banco',
    stores: 'Financiera / comercio',
  },
  housing: {
    own: 'Propia',
    rent: 'Alquiler',
    'for free': 'Cedida / gratuita',
  },
  job: {
    'unemployed/unskilled - non-resident': 'Desempleado / no calificado, no residente',
    'unskilled - resident': 'No calificado, residente',
    'skilled employee/official': 'Empleado calificado',
    'management/self-employed/highly qualified employee/officer': 'Gerencial / autónomo / alta calificación',
  },
  telephone: { yes: 'Sí', no: 'No' },
  foreign_worker: { yes: 'Sí', no: 'No' },
}

export interface NumFieldConfig {
  min: number
  max: number
  step: number
  def: number
  unit?: string
  format?: (n: number) => string
}

export function formatARS(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-AR')
}

export const NUM_CONFIG: Record<string, NumFieldConfig> = {
  duration: { min: 4, max: 72, step: 1, def: 24, unit: 'meses' },
  amount: { min: 150000, max: 12000000, step: 10000, def: 1950000, format: formatARS },
  installment_rate: { min: 1, max: 4, step: 1, def: 3, unit: '' },
  present_residence: { min: 1, max: 4, step: 1, def: 2, unit: 'años' },
  age: { min: 19, max: 75, step: 1, def: 35, unit: 'años' },
  number_credits: { min: 1, max: 4, step: 1, def: 1, unit: '' },
  people_liable: { min: 1, max: 2, step: 1, def: 1, unit: '' },
}

export interface FormSection {
  num: string
  title: string
  desc: string
  fields: string[]
}

export const SECTIONS: FormSection[] = [
  {
    num: '01',
    title: 'Cuenta y ahorros',
    desc: 'Relación actual del solicitante con el sistema bancario.',
    fields: ['status', 'savings', 'employment_duration'],
  },
  {
    num: '02',
    title: 'Crédito solicitado',
    desc: 'Condiciones del préstamo que se está evaluando.',
    fields: ['amount', 'duration', 'purpose', 'installment_rate', 'other_installment_plans'],
  },
  {
    num: '03',
    title: 'Perfil del solicitante',
    desc: 'Datos personales y situación laboral.',
    fields: [
      'age',
      'personal_status_sex',
      'job',
      'housing',
      'present_residence',
      'people_liable',
      'telephone',
      'foreign_worker',
    ],
  },
  {
    num: '04',
    title: 'Historial y garantías',
    desc: 'Antecedentes crediticios y respaldo de la operación.',
    fields: ['credit_history', 'number_credits', 'other_debtors', 'property'],
  },
]

export type ApplicantState = Record<string, string | number>

export interface Preset {
  name: string
  tag: 'aprobar' | 'revisar' | 'rechazar'
  data: ApplicantState
}

export const PRESETS: Preset[] = [
  {
    name: 'Perfil sólido',
    tag: 'aprobar',
    data: {
      status: '... >= 200 DM / salary for at least 1 year',
      duration: 12,
      credit_history: 'existing credits paid back duly till now',
      purpose: 'radio/television',
      amount: 975000,
      savings: '... >= 1000 DM',
      employment_duration: '... >= 7 years',
      installment_rate: 1,
      personal_status_sex: 'male : married/widowed',
      other_debtors: 'guarantor',
      present_residence: 2,
      property: 'real estate',
      age: 45,
      other_installment_plans: 'none',
      housing: 'own',
      number_credits: 1,
      job: 'management/self-employed/highly qualified employee/officer',
      people_liable: 1,
      telephone: 'yes',
      foreign_worker: 'no',
    },
  },
  {
    name: 'Perfil de riesgo',
    tag: 'rechazar',
    data: {
      status: '... < 100 DM',
      duration: 48,
      credit_history: 'no credits taken/all credits paid back duly',
      purpose: 'car (new)',
      amount: 5200000,
      savings: '... < 100 DM',
      employment_duration: 'unemployed',
      installment_rate: 4,
      personal_status_sex: 'male : divorced/separated',
      other_debtors: 'co-applicant',
      present_residence: 4,
      property: 'unknown/no property',
      age: 22,
      other_installment_plans: 'stores',
      housing: 'rent',
      number_credits: 1,
      job: 'unemployed/unskilled - non-resident',
      people_liable: 1,
      telephone: 'no',
      foreign_worker: 'yes',
    },
  },
  {
    name: 'Caso límite',
    tag: 'revisar',
    data: {
      status: '0 <= ... < 200 DM',
      duration: 24,
      credit_history: 'existing credits paid back duly till now',
      purpose: 'domestic appliances',
      amount: 2275000,
      savings: '100 <= ... < 500 DM',
      employment_duration: '1 <= ... < 4 years',
      installment_rate: 2,
      personal_status_sex: 'male : single',
      other_debtors: 'none',
      present_residence: 3,
      property: 'car or other',
      age: 30,
      other_installment_plans: 'bank',
      housing: 'own',
      number_credits: 2,
      job: 'management/self-employed/highly qualified employee/officer',
      people_liable: 1,
      telephone: 'yes',
      foreign_worker: 'yes',
    },
  },
  {
    name: 'Sin historial crediticio',
    tag: 'revisar',
    data: {
      status: 'no checking account',
      duration: 18,
      credit_history: 'no credits taken/all credits paid back duly',
      purpose: 'education',
      amount: 1430000,
      savings: 'unknown/no savings account',
      employment_duration: '... < 1 year',
      installment_rate: 2,
      personal_status_sex: 'female : divorced/separated/married',
      other_debtors: 'none',
      present_residence: 1,
      property: 'unknown/no property',
      age: 24,
      other_installment_plans: 'none',
      housing: 'for free',
      number_credits: 1,
      job: 'skilled employee/official',
      people_liable: 1,
      telephone: 'no',
      foreign_worker: 'no',
    },
  },
]

export interface PortfolioApplicant extends ApplicantState {
  actual: number
}

// 20 solicitudes reales del set de test (no usadas para entrenar el modelo).
export const PORTFOLIO: PortfolioApplicant[] = [
  { status: '... >= 200 DM / salary for at least 1 year', duration: 24, credit_history: 'existing credits paid back duly till now', purpose: 'radio/television', amount: 1251000, savings: '... < 100 DM', employment_duration: '1 <= ... < 4 years', installment_rate: 2, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 2, property: 'real estate', age: 26, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'skilled employee/official', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 1 },
  { status: '... < 100 DM', duration: 18, credit_history: 'existing credits paid back duly till now', purpose: 'domestic appliances', amount: 1553000, savings: '... < 100 DM', employment_duration: '... < 1 year', installment_rate: 4, personal_status_sex: 'female : divorced/separated/married', other_debtors: 'none', present_residence: 1, property: 'car or other', age: 27, other_installment_plans: 'stores', housing: 'own', number_credits: 1, job: 'skilled employee/official', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 1 },
  { status: '... < 100 DM', duration: 15, credit_history: 'existing credits paid back duly till now', purpose: 'car (new)', amount: 1119000, savings: '... < 100 DM', employment_duration: '... < 1 year', installment_rate: 2, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 3, property: 'real estate', age: 36, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'skilled employee/official', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 1 },
  { status: 'no checking account', duration: 18, credit_history: 'existing credits paid back duly till now', purpose: 'domestic appliances', amount: 732000, savings: 'unknown/no savings account', employment_duration: '... < 1 year', installment_rate: 4, personal_status_sex: 'female : divorced/separated/married', other_debtors: 'none', present_residence: 2, property: 'real estate', age: 21, other_installment_plans: 'none', housing: 'rent', number_credits: 1, job: 'skilled employee/official', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 1 },
  { status: '0 <= ... < 200 DM', duration: 6, credit_history: 'all credits at this bank paid back duly', purpose: 'retraining', amount: 281000, savings: '... >= 1000 DM', employment_duration: '... < 1 year', installment_rate: 4, personal_status_sex: 'female : divorced/separated/married', other_debtors: 'none', present_residence: 2, property: 'building society savings agreement/life insurance', age: 24, other_installment_plans: 'bank', housing: 'rent', number_credits: 1, job: 'skilled employee/official', people_liable: 2, telephone: 'no', foreign_worker: 'yes', actual: 0 },
  { status: '... < 100 DM', duration: 12, credit_history: 'existing credits paid back duly till now', purpose: 'radio/television', amount: 424000, savings: '... < 100 DM', employment_duration: '... >= 7 years', installment_rate: 4, personal_status_sex: 'female : divorced/separated/married', other_debtors: 'none', present_residence: 4, property: 'building society savings agreement/life insurance', age: 24, other_installment_plans: 'none', housing: 'rent', number_credits: 1, job: 'skilled employee/official', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 1 },
  { status: '... < 100 DM', duration: 24, credit_history: 'existing credits paid back duly till now', purpose: 'radio/television', amount: 1947000, savings: 'unknown/no savings account', employment_duration: '1 <= ... < 4 years', installment_rate: 2, personal_status_sex: 'male : married/widowed', other_debtors: 'none', present_residence: 4, property: 'car or other', age: 20, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'skilled employee/official', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 0 },
  { status: 'no checking account', duration: 24, credit_history: 'critical account/other credits existing', purpose: 'others', amount: 2942000, savings: '... < 100 DM', employment_duration: '1 <= ... < 4 years', installment_rate: 3, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 2, property: 'real estate', age: 74, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'management/self-employed/highly qualified employee/officer', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 1 },
  { status: 'no checking account', duration: 10, credit_history: 'existing credits paid back duly till now', purpose: 'car (new)', amount: 1005000, savings: '... < 100 DM', employment_duration: '1 <= ... < 4 years', installment_rate: 3, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 2, property: 'real estate', age: 31, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'unskilled - resident', people_liable: 2, telephone: 'no', foreign_worker: 'no', actual: 1 },
  { status: '0 <= ... < 200 DM', duration: 12, credit_history: 'critical account/other credits existing', purpose: 'radio/television', amount: 2351000, savings: '... < 100 DM', employment_duration: '... >= 7 years', installment_rate: 1, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 4, property: 'car or other', age: 28, other_installment_plans: 'none', housing: 'rent', number_credits: 3, job: 'skilled employee/official', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 1 },
  { status: 'no checking account', duration: 12, credit_history: 'existing credits paid back duly till now', purpose: 'domestic appliances', amount: 1481000, savings: 'unknown/no savings account', employment_duration: '1 <= ... < 4 years', installment_rate: 4, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 4, property: 'unknown/no property', age: 37, other_installment_plans: 'none', housing: 'for free', number_credits: 1, job: 'skilled employee/official', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 1 },
  { status: '0 <= ... < 200 DM', duration: 8, credit_history: 'existing credits paid back duly till now', purpose: 'domestic appliances', amount: 494000, savings: '... < 100 DM', employment_duration: '4 <= ... < 7 years', installment_rate: 4, personal_status_sex: 'female : divorced/separated/married', other_debtors: 'guarantor', present_residence: 2, property: 'real estate', age: 44, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'unskilled - resident', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 1 },
  { status: '... < 100 DM', duration: 18, credit_history: 'all credits at this bank paid back duly', purpose: 'domestic appliances', amount: 1261000, savings: '... < 100 DM', employment_duration: '... < 1 year', installment_rate: 3, personal_status_sex: 'male : single', other_debtors: 'co-applicant', present_residence: 4, property: 'unknown/no property', age: 36, other_installment_plans: 'bank', housing: 'for free', number_credits: 1, job: 'management/self-employed/highly qualified employee/officer', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 1 },
  { status: '... < 100 DM', duration: 36, credit_history: 'critical account/other credits existing', purpose: 'car (used)', amount: 6259000, savings: '... < 100 DM', employment_duration: '4 <= ... < 7 years', installment_rate: 4, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 4, property: 'car or other', age: 24, other_installment_plans: 'none', housing: 'own', number_credits: 2, job: 'skilled employee/official', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 0 },
  { status: 'no checking account', duration: 30, credit_history: 'critical account/other credits existing', purpose: 'domestic appliances', amount: 4382000, savings: 'unknown/no savings account', employment_duration: '4 <= ... < 7 years', installment_rate: 2, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 3, property: 'building society savings agreement/life insurance', age: 36, other_installment_plans: 'none', housing: 'own', number_credits: 2, job: 'skilled employee/official', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 1 },
  { status: '0 <= ... < 200 DM', duration: 48, credit_history: 'critical account/other credits existing', purpose: 'radio/television', amount: 3312000, savings: '... < 100 DM', employment_duration: '1 <= ... < 4 years', installment_rate: 2, personal_status_sex: 'female : divorced/separated/married', other_debtors: 'none', present_residence: 3, property: 'car or other', age: 30, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'management/self-employed/highly qualified employee/officer', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 0 },
  { status: '0 <= ... < 200 DM', duration: 15, credit_history: 'no credits taken/all credits paid back duly', purpose: 'car (new)', amount: 1156000, savings: '... < 100 DM', employment_duration: '... < 1 year', installment_rate: 2, personal_status_sex: 'female : divorced/separated/married', other_debtors: 'none', present_residence: 1, property: 'real estate', age: 26, other_installment_plans: 'none', housing: 'rent', number_credits: 2, job: 'unemployed/unskilled - non-resident', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 0 },
  { status: 'no checking account', duration: 18, credit_history: 'existing credits paid back duly till now', purpose: 'radio/television', amount: 1290000, savings: '... < 100 DM', employment_duration: '1 <= ... < 4 years', installment_rate: 4, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 4, property: 'unknown/no property', age: 47, other_installment_plans: 'bank', housing: 'for free', number_credits: 2, job: 'skilled employee/official', people_liable: 1, telephone: 'no', foreign_worker: 'yes', actual: 1 },
  { status: 'no checking account', duration: 12, credit_history: 'existing credits paid back duly till now', purpose: 'car (new)', amount: 1225000, savings: '... < 100 DM', employment_duration: '... >= 7 years', installment_rate: 4, personal_status_sex: 'male : single', other_debtors: 'none', present_residence: 4, property: 'car or other', age: 39, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'management/self-employed/highly qualified employee/officer', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 1 },
  { status: '0 <= ... < 200 DM', duration: 12, credit_history: 'critical account/other credits existing', purpose: 'car (new)', amount: 1538000, savings: '500 <= ... < 1000 DM', employment_duration: '4 <= ... < 7 years', installment_rate: 3, personal_status_sex: 'male : divorced/separated', other_debtors: 'none', present_residence: 3, property: 'car or other', age: 36, other_installment_plans: 'none', housing: 'own', number_credits: 1, job: 'management/self-employed/highly qualified employee/officer', people_liable: 1, telephone: 'yes', foreign_worker: 'yes', actual: 1 },
]
