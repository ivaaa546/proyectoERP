USE bdERP;
GO

-- Script para insertar 30 días de ventas de prueba
-- Ejecutar todo este bloque en SQL Server Management Studio

DECLARE @fecha DATE = DATEADD(DAY, -30, GETDATE());
DECLARE @dias INT = 0;

WHILE @dias < 30
BEGIN
    -- Insertar venta (cliente 1, usuario 1)
    INSERT INTO Ventas (id_cliente, id_usuario, fecha, total)
    VALUES (1, 1, @fecha, 0);
    
    DECLARE @id_venta INT = SCOPE_IDENTITY();
    
    -- Insertar 1-3 productos por venta
    DECLARE @productos TABLE (id INT, precio DECIMAL(18,2));
    INSERT INTO @productos VALUES (1, 4800.00), (2, 3400.00), (3, 62.00), (4, 2250.00);
    
    DECLARE @cantidad INT = CAST(RAND() * 3 + 1 AS INT);
    DECLARE @prod INT = 0;
    DECLARE @precio DECIMAL(18,2);
    
    SET @prod = CAST(RAND() * 3 + 1 AS INT);
    SET @precio = (SELECT precio FROM Productos WHERE id_producto = @prod);
    
    INSERT INTO DetalleVentas (id_venta, id_producto, cantidad, precio_unitario)
    VALUES (@id_venta, @prod, @cantidad, @precio);
    
    -- Actualizar total
    UPDATE Ventas SET total = @cantidad * @precio WHERE id_venta = @id_venta;
    
    SET @fecha = DATEADD(DAY, 1, @fecha);
    SET @dias = @dias + 1;
END

PRINT 'Se insertaron 30 ventas de prueba';
GO