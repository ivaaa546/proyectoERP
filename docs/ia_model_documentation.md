# Documentación del Modelo de IA e Implementación

Este documento detalla la arquitectura, el modelo y la implementación de la Inteligencia Artificial dentro del proyecto ERP, cumpliendo con los requisitos de integración de modelos predictivos.

## 1. Tecnologías Utilizadas

- **Librería de ML:** Scikit-learn (v1.7.2)
- **Framework de Servicio:** FastAPI (Python 3.9+)
- **Procesamiento de Datos:** Pandas y NumPy
- **Servidor Web:** Uvicorn
- **Integración:** Next.js (Node.js) mediante peticiones HTTP/JSON

## 2. Descripción del Modelo

Se ha seleccionado un modelo de **Bosques Aleatorios para Regresión** (`RandomForestRegressor`) debido a su robustez frente a datos ruidosos y su capacidad para capturar patrones no lineales en series temporales de ventas e inventarios.

### Características del Algoritmo:
- **Tipo:** Aprendizaje Supervisado (Regresión).
- **Estimadores:** 200 árboles de decisión.
- **Estado Aleatorio:** 42 (para reproducibilidad).
- **Entrada:** Series temporales de ventas/movimientos (historial de al menos 14-20 días).
- **Salida:** Predicción numérica de la demanda para un horizonte de tiempo determinado (ej. próximos 30 días).

## 3. Arquitectura de Implementación

El sistema de IA está desacoplado del núcleo del ERP para mejorar la escalabilidad y mantenibilidad.

### Componentes:
1. **ML Service (`ml-service`):** Un microservicio en Python que expone una API REST con FastAPI.
   - `/v1/train`: Recibe datos históricos y entrena un modelo específico para una sucursal y producto.
   - `/v1/predict`: Carga el modelo pre-entrenado y devuelve la proyección de demanda.
2. **ERP API (`app/api/predicciones`):** Actúa como puente (proxy) entre el frontend de Next.js y el microservicio de ML, manejando la autenticación y validación de roles.
3. **Persistencia:** Los modelos entrenados se serializan y almacenan utilizando `joblib` para una carga rápida durante las predicciones.

## 4. Flujo de Datos

1. **Extracción:** El frontend del ERP consulta los datos históricos de movimientos/ventas desde **SQL Server**.
2. **Transformación:** Los datos se normalizan y formatean como una serie temporal de pares (fecha, valor).
3. **Entrenamiento/Predicción:** Se envían los datos al `ml-service`.
   - Si no existe un modelo para el producto/sucursal, el servicio lo entrena automáticamente.
   - El modelo aplica *Feature Engineering* (creando lags, tendencias y estacionalidades) antes de procesar.
4. **Visualización:** El resultado (proyección) se devuelve al frontend para ser graficado.

## 5. Métricas de Evaluación

El servicio calcula automáticamente dos métricas clave durante el entrenamiento para validar la precisión:
- **MAE (Mean Absolute Error):** Error promedio absoluto en las unidades predichas.
- **RMSE (Root Mean Squared Error):** Penaliza errores más grandes, útil para evitar quiebres de stock críticos.

---
*Documentación generada para el Proyecto Final de Bases de Datos.*
