-- B. DEMOSTRACIÓN DE ELIMINACIÓN EN CASCADA (Usando tablas REALES)
-- Esto sí funciona en tus tablas reales porque borrar una Venta sí está permitido.
USE bdERP;
GO
PRINT '--- PRUEBA DELETE (CASCADA REAL) ---';
-- 1. Insertamos venta y detalle de prueba
DECLARE @id_v INT;
INSERT INTO Ventas (id_cliente, id_usuario, total) VALUES (1, 1, 100);
SET @id_v = SCOPE_IDENTITY();

INSERT INTO DetalleVentas (id_venta, id_producto, cantidad, precio_unitario) VALUES (@id_v, 1, 1, 100);

-- 2. Borramos la Venta y verificamos que el Detalle desaparece solo
DELETE FROM Ventas WHERE id_venta = @id_v;
SELECT 'Registros de detalle restantes: ' + CAST(COUNT(*) AS VARCHAR) 
FROM DetalleVentas WHERE id_venta = @id_v; -- Debe devolver 0
GO