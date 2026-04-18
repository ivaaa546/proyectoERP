# ml-service

Microservicio de predicciones desacoplado del backend Node.

## Stack

- FastAPI
- scikit-learn
- pandas

## Ejecutar local

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

- `GET /v1/health`
- `POST /v1/train`
- `POST /v1/predict`

## Ejemplo de payload

```json
{
  "id_producto": 1,
  "id_sucursal": 1,
  "horizonte_dias": 30,
  "observaciones": [
    { "fecha": "2026-01-01", "valor": 10 },
    { "fecha": "2026-01-02", "valor": 12 }
  ]
}
```
