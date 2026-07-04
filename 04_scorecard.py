import joblib
import numpy as np
import pandas as pd
import json

results = joblib.load('model_results.pkl')
lr_pipe = results['Regresion_Logistica']['pipe']

prep = lr_pipe.named_steps['prep']
clf = lr_pipe.named_steps['clf']

feature_names = prep.get_feature_names_out()
coefs = clf.coef_[0]
intercept = clf.intercept_[0]

# Método PDO (Points to Double the Odds) — estándar en la industria de scoring
PDO = 20
BASE_SCORE = 600
BASE_ODDS = 50  # odds de referencia (50:1 bueno:malo) en el score base
factor = PDO / np.log(2)
offset = BASE_SCORE - factor * np.log(BASE_ODDS)

# Puntos por variable: -coef * factor (el signo negativo porque en scoring
# tradicional se modela probabilidad de DEFAULT; acá el target es 1=buen pagador,
# así que coef positivo en LR ya indica "suma puntos")
scorecard_rows = []
for fname, coef in zip(feature_names, coefs):
    clean_name = fname.replace('num__', '').replace('cat__', '')
    points = coef * factor
    scorecard_rows.append({'feature': clean_name, 'coef': float(coef), 'points': float(points)})

scorecard_df = pd.DataFrame(scorecard_rows).sort_values('points', ascending=False)
print(scorecard_df.to_string(index=False))

# Info numérica para poder estandarizar en la app (media/std usados por el StandardScaler)
num_cols = prep.transformers_[0][2]
scaler = prep.named_transformers_['num']
num_info = {col: {'mean': float(m), 'std': float(s)} for col, m, s in
            zip(num_cols, scaler.mean_, scaler.scale_)}

# Categorías del OneHotEncoder (para saber qué opciones mostrar en la app)
cat_cols = prep.transformers_[1][2]
ohe = prep.named_transformers_['cat']
cat_categories = {col: cats.tolist() for col, cats in zip(cat_cols, ohe.categories_)}

export = {
    'intercept': float(intercept),
    'offset': float(offset),
    'factor': float(factor),
    'num_cols': num_cols,
    'num_info': num_info,
    'cat_cols': cat_cols,
    'cat_categories': cat_categories,
    'scorecard': scorecard_rows
}

with open('scorecard_export.json', 'w', encoding='utf-8') as f:
    json.dump(export, f, ensure_ascii=False, indent=2)

print("\nExportado a scorecard_export.json")
print(f"\nIntercept: {intercept:.4f} | Offset: {offset:.2f} | Factor: {factor:.2f}")
