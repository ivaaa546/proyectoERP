from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

import pandas as pd


@dataclass
class FeatureData:
    features: pd.DataFrame
    target: pd.Series
    series_sorted: pd.DataFrame


def build_training_features(observaciones: list[tuple[pd.Timestamp, float]]) -> FeatureData:
    df = pd.DataFrame(observaciones, columns=['fecha', 'valor'])
    df['fecha'] = pd.to_datetime(df['fecha'])
    df = df.sort_values('fecha').reset_index(drop=True)

    full_range = pd.date_range(df['fecha'].min(), df['fecha'].max(), freq='D')
    full_df = pd.DataFrame({'fecha': full_range})
    merged = full_df.merge(df, on='fecha', how='left')
    merged['valor'] = merged['valor'].ffill().fillna(0)

    merged['dow'] = merged['fecha'].dt.dayofweek
    merged['month'] = merged['fecha'].dt.month
    merged['lag_1'] = merged['valor'].shift(1)
    merged['lag_7'] = merged['valor'].shift(7)
    merged['lag_14'] = merged['valor'].shift(14)
    merged['roll_7'] = merged['valor'].rolling(7).mean().shift(1)
    merged['roll_14'] = merged['valor'].rolling(14).mean().shift(1)

    # Llenar NaNs iniciales con el promedio para permitir entrenar con pocos datos (< 15 días)
    mean_val = merged['valor'].mean()
    cols_to_fill = ['lag_1', 'lag_7', 'lag_14', 'roll_7', 'roll_14']
    merged[cols_to_fill] = merged[cols_to_fill].fillna(mean_val)

    ready = merged.dropna().reset_index(drop=True)
    features = ready[['dow', 'month', 'lag_1', 'lag_7', 'lag_14', 'roll_7', 'roll_14']]
    target = ready['valor']
    return FeatureData(features=features, target=target, series_sorted=merged)


def build_future_rows(history_df: pd.DataFrame, horizonte_dias: int) -> pd.DataFrame:
    history = history_df.copy()
    predictions: list[dict[str, float | pd.Timestamp]] = []

    for _ in range(horizonte_dias):
        next_date = history['fecha'].max() + timedelta(days=1)

        lag_1 = float(history.iloc[-1]['valor'])
        lag_7 = float(history.iloc[-7]['valor']) if len(history) >= 7 else lag_1
        lag_14 = float(history.iloc[-14]['valor']) if len(history) >= 14 else lag_7
        roll_7 = float(history['valor'].tail(7).mean())
        roll_14 = float(history['valor'].tail(14).mean())

        predictions.append(
            {
                'fecha': next_date,
                'dow': float(next_date.dayofweek),
                'month': float(next_date.month),
                'lag_1': lag_1,
                'lag_7': lag_7,
                'lag_14': lag_14,
                'roll_7': roll_7,
                'roll_14': roll_14,
            }
        )

        history = pd.concat(
            [
                history,
                pd.DataFrame(
                    [
                        {
                            'fecha': next_date,
                            'valor': lag_1,
                        }
                    ]
                ),
            ],
            ignore_index=True,
        )

    return pd.DataFrame(predictions)
