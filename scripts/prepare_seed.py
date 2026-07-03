"""
Prepara el dataset base (German Credit / credit-g, OpenML id 31) como semilla de
entrenamiento para el motor de scoring, en el mismo formato/escala que usa la app
(lib/credit-scoring/data.ts).

Se ejecuta una sola vez (one-off), NO forma parte del runtime de la app. Emite un
JSON con 1000 filas {"features": {...20 campos...}, "label": 0|1} listo para cargar
en la tabla seed_training_data via scripts/load_seed.mjs.

Uso:
    python scripts/prepare_seed.py > _seed_output.json
"""

import json
import sys

from sklearn.datasets import fetch_openml

# Estadisticas del modelo base ya entrenado (lib/credit-scoring/data.ts num_info.amount).
# El monto en el dataset original esta en Marcos Alemanes (DM); la app lo muestra en
# una escala tipo pesos. Reescalamos por z-score para igualar exactamente la media y
# el desvio con los que ya usa el modelo desplegado.
TARGET_AMOUNT_MEAN = 2092699.2666666666
TARGET_AMOUNT_STD = 1815432.9105522265

# Mapeos: valor crudo de OpenML -> string exacto usado en cat_categories de data.ts.
# El orden de cada lista importa: el primer valor es la categoria base (referencia)
# del modelo, coincide con DATA.cat_categories[col][0] en data.ts.
CHECKING_STATUS = {
    "<0": "... < 100 DM",
    "0<=X<200": "0 <= ... < 200 DM",
    ">=200": "... >= 200 DM / salary for at least 1 year",
    "no checking": "no checking account",
}
CREDIT_HISTORY = {
    "all paid": "all credits at this bank paid back duly",
    "critical/other existing credit": "critical account/other credits existing",
    "delayed previously": "delay in paying off in the past",
    "existing paid": "existing credits paid back duly till now",
    "no credits/all paid": "no credits taken/all credits paid back duly",
}
PURPOSE = {
    "business": "business",
    "new car": "car (new)",
    "used car": "car (used)",
    "domestic appliance": "domestic appliances",
    "education": "education",
    "furniture/equipment": "furniture/equipment",
    "other": "others",
    "radio/tv": "radio/television",
    "repairs": "repairs",
    "retraining": "retraining",
}
SAVINGS = {
    "<100": "... < 100 DM",
    ">=1000": "... >= 1000 DM",
    "100<=X<500": "100 <= ... < 500 DM",
    "500<=X<1000": "500 <= ... < 1000 DM",
    "no known savings": "unknown/no savings account",
}
EMPLOYMENT = {
    "<1": "... < 1 year",
    ">=7": "... >= 7 years",
    "1<=X<4": "1 <= ... < 4 years",
    "4<=X<7": "4 <= ... < 7 years",
    "unemployed": "unemployed",
}
PERSONAL_STATUS = {
    "female div/dep/mar": "female : divorced/separated/married",
    "male div/sep": "male : divorced/separated",
    "male mar/wid": "male : married/widowed",
    "male single": "male : single",
}
OTHER_PARTIES = {
    "co applicant": "co-applicant",
    "guarantor": "guarantor",
    "none": "none",
}
PROPERTY = {
    "life insurance": "building society savings agreement/life insurance",
    "car": "car or other",
    "real estate": "real estate",
    "no known property": "unknown/no property",
}
OTHER_PAYMENT_PLANS = {
    "bank": "bank",
    "none": "none",
    "stores": "stores",
}
HOUSING = {
    "for free": "for free",
    "own": "own",
    "rent": "rent",
}
JOB = {
    "high qualif/self emp/mgmt": "management/self-employed/highly qualified employee/officer",
    "skilled": "skilled employee/official",
    "unemp/unskilled non res": "unemployed/unskilled - non-resident",
    "unskilled resident": "unskilled - resident",
}
TELEPHONE = {"none": "no", "yes": "yes"}
FOREIGN_WORKER = {"no": "no", "yes": "yes"}


def main():
    data = fetch_openml("credit-g", version=1, as_frame=True)
    df = data.frame

    src_mean = df["credit_amount"].mean()
    src_std = df["credit_amount"].std()

    rows = []
    for _, r in df.iterrows():
        amount = (r["credit_amount"] - src_mean) / src_std * TARGET_AMOUNT_STD + TARGET_AMOUNT_MEAN
        features = {
            "status": CHECKING_STATUS[r["checking_status"]],
            "duration": int(r["duration"]),
            "credit_history": CREDIT_HISTORY[r["credit_history"]],
            "purpose": PURPOSE[r["purpose"]],
            "amount": round(amount / 1000) * 1000,
            "savings": SAVINGS[r["savings_status"]],
            "employment_duration": EMPLOYMENT[r["employment"]],
            "installment_rate": int(r["installment_commitment"]),
            "personal_status_sex": PERSONAL_STATUS[r["personal_status"]],
            "other_debtors": OTHER_PARTIES[r["other_parties"]],
            "present_residence": int(r["residence_since"]),
            "property": PROPERTY[r["property_magnitude"]],
            "age": int(r["age"]),
            "other_installment_plans": OTHER_PAYMENT_PLANS[r["other_payment_plans"]],
            "housing": HOUSING[r["housing"]],
            "number_credits": int(r["existing_credits"]),
            "job": JOB[r["job"]],
            "people_liable": int(r["num_dependents"]),
            "telephone": TELEPHONE[r["own_telephone"]],
            "foreign_worker": FOREIGN_WORKER[r["foreign_worker"]],
        }
        label = 1 if r["class"] == "good" else 0
        rows.append({"features": features, "label": label})

    json.dump(rows, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
