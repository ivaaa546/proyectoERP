USE bdERP;
GO

-- 1. Reporte de Rendimiento de Ventas por Categoría (Uso de CTE y Agregación)
CREATE OR ALTER PROCEDURE sp_Reporte_VentasPorCategoria
AS
BEGIN
    SET NOCOUNT ON;
    WITH TotalVentas AS (
        SELECT SUM(total) as GranTotal FROM Ventas
    ),
    VentasPorCategoria AS (
        SELECT 
            C.nombre as Categoria,
            ISNULL(SUM(DV.subtotal), 0) as SubtotalCategoria,
            COUNT(DISTINCT V.id_venta) as CantidadTransacciones
        FROM Categorias C
        LEFT JOIN Productos P ON C.id_categoria = P.id_categoria
        LEFT JOIN DetalleVentas DV ON P.id_producto = DV.id_producto
        LEFT JOIN Ventas V ON DV.id_venta = V.id_venta
        GROUP BY C.nombre
    )
    SELECT 
        VPC.*,
        CAST((VPC.SubtotalCategoria / ISNULL(NULLIF(TV.GranTotal, 0), 1)) * 100 AS DECIMAL(5,2)) as PorcentajeDelTotal
    FROM VentasPorCategoria VPC, TotalVentas TV;
END;
GO

-- 2. Reporte de Clientes VIP (Uso de Subconsultas)
CREATE OR ALTER PROCEDURE sp_Reporte_ClientesVIP
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @PromedioVentas DECIMAL(18,2) = (SELECT ISNULL(AVG(total), 0) FROM Ventas);

    SELECT 
        nombres + ' ' + apellidos as nombre, 
        documento_identidad,
        (SELECT ISNULL(SUM(total), 0) FROM Ventas WHERE id_cliente = C.id_cliente) as TotalGastado
    FROM Clientes C
    WHERE id_cliente IN (
        SELECT id_cliente 
        FROM Ventas 
        GROUP BY id_cliente 
        HAVING SUM(total) > @PromedioVentas
    )
    ORDER BY TotalGastado DESC;
END;
GO

-- 3. Reporte Jerárquico de Productos y Ventas (Datos Jerárquicos)
CREATE OR ALTER PROCEDURE sp_Reporte_Jerarquico
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        C.nombre as Categoria,
        P.nombre as Producto,
        COUNT(DV.id_detalle) as VecesVendido,
        ISNULL(SUM(DV.cantidad), 0) as TotalUnidadesVendidas
    FROM Categorias C
    LEFT JOIN Productos P ON C.id_categoria = P.id_categoria
    LEFT JOIN DetalleVentas DV ON P.id_producto = DV.id_producto
    GROUP BY C.nombre, P.nombre
    ORDER BY C.nombre, P.nombre;
END;
GO

-- 4. Reporte de Evolución de Ventas (Agrupado por Año, Mes y Día)
CREATE OR ALTER PROCEDURE sp_Reporte_VentasTiempo
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        YEAR(fecha) as Año,
        MONTH(fecha) as Mes,
        DAY(fecha) as Dia,
        COUNT(id_venta) as CantidadOperaciones,
        SUM(total) as TotalGenerado
    FROM Ventas
    GROUP BY YEAR(fecha), MONTH(fecha), DAY(fecha)
    ORDER BY Año DESC, Mes DESC, Dia DESC;
END;
GO
