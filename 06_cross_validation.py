import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score, cross_validate
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
import joblib

df = pd.read_csv('data/GermanCredit.csv')
X = df.drop(columns=['credit_risk'])
y = df['credit_risk']

num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
cat_cols = X.select_dtypes(include=['object']).columns.tolist()

preprocessor = ColumnTransformer(transformers=[
    ('num', StandardScaler(), num_cols),
    ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), cat_cols)
])

models = {
    'Regresion_Logistica': LogisticRegression(max_iter=2000, random_state=42, class_weight='balanced'),
    'Random_Forest': RandomForestClassifier(n_estimators=300, max_depth=6, random_state=42, class_weight='balanced'),
    'XGBoost': XGBClassifier(n_estimators=300, max_depth=4, learning_rate=0.05, random_state=42,
                              eval_metric='logloss', scale_pos_weight=(y==0).sum()/(y==1).sum())
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scoring = {'auc': 'roc_auc', 'recall_default': 'recall_macro', 'accuracy': 'accuracy'}

cv_results = {}
print(f"Validación cruzada estratificada, 5 folds, sobre las 1000 filas completas\n")
print(f"{'Modelo':<22}{'AUC (media±std)':<22}{'Accuracy (media±std)':<22}")
print("-"*66)
for name, model in models.items():
    pipe = Pipeline([('prep', preprocessor), ('clf', model)])
    res = cross_validate(pipe, X, y, cv=cv, scoring=scoring, n_jobs=1)
    cv_results[name] = res
    auc_m, auc_s = res['test_auc'].mean(), res['test_auc'].std()
    acc_m, acc_s = res['test_accuracy'].mean(), res['test_accuracy'].std()
    print(f"{name:<22}{f'{auc_m:.3f} ± {auc_s:.3f}':<22}{f'{acc_m:.3f} ± {acc_s:.3f}':<22}")
    print(f"   AUC por fold: {np.round(res['test_auc'],3)}")

joblib.dump(cv_results, 'cv_results.pkl')
print("\nGuardado: cv_results.pkl")

# Comparación contra el split único original (para mostrar la diferencia)
print("\n--- Comparación: split único (visto antes) vs. 5-fold CV ---")
single_split_auc = {'Regresion_Logistica': 0.7705, 'Random_Forest': 0.7802, 'XGBoost': 0.7550}
for name in models:
    cv_mean = cv_results[name]['test_auc'].mean()
    diff = cv_mean - single_split_auc[name]
    print(f"{name:<22} split único: {single_split_auc[name]:.3f}  |  5-fold CV: {cv_mean:.3f}  (dif: {diff:+.3f})")
