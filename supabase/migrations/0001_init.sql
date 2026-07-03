-- Etapa 1: schema inicial para otorgamiento, seguimiento y recalibracion del modelo.

create table if not exists model_versions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  coefficients jsonb not null,
  auc real,
  n_training_samples integer,
  notes text,
  is_active boolean not null default false
);

-- Garantiza que como maximo una version este activa a la vez.
create unique index if not exists model_versions_one_active
  on model_versions (is_active)
  where is_active;

create table if not exists loan_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  features jsonb not null,
  score integer not null,
  probability real not null,
  decision text not null check (decision in ('aprobar', 'revisar', 'rechazar')),
  model_version_id bigint references model_versions (id),
  outcome text not null default 'pending' check (outcome in ('pending', 'paid', 'default')),
  outcome_updated_at timestamptz
);

create table if not exists seed_training_data (
  id bigint generated always as identity primary key,
  features jsonb not null,
  label integer not null check (label in (0, 1))
);

-- Seed: el modelo base actual (coeficientes de lib/credit-scoring/data.ts),
-- insertado como version activa inicial.
insert into model_versions (coefficients, auc, n_training_samples, notes, is_active)
values (
  '{"intercept":-1.2538466727023883,"offset":487.1228762045055,"factor":28.85390081777927,"num_cols":["duration","amount","installment_rate","present_residence","age","number_credits","people_liable"],"num_info":{"duration":{"mean":20.981333333333332,"std":12.243623574016894},"amount":{"mean":2092699.2666666666,"std":1815432.9105522265},"installment_rate":{"mean":2.978666666666667,"std":1.1181285952678053},"present_residence":{"mean":2.8306666666666667,"std":1.11085232541904},"age":{"mean":35.296,"std":11.321265418082321},"number_credits":{"mean":1.412,"std":0.5653223269368841},"people_liable":{"mean":1.1613333333333333,"std":0.3678381286502106}},"cat_cols":["status","credit_history","purpose","savings","employment_duration","personal_status_sex","other_debtors","property","other_installment_plans","housing","job","telephone","foreign_worker"],"cat_categories":{"status":["... < 100 DM","... >= 200 DM / salary for at least 1 year","0 <= ... < 200 DM","no checking account"],"credit_history":["all credits at this bank paid back duly","critical account/other credits existing","delay in paying off in the past","existing credits paid back duly till now","no credits taken/all credits paid back duly"],"purpose":["business","car (new)","car (used)","domestic appliances","education","furniture/equipment","others","radio/television","repairs","retraining"],"savings":["... < 100 DM","... >= 1000 DM","100 <= ... < 500 DM","500 <= ... < 1000 DM","unknown/no savings account"],"employment_duration":["... < 1 year","... >= 7 years","1 <= ... < 4 years","4 <= ... < 7 years","unemployed"],"personal_status_sex":["female : divorced/separated/married","male : divorced/separated","male : married/widowed","male : single"],"other_debtors":["co-applicant","guarantor","none"],"property":["building society savings agreement/life insurance","car or other","real estate","unknown/no property"],"other_installment_plans":["bank","none","stores"],"housing":["for free","own","rent"],"job":["management/self-employed/highly qualified employee/officer","skilled employee/official","unemployed/unskilled - non-resident","unskilled - resident"],"telephone":["no","yes"],"foreign_worker":["no","yes"]},"scorecard":[{"feature":"duration","coef":-0.3047603640234697,"points":-8.7935253167235},{"feature":"amount","coef":-0.3651832330123951,"points":-10.536960785655625},{"feature":"installment_rate","coef":-0.23880945653430355,"points":-6.890584373188564},{"feature":"present_residence","coef":-0.02180525253514502,"points":-0.6291665939557044},{"feature":"age","coef":0.19200371433110194,"points":5.54005612995484},{"feature":"number_credits","coef":0.013968139127040504,"points":0.4030353009805686},{"feature":"people_liable","coef":0.02672719303192353,"points":0.7711837768807627},{"feature":"status_... >= 200 DM / salary for at least 1 year","coef":0.9398516499575376,"points":27.11838629130099},{"feature":"status_0 <= ... < 200 DM","coef":0.3400796356594442,"points":9.812624077464113},{"feature":"status_no checking account","coef":1.572218812984095,"points":45.36464569368973},{"feature":"credit_history_critical account/other credits existing","coef":1.077526112270888,"points":31.09083157203149},{"feature":"credit_history_delay in paying off in the past","coef":0.16899880255677027,"points":4.876274687296511},{"feature":"credit_history_existing credits paid back duly till now","coef":0.2150643593962676,"points":6.205445695459141},{"feature":"credit_history_no credits taken/all credits paid back duly","coef":-0.2769330530298081,"points":-7.99059884528689},{"feature":"purpose_car (new)","coef":-0.7155337032006508,"points":-20.645938503929887},{"feature":"purpose_car (used)","coef":1.4401882789989415,"points":41.55504976116368},{"feature":"purpose_domestic appliances","coef":0.21424586401892187,"points":6.181828911021396},{"feature":"purpose_education","coef":-0.6820547043055094,"points":-19.679938790330937},{"feature":"purpose_furniture/equipment","coef":-0.10111335217107749,"points":-2.917514634897456},{"feature":"purpose_others","coef":0.023376840870042163,"points":0.6745130478972055},{"feature":"purpose_radio/television","coef":0.08726091750765727,"points":2.5178178590343614},{"feature":"purpose_repairs","coef":0.053256754266320955,"points":1.5366651054772678},{"feature":"purpose_retraining","coef":-0.9739750372116329,"points":-28.10297912269733},{"feature":"savings_... >= 1000 DM","coef":1.0192086463028074,"points":29.408145193044277},{"feature":"savings_100 <= ... < 500 DM","coef":0.3831980194996003,"points":11.056757648210914},{"feature":"savings_500 <= ... < 1000 DM","coef":0.550017073029338,"points":15.870138073273775},{"feature":"savings_unknown/no savings account","coef":0.8008300708952264,"points":23.107071437506004},{"feature":"employment_duration_... >= 7 years","coef":0.05943222924786575,"points":1.7148516480974387},{"feature":"employment_duration_1 <= ... < 4 years","coef":0.12054675264212716,"points":3.478244044641308},{"feature":"employment_duration_4 <= ... < 7 years","coef":0.7057069907511779,"points":20.36239951754796},{"feature":"employment_duration_unemployed","coef":-0.07842235225355655,"points":-2.2627907738210693},{"feature":"personal_status_sex_male : divorced/separated","coef":-0.1429204991285303,"points":-4.1238139066821216},{"feature":"personal_status_sex_male : married/widowed","coef":0.21831758093571954,"points":6.29931382709675},{"feature":"personal_status_sex_male : single","coef":0.3766597409313037,"points":10.868102806882272},{"feature":"other_debtors_guarantor","coef":1.1340375930240205,"points":32.72140823274822},{"feature":"other_debtors_none","coef":0.20245506120315065,"points":5.841618256013141},{"feature":"property_car or other","coef":0.16352086481013753,"points":4.7182148148692},{"feature":"property_real estate","coef":0.30256097970054735,"points":8.73006449960972},{"feature":"property_unknown/no property","coef":-0.4754677570296656,"points":-13.719099503385943},{"feature":"other_installment_plans_none","coef":0.6913114212015119,"points":19.947031181546453},{"feature":"other_installment_plans_stores","coef":-0.18064067969651465,"points":-5.212188255619467},{"feature":"housing_own","coef":0.03821091613204836,"points":1.1025339842306054},{"feature":"housing_rent","coef":-0.39967253270947295,"points":-11.532111618389774},{"feature":"job_skilled employee/official","coef":-0.20510867272467667,"points":-5.918185299664168},{"feature":"job_unemployed/unskilled - non-resident","coef":-0.22830670505045939,"points":-6.58753902355994},{"feature":"job_unskilled - resident","coef":-0.04697407288313293,"points":-1.355385239977052},{"feature":"telephone_yes","coef":0.3734708797965782,"points":10.776091723979231},{"feature":"foreign_worker_yes","coef":-1.0738934346322604,"points":-30.986014651743567}]}'::jsonb,
  0.771,
  1000,
  'modelo base (artefacto original)',
  true
);
