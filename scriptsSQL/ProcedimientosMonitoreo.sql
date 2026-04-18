USE bdERP;
GO

-- 1. Tabla de Monitoreo de Rendimiento (Requisito VI - Punto 8)
CREATE TABLE MonitoreoRendimiento (
    id_monitoreo INT PRIMARY KEY IDENTITY(1,1),
    nombre_consulta VARCHAR(255) NOT NULL,
    tiempo_inicio DATETIME DEFAULT GETDATE(),
    tiempo_fin DATETIME,
    duracion_ms AS (DATEDIFF(MILLISECOND, tiempo_inicio, tiempo_fin)),
    id_usuario INT, -- Quién ejecutó la consulta
    exitoso BIT DEFAULT 1,
    CONSTRAINT FK_Monitoreo_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
GO

-- 2. Procedimiento Almacenado para Registrar el Rendimiento
-- Se usará al inicio y fin de procesos pesados (como reportes o backups)
CREATE PROCEDURE sp_RegistrarMonitoreo
    @nombre_consulta VARCHAR(255),
    @tiempo_inicio DATETIME,
    @tiempo_fin DATETIME,
    @id_usuario INT,
    @exitoso BIT = 1
AS
BEGIN
    INSERT INTO MonitoreoRendimiento (nombre_consulta, tiempo_inicio, tiempo_fin, id_usuario, exitoso)
    VALUES (@nombre_consulta, @tiempo_inicio, @tiempo_fin, @id_usuario, @exitoso);
END;
GO

-- 3. Ejemplo de cómo usar el monitoreo en una consulta pesada
-- (Ejemplo de consulta con CTE y agregación como pide el punto 7)
CREATE PROCEDURE sp_ReporteRendimientoVentas
    @id_usuario INT
AS
BEGIN
    DECLARE @Inicio DATETIME = GETDATE();
    
    -- Consulta de ejemplo (Reporte de ventas por categoría)
    WITH VentasDetalle AS (
        SELECT C.nombre AS Categoria, SUM(DV.subtotal) AS TotalVentas
        FROM Categorias C
        JOIN Productos P ON C.id_categoria = P.id_categoria
        JOIN DetalleVentas DV ON P.id_producto = DV.id_producto
        GROUP BY C.nombre
    )
    SELECT * FROM VentasDetalle;

    DECLARE @Fin DATETIME = GETDATE();

    -- Registrar el tiempo en la tabla de monitoreo
    EXEC sp_RegistrarMonitoreo 'Reporte Mensual Categorias', @Inicio, @Fin, @id_usuario, 1;
END;
GO
