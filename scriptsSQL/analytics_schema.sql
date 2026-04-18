USE bdERP;
GO

-- 1. Crear Esquema para el Data Warehouse (Opcional, pero recomendado para separar OLTP de OLAP)
-- Si el entorno no soporta esquemas nuevos, se pueden usar prefijos dw_
CREATE SCHEMA dw;
GO

-- 2. Dimensiones (Punto 43 - Al menos 3 dimensiones)

-- Dim_Tiempo: Para análisis temporal (Día, Mes, Año, Trimestre)
CREATE TABLE dw.Dim_Tiempo (
    id_tiempo INT PRIMARY KEY, -- Formato YYYYMMDD
    fecha DATE NOT NULL,
    dia INT,
    mes INT,
    nombre_mes VARCHAR(20),
    anio INT,
    trimestre INT
);

-- Dim_Producto: Atributos estáticos del producto
CREATE TABLE dw.Dim_Producto (
    id_producto INT PRIMARY KEY,
    nombre VARCHAR(150),
    categoria VARCHAR(100),
    precio_actual DECIMAL(18,2)
);

-- Dim_Cliente: Segmentación de clientes
CREATE TABLE dw.Dim_Cliente (
    id_cliente INT PRIMARY KEY,
    nombre VARCHAR(150),
    documento VARCHAR(20)
);

-- 3. Tabla de Hechos (Punto 43 - Al menos una tabla de hechos)

CREATE TABLE dw.Hecho_Ventas (
    id_venta INT PRIMARY KEY,
    id_tiempo INT NOT NULL,
    id_producto INT NOT NULL,
    id_cliente INT NOT NULL,
    cantidad INT,
    total_venta DECIMAL(18,2),
    -- Relaciones
    CONSTRAINT FK_Hecho_Tiempo FOREIGN KEY (id_tiempo) REFERENCES dw.Dim_Tiempo(id_tiempo),
    CONSTRAINT FK_Hecho_Producto FOREIGN KEY (id_producto) REFERENCES dw.Dim_Producto(id_producto),
    CONSTRAINT FK_Hecho_Cliente FOREIGN KEY (id_cliente) REFERENCES dw.Dim_Cliente(id_cliente)
);
GO

-- 4. Procedimiento de Carga (ETL Básico)
-- Este procedimiento mueve datos de las tablas reales a las de análisis
CREATE PROCEDURE dw.sp_CargarDataWarehouse
AS
BEGIN
    SET NOCOUNT ON;

    -- Limpiar (Para efectos del ejemplo de carga total)
    DELETE FROM dw.Hecho_Ventas;
    DELETE FROM dw.Dim_Producto;
    DELETE FROM dw.Dim_Cliente;

    -- Cargar Dim_Producto
    INSERT INTO dw.Dim_Producto (id_producto, nombre, categoria, precio_actual)
    SELECT P.id_producto, P.nombre, C.nombre, P.precio
    FROM Productos P
    JOIN Categorias C ON P.id_categoria = C.id_categoria;

    -- Cargar Dim_Cliente
    INSERT INTO dw.Dim_Cliente (id_cliente, nombre, documento)
    SELECT id_cliente, nombre, documento_identidad FROM Clientes;

    -- Cargar Hecho_Ventas
    INSERT INTO dw.Hecho_Ventas (id_venta, id_tiempo, id_producto, id_cliente, cantidad, total_venta)
    SELECT 
        V.id_venta, 
        CAST(FORMAT(V.fecha, 'yyyyMMdd') AS INT), -- Convertir fecha a ID entero
        DV.id_producto, 
        V.id_cliente, 
        DV.cantidad, 
        DV.subtotal
    FROM Ventas V
    JOIN DetalleVentas DV ON V.id_venta = DV.id_venta;

    PRINT 'Data Warehouse actualizado con éxito.';
END;
GO

-- 5. Procedimiento para Poblar Dim_Tiempo (Necesario para evitar errores de FK)
CREATE OR ALTER PROCEDURE dw.sp_PoblarDimTiempo
    @anio_inicio INT,
    @anio_fin INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @FechaActual DATE;
    DECLARE @FechaFin DATE;
    
    SET @FechaActual = CAST(CAST(@anio_inicio AS VARCHAR) + '-01-01' AS DATE);
    SET @FechaFin = CAST(CAST(@anio_fin AS VARCHAR) + '-12-31' AS DATE);

    WHILE @FechaActual <= @FechaFin
    BEGIN
        INSERT INTO dw.Dim_Tiempo (id_tiempo, fecha, dia, mes, nombre_mes, anio, trimestre)
        VALUES (
            CAST(FORMAT(@FechaActual, 'yyyyMMdd') AS INT),
            @FechaActual,
            DAY(@FechaActual),
            MONTH(@FechaActual),
            DATENAME(MONTH, @FechaActual),
            YEAR(@FechaActual),
            DATEPART(QUARTER, @FechaActual)
        );
        SET @FechaActual = DATEADD(DAY, 1, @FechaActual);
    END
END;
GO
