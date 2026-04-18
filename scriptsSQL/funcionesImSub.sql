USE bdERP;
GO

-- 1. Función para calcular el Subtotal (Cantidad * Precio)
CREATE FUNCTION dbo.fn_CalcularSubtotal (
    @cantidad INT,
    @precio DECIMAL(18,2)
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    RETURN (ISNULL(@cantidad, 0) * ISNULL(@precio, 0));
END;
GO

-- 2. Función para calcular el IVA (12% por ejemplo)
CREATE FUNCTION dbo.fn_CalcularIVA (
    @monto DECIMAL(18,2)
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    RETURN (@monto * 0.12);
END;
GO

-- 3. Función para calcular el Total con Impuestos
CREATE FUNCTION dbo.fn_CalcularTotalConImpuestos (
    @cantidad INT,
    @precio DECIMAL(18,2)
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @subtotal DECIMAL(18,2);
    SET @subtotal = dbo.fn_CalcularSubtotal(@cantidad, @precio);
    RETURN @subtotal + dbo.fn_CalcularIVA(@subtotal);
END;
GO

-- Ejemplo de uso en una consulta de reporte:
-- SELECT nombre, dbo.fn_CalcularSubtotal(10, precio) as Subtotal, 
--        dbo.fn_CalcularIVA(dbo.fn_CalcularSubtotal(10, precio)) as IVA,
--        dbo.fn_CalcularTotalConImpuestos(10, precio) as Total
-- FROM Productos;
