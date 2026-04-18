# Proyecto Final de Bases de Datos en SQL Server

## Título
**Desarrollo de una Aplicación con Base de Datos, Análisis Predictivo y Seguridad Avanzada**

## Objetivo General
Desarrollar una aplicación funcional con una base de datos en SQL Server, respaldo, recuperación, integrando seguridad, análisis de datos, optimización de rendimiento y modelos predictivos con IA. :contentReference[oaicite:0]{index=0}

---

# Requisitos del Proyecto

## I. Modelado de Base de Datos

### 1. Diagrama ER Normalizado
- Diseñar un diagrama entidad-relación (ER) en tercera forma normal (3FN).
- Definir relaciones bien estructuradas con claves primarias y foráneas.

---

## II. Seguridad y Control de Acceso

### 2. Roles y Permisos
- Crear roles en SQL Server con privilegios diferenciados (Administrador, Usuario, Reportes, etc.).
- Implementar autenticación y autorización con procedimientos almacenados.

### 3. Bitácora de Auditoría
- Registrar acciones de los usuarios (inicio de sesión, inserciones, modificaciones, eliminaciones).

---

## III. Administración de Backups y Recuperación

### 4. Sistema de Respaldo desde la Aplicación
- Funcionalidad para generar respaldos de la base de datos desde la aplicación.
- Desarrollo de un procedimiento almacenado o trigger para el backup automático.

---

## IV. Análisis de Datos con Cubos de Información

### 5. Implementación de Cubos OLAP
- Crear un Data Warehouse con al menos una tabla de hechos y tres dimensiones.
- Utilizar SQL Server Analysis Services (SSAS) para el análisis de datos.

---

## V. Consultas Avanzadas y Reportes

### 6. Reportes en PDF y Exportación a Excel
- Generar reportes en formato PDF desde la aplicación con datos obtenidos de consultas avanzadas.
- Permitir la exportación de datos a Excel.

### 7. Consultas Avanzadas
- Consultas con subconsultas, CTEs, funciones de agregación y datos jerárquicos.
- Eliminación y actualización en cascada.

---

## VI. Monitoreo y Rendimiento

### 8. Optimización y Monitoreo
- Implementar índices para mejorar el rendimiento.
- Registrar tiempos de ejecución de consultas en una tabla de monitoreo.

---

## VII. Funciones y Procedimientos

### 9. Funciones y Procedimientos Almacenados
- Implementar funciones y procedimientos para la lógica de negocios.
- Incluir validaciones y manejo de errores.

### 10. Transacciones y Control de Errores
- Implementar transacciones para garantizar la integridad de los datos.

---

## VIII. Implementación de Modelos Predictivos

### 11. Desarrollo de Modelos de IA en SQL Server
- Implementar un modelo de predicción utilizando TensorFlow o Scikit-learn.
- Entrenar el modelo con datos almacenados en SQL Server.
- Utilizar procedimientos almacenados para llamar a modelos predictivos desde Python o SQL Server Machine Learning Services.

### 12. Predicción y Toma de Decisiones
- Integrar predicciones en la aplicación (por ejemplo, análisis de tendencias de ventas, detección de fraudes o segmentación de clientes).
- Mostrar gráficos de predicciones dentro de la aplicación.

---

# Requisitos de la Aplicación

- **Módulo de Seguridad:** Login con usuario y contraseña, roles de acceso.
- **Módulo CRUD:** Crear, leer, actualizar y eliminar registros.
- **Módulo de Reportes:** Visualización de datos y generación de reportes en PDF y Excel.
- **Módulo de Respaldo:** Funcionalidad para realizar backups de la base de datos.
- **Módulo de Análisis de Datos:** Consultas avanzadas y visualización de gráficos.
- **Módulo de Predicción:** Uso de IA para análisis predictivo.

---

# Entrega del Proyecto

- Código de la aplicación y base de datos.
- Diagrama ER y documentación técnica (Diccionario de datos).
- Scripts de creación de tablas, funciones, procedimientos y consultas.
- Documentación del modelo de IA y su implementación.
- Reporte sobre el impacto de la optimización y análisis predictivo.

---

# Criterios de Evaluación

## Base de Datos (55%)

- Diagrama ER y Normalización — **10 pts**
- Seguridad y Bitácora — **10 pts**
- Backup y recuperación — **10 pts**
- Análisis de datos (cubos OLAP) — **10 pts**
- Consultas avanzadas — **10 pts**
- Monitoreo y optimización — **5 pts**

## Aplicación (25%)

- CRUD y Seguridad — **10 pts**
- Reportes en PDF y Excel — **10 pts**
- Respaldo desde la app — **5 pts**

## Modelos Predictivos e IA (20%)

- Implementación del modelo — **10 pts**
- Integración en la aplicación — **10 pts**