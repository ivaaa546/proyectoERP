from __future__ import annotations

from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

from app.schemas import ModeloInfo
from app.services.feature_engineering import build_training_features
from app.services.model_registry import model_key, save_model


def train_model(id_sucursal: int, id_producto: int, observaciones: list[tuple[pd.Timestamp, float]]) -> ModeloInfo:
    features_data = build_training_features(observaciones)

    x = features_data.features
    y = features_data.target

    split_idx = max(int(len(x) * 0.8), 1)
    x_train, x_test = x.iloc[:split_idx], x.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        min_samples_leaf=1,
    )
    model.fit(x_train, y_train)

    mae = None
    rmse = None
    if len(x_test) > 0:
        y_pred = model.predict(x_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))

    version = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    key = model_key(id_sucursal, id_producto)
    save_model(
        key,
        {
            'model': model,
            'version': version,
            'algoritmo': 'RandomForestRegressor',
            'mae': mae,
            'rmse': rmse,
            'history': features_data.series_sorted,
        },
    )

    return ModeloInfo(
        version=version,
        algoritmo='RandomForestRegressor',
        mae=mae,
        rmse=rmse,
    )
