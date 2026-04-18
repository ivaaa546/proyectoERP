from __future__ import annotations

import pandas as pd

from app.schemas import ModeloInfo, PrediccionPoint, PredictResponse


def _build_feature_row(history: pd.DataFrame, next_date: pd.Timestamp) -> pd.DataFrame:
    lag_1 = float(history.iloc[-1]['valor'])
    lag_7 = float(history.iloc[-7]['valor']) if len(history) >= 7 else lag_1
    lag_14 = float(history.iloc[-14]['valor']) if len(history) >= 14 else lag_7
    roll_7 = float(history['valor'].tail(7).mean())
    roll_14 = float(history['valor'].tail(14).mean())

    return pd.DataFrame(
        [
            {
                'dow': float(next_date.dayofweek),
                'month': float(next_date.month),
                'lag_1': lag_1,
                'lag_7': lag_7,
                'lag_14': lag_14,
                'roll_7': roll_7,
                'roll_14': roll_14,
            }
        ]
    )


def predict_with_model(payload: dict, horizonte_dias: int) -> PredictResponse:
    model = payload['model']
    history = payload['history'].copy()
    predicciones: list[PrediccionPoint] = []

    valor_real_promedio = float(history['valor'].mean())
    print(f"[PREDICTOR] promedio_historico={valor_real_promedio:.2f}, len_history={len(history)}")

    for _ in range(horizonte_dias):
        next_date = pd.Timestamp(history['fecha'].max()) + pd.Timedelta(days=1)
        x_next = _build_feature_row(history, next_date)
        raw_value = float(model.predict(x_next)[0])
        
        # Suavizado: 50% modelo, 50% promedio histórico real para evitar valores pesimistas (cercanos a 0)
        value = (raw_value * 0.5) + (valor_real_promedio * 0.5)
        print(f"[PREDICTOR] raw={raw_value:.2f}, smoothed={value:.2f}")
        value = max(value, 0.0)

        predicciones.append(
            PrediccionPoint(
                fecha=next_date.date(),
                valor_predicho=value,
            )
        )

        # En lugar de usar el valor predicho para las siguientes filas del loop
        # Usamos el promedio real observado para evitar degradación rápida
        history = pd.concat(
            [
                history,
                pd.DataFrame(
                    [
                        {
                            'fecha': next_date,
                            'valor': valor_real_promedio,
                        }
                    ]
                ),
            ],
            ignore_index=True,
        )

    return PredictResponse(
        modelo=ModeloInfo(
            version=payload['version'],
            algoritmo=payload['algoritmo'],
            mae=payload.get('mae'),
            rmse=payload.get('rmse'),
        ),
        predicciones=predicciones,
    )
