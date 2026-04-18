-- Script para verificar ventas por producto entre fechas
USE bdERP;
GO

SELECT
    DV.id_producto,
    P.nombre as nombre_producto,
    COUNT(*) as cantidad_ventas,
    SUM(DV.cantidad * DV.precio_unitario) as total_ventas
FROM DetalleVentas DV
JOIN Productos P ON DV.id_producto = P.id_producto
JOIN Ventas V ON DV.id_venta = V.id_venta
WHERE V.fecha >= '2026-03-03' AND V.fecha <= '2026-04-15'
GROUP BY DV.id_producto, P.nombre
ORDER BY total_ventas DESC;
GO

-- Ver productos que tienen "Iphone" en el nombre
SELECT id_producto, nombre
FROM Productos
WHERE nombre LIKE '%Iphone%' OR nombre LIKE '%iphone%' OR nombre LIKE '%Phone%';
GO