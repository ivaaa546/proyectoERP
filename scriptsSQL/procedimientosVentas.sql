USE bdERP;
GO

-- 1. Procedimiento Almacenado para registrar una venta completa usando JSON
-- Esta versión es compatible con entornos Next.js y evita errores de driver mssql
CREATE OR ALTER PROCEDURE sp_RegistrarVenta
    @id_cliente INT,
    @id_usuario INT,
    @detallesJSON NVARCHAR(MAX) -- Recibe el carrito como texto JSON
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Establecer el contexto de sesión para que los triggers de auditoría funcionen correctamente
    EXEC sys.sp_set_session_context @key = N'user_id', @value = @id_usuario;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- A. Insertar el encabezado de la venta (Total se calculará después)
        DECLARE @id_nueva_venta INT;
        INSERT INTO Ventas (id_cliente, id_usuario, fecha, total)
        VALUES (@id_cliente, @id_usuario, GETDATE(), 0);

        SET @id_nueva_venta = SCOPE_IDENTITY();

        -- B. Insertar los detalles de la venta desde el JSON usando OPENJSON
        INSERT INTO DetalleVentas (id_venta, id_producto, cantidad, precio_unitario)
        SELECT @id_nueva_venta, id_producto, cantidad, precio_unitario
        FROM OPENJSON(@detallesJSON)
        WITH (
            id_producto INT,
            cantidad INT,
            precio_unitario DECIMAL(18,2)
        );

        -- C. Calcular el total final usando la función de impuestos
        DECLARE @total_acumulado_base DECIMAL(18,2);
        SELECT @total_acumulado_base = SUM(cantidad * precio_unitario) 
        FROM DetalleVentas 
        WHERE id_venta = @id_nueva_venta;

        -- Aplicamos la función que tú creaste para el total con IVA
        DECLARE @total_con_iva DECIMAL(18,2);
        SET @total_con_iva = dbo.fn_CalcularTotalConImpuestos(1, ISNULL(@total_acumulado_base, 0));

        UPDATE Ventas SET total = @total_con_iva 
        WHERE id_venta = @id_nueva_venta;

        COMMIT TRANSACTION;
        
        -- Retornar el ID y Total final
        SELECT @id_nueva_venta AS ID, @total_con_iva AS Total;

    END TRY
    BEGIN CATCH
        -- En caso de error (ej. falta de stock disparado por el trigger), se deshace todo
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 2. Procedimiento para listar el historial de ventas
CREATE OR ALTER PROCEDURE sp_Venta_Listar
AS
BEGIN
    SELECT 
        V.id_venta, 
        V.fecha, 
        V.total, 
        C.nombres + ' ' + C.apellidos as cliente, 
        U.nombre as vendedor
    FROM Ventas V
    INNER JOIN Clientes C ON V.id_cliente = C.id_cliente
    INNER JOIN Usuarios U ON V.id_usuario = U.id_usuario
    ORDER BY V.fecha DESC;
END;
GO

-- 4. Procedimiento para obtener los productos de una venta específica
CREATE OR ALTER PROCEDURE sp_Venta_ObtenerDetalle
    @id_venta INT
AS
BEGIN
    SELECT 
        DV.id_detalle,
        P.nombre AS producto,
        DV.cantidad,
        DV.precio_unitario,
        DV.subtotal, -- Columna calculada en la tabla
        dbo.fn_CalcularSubtotal(DV.cantidad, DV.precio_unitario) AS subtotal_neto,
        dbo.fn_CalcularIVA(dbo.fn_CalcularSubtotal(DV.cantidad, DV.precio_unitario)) AS iva_monto
    FROM DetalleVentas DV
    INNER JOIN Productos P ON DV.id_producto = P.id_producto
    WHERE DV.id_venta = @id_venta;
END;
GO
