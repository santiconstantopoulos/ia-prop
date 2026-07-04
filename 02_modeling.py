import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (roc_auc_score, roc_curve, confusion_matrix,
                              classification_report, precision_recall_curve)
import joblib

df = pd.read_csv('data/GermanCredit.csv')

X = df.drop(columns=['credit_risk'])
y = df['credit_risk']  # 1 = buen pagador, 0 = default

num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
cat_cols = X.select_dtypes(include=['object']).columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)
print(f"Train: {X_train.shape}, Test: {X_test.shape}")
print(f"Default rate train: {(1-y_train.mean())*100:.1f}% | test: {(1-y_test.mean())*100:.1f}%")

preprocessor = ColumnTransformer(transformers=[
    ('num', StandardScaler(), num_cols),
    ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), cat_cols)
])

models = {
    'Regresion_Logistica': LogisticRegression(max_iter=2000, random_state=42, class_weight='balanced'),
    'Random_Forest': RandomForestClassifier(n_estimators=300, max_depth=6, random_state=42, class_weight='balanced'),
    'XGBoost': XGBClassifier(n_estimators=300, max_depth=4, learning_rate=0.05, random_state=42,
                              eval_metric='logloss', scale_pos_weight=(y_train==0).sum()/(y_train==1).sum())
}

results = {}
for name, model in models.items():
    pipe = Pipeline([('prep', preprocessor), ('clf', model)])
    pipe.fit(X_train, y_train)
    proba = pipe.predict_proba(X_test)[:, 1]  # prob de ser buen pagador
    pred = pipe.predict(X_test)
    auc = roc_auc_score(y_test, proba)
    cm = confusion_matrix(y_test, pred)
    results[name] = {'pipe': pipe, 'proba': proba, 'pred': pred, 'auc': auc, 'cm': cm}
    print(f"\n{'='*50}\n{name} — AUC: {auc:.4f}")
    print(cm)
    print(classification_report(y_test, pred, target_names=['Default(0)', 'Buen pagador(1)']))

joblib.dump(results, 'model_results.pkl')
joblib.dump((X_test, y_test), 'test_data.pkl')
print("\nGuardado: model_results.pkl, test_data.pkl")
