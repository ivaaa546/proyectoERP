USE bdERP;
GO

-- 1. Trigger para actualizar el stock automáticamente al realizar una venta
CREATE OR ALTER TRIGGER trg_ActualizarStockVenta
ON DetalleVentas
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE I
    SET I.stock_actual = I.stock_actual - ins.cantidad,
        I.ultima_actualizacion = GETDATE()
    FROM Inventario I
    INNER JOIN inserted ins ON I.id_producto = ins.id_producto;
END;
GO

-- 2. Trigger para devolver stock si se elimina un detalle de venta
CREATE OR ALTER TRIGGER trg_DevolverStockCancelacion
ON DetalleVentas
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE I
    SET I.stock_actual = I.stock_actual + del.cantidad,
        I.ultima_actualizacion = GETDATE()
    FROM Inventario I
    INNER JOIN deleted del ON I.id_producto = del.id_producto;
END;
GO

-- 3. Trigger para validar stock suficiente (Insteaf of Insert) con manejo de transacciones
CREATE OR ALTER TRIGGER trg_ValidarStockSuficiente
ON DetalleVentas
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM inserted ins
        JOIN Inventario I ON ins.id_producto = I.id_producto
        WHERE I.stock_actual < ins.cantidad
    )
    BEGIN
        RAISERROR ('Error: No hay stock suficiente para uno o más productos.', 16, 1);
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        RETURN;
    END
    ELSE
    BEGIN
        INSERT INTO DetalleVentas (id_venta, id_producto, cantidad, precio_unitario)
        SELECT id_venta, id_producto, cantidad, precio_unitario FROM inserted;
    END
END;
GO

-- 4. Triggers de Auditoría con Trazabilidad Real (SESSION_CONTEXT)

CREATE OR ALTER TRIGGER trg_AuditoriaGenerica
ON Productos AFTER INSERT, UPDATE, DELETE AS
BEGIN
    DECLARE @id_usuario INT = CAST(SESSION_CONTEXT(N'user_id') AS INT);
    DECLARE @accion VARCHAR(50) = CASE 
        WHEN EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted) THEN 'UPDATE'
        WHEN EXISTS(SELECT * FROM inserted) THEN 'INSERT'
        ELSE 'DELETE' END;

    INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
    SELECT @id_usuario, @accion, 'Productos', 
           'ProductoID: ' + CAST(ISNULL(i.id_producto, d.id_producto) AS VARCHAR), GETDATE()
    FROM inserted i FULL OUTER JOIN deleted d ON i.id_producto = d.id_producto;
END;
GO

CREATE OR ALTER TRIGGER trg_AuditoriaUsuarios
ON Usuarios AFTER INSERT, UPDATE, DELETE AS
BEGIN
    DECLARE @id_usuario INT = CAST(SESSION_CONTEXT(N'user_id') AS INT);
    DECLARE @accion VARCHAR(50) = CASE 
        WHEN EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted) THEN 'UPDATE'
        WHEN EXISTS(SELECT * FROM inserted) THEN 'INSERT'
        ELSE 'DELETE' END;

    INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
    SELECT @id_usuario, @accion, 'Usuarios', 
           'UserMail: ' + ISNULL(i.correo, d.correo), GETDATE()
    FROM inserted i FULL OUTER JOIN deleted d ON i.id_usuario = d.id_usuario;
END;
GO

-- Trigger de Auditoría de Clientes (Actualizado para nombres y apellidos)
CREATE OR ALTER TRIGGER trg_AuditoriaClientes
ON Clientes AFTER INSERT, UPDATE, DELETE AS
BEGIN
    DECLARE @id_usuario INT = CAST(SESSION_CONTEXT(N'user_id') AS INT);
    DECLARE @accion VARCHAR(50) = CASE 
        WHEN EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted) THEN 'UPDATE'
        WHEN EXISTS(SELECT * FROM inserted) THEN 'INSERT'
        ELSE 'DELETE' END;

    INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
    SELECT @id_usuario, @accion, 'Clientes', 
           'Cliente: ' + ISNULL(i.nombres + ' ' + i.apellidos, d.nombres + ' ' + d.apellidos), GETDATE()
    FROM inserted i FULL OUTER JOIN deleted d ON d.id_cliente = i.id_cliente;
END;
GO

-- 5. Trigger de Auditoría de Ventas (Captura facturación real)
CREATE OR ALTER TRIGGER trg_AuditoriaVentas
ON Ventas AFTER INSERT AS
BEGIN
    DECLARE @id_usuario INT = CAST(SESSION_CONTEXT(N'user_id') AS INT);
    
    INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
    SELECT @id_usuario, 'INSERT', 'Ventas', 
           'Venta registrada ID: ' + CAST(id_venta AS VARCHAR) + ' | Total: $' + CAST(total AS VARCHAR), GETDATE()
    FROM inserted;
END;
GO
