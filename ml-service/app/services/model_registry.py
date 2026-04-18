from __future__ import annotations

from pathlib import Path

import joblib


MODELS_DIR = Path(__file__).resolve().parents[2] / 'models'
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def model_key(id_sucursal: int, id_producto: int) -> str:
    return f's{id_sucursal}_p{id_producto}'


def model_path(key: str) -> Path:
    return MODELS_DIR / f'{key}.joblib'


def save_model(key: str, payload: dict) -> None:
    joblib.dump(payload, model_path(key))


def load_model(key: str) -> dict | None:
    path = model_path(key)
    if not path.exists():
        return None
    return joblib.load(path)
