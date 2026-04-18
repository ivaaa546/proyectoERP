from datetime import date
from pydantic import BaseModel, Field


class Observacion(BaseModel):
    fecha: date
    valor: float = Field(ge=0)


class TrainRequest(BaseModel):
    id_producto: int = Field(gt=0)
    id_sucursal: int = Field(gt=0)
    observaciones: list[Observacion] = Field(min_length=14)


class PredictRequest(TrainRequest):
    horizonte_dias: int = Field(default=30, ge=1, le=365)


class ModeloInfo(BaseModel):
    version: str
    algoritmo: str
    mae: float | None = None
    rmse: float | None = None


class PrediccionPoint(BaseModel):
    fecha: date
    valor_predicho: float
    intervalo_inferior: float | None = None
    intervalo_superior: float | None = None


class TrainResponse(BaseModel):
    modelo: ModeloInfo


class PredictResponse(BaseModel):
    modelo: ModeloInfo
    predicciones: list[PrediccionPoint]
