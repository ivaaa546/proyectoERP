from __future__ import annotations

from datetime import datetime

import pandas as pd
from fastapi import FastAPI, HTTPException

from app.schemas import PredictRequest, PredictResponse, TrainRequest, TrainResponse
from app.services.model_registry import load_model, model_key
from app.services.predictor import predict_with_model
from app.services.trainer import train_model

app = FastAPI(title='Predicciones ML Service', version='1.0.0')


def normalize_observaciones(observaciones: list) -> list[tuple[pd.Timestamp, float]]:
    normalized = [(pd.Timestamp(item.fecha), float(item.valor)) for item in observaciones]
    if len(normalized) < 14:
        raise HTTPException(status_code=400, detail='Se requieren al menos 14 observaciones')
    return normalized


@app.get('/v1/health')
def health() -> dict:
    return {
        'status': 'ok',
        'service': 'ml-predicciones',
        'timestamp': datetime.utcnow().isoformat(),
    }


@app.post('/v1/train', response_model=TrainResponse)
def train(body: TrainRequest) -> TrainResponse:
    observaciones = normalize_observaciones(body.observaciones)
    modelo = train_model(body.id_sucursal, body.id_producto, observaciones)
    return TrainResponse(modelo=modelo)


@app.post('/v1/predict', response_model=PredictResponse)
def predict(body: PredictRequest) -> PredictResponse:
    observaciones = normalize_observaciones(body.observaciones)
    key = model_key(body.id_sucursal, body.id_producto)

    payload = load_model(key)
    if payload is None:
        train_model(body.id_sucursal, body.id_producto, observaciones)
        payload = load_model(key)

    if payload is None:
        raise HTTPException(status_code=500, detail='No se pudo cargar el modelo entrenado')

    return predict_with_model(payload, body.horizonte_dias)
