USE bdERP;
GO

-- Script para insertar 30 días adicionales de ventas con valores más variados
-- Ejecutar después del primer script

DECLARE @fecha DATE = DATEADD(DAY, -30, GETDATE());
DECLARE @dias INT = 0;

WHILE @dias < 30
BEGIN
    -- Insertar venta con valores más altos para mejor entrenamiento
    INSERT INTO Ventas (id_cliente, id_usuario, fecha, total)
    VALUES (1, 1, @fecha, 0);

    DECLARE @id_venta INT = SCOPE_IDENTITY();

    -- Usar productos con precios más variados
    DECLARE @producto1 INT = 1;
    DECLARE @producto2 INT = 2;
    DECLARE @cantidad1 INT = CAST(RAND() * 3 + 1 AS INT);
    DECLARE @cantidad2 INT = CAST(RAND() * 2 + 1 AS INT);

    -- Insertar 2 productos por venta (para más valor)
    INSERT INTO DetalleVentas (id_venta, id_producto, cantidad, precio_unitario)
    VALUES (@id_venta, @producto1, @cantidad1, 4800.00);

    INSERT INTO DetalleVentas (id_venta, id_producto, cantidad, precio_unitario)
    VALUES (@id_venta, @producto2, @cantidad2, 3400.00);

    -- Actualizar total
    UPDATE Ventas SET total = (@cantidad1 * 4800.00) + (@cantidad2 * 3400.00)
    WHERE id_venta = @id_venta;

    SET @fecha = DATEADD(DAY, 1, @fecha);
    SET @dias = @dias + 1;
END

PRINT 'Se insertaron 30 ventas adicionales con valores más altos';
GO