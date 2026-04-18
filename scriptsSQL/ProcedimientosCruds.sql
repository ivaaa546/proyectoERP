USE bdERP;
GO

---------------------------------------------------------
-- 1. CRUD PRODUCTOS
---------------------------------------------------------

-- Crear Producto e Inicializar Inventario
CREATE OR ALTER PROCEDURE sp_Producto_Crear
    @nombre VARCHAR(150),
    @descripcion VARCHAR(300),
    @precio DECIMAL(18,2),
    @id_categoria INT,
    @stock_inicial INT,
    @id_usuario_audit INT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
            DECLARE @id_nuevo_prod INT;
            
            INSERT INTO Productos (nombre, descripcion, precio, id_categoria, activo)
            VALUES (@nombre, @descripcion, @precio, @id_categoria, 1);
            
            SET @id_nuevo_prod = SCOPE_IDENTITY();
            
            INSERT INTO Inventario (id_producto, stock_actual)
            VALUES (@id_nuevo_prod, @stock_inicial);

        COMMIT TRANSACTION;
        SELECT @id_nuevo_prod AS ID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Actualizar Producto
CREATE OR ALTER PROCEDURE sp_Producto_Actualizar
    @id_producto INT,
    @nombre VARCHAR(150),
    @descripcion VARCHAR(300),
    @precio DECIMAL(18,2),
    @id_categoria INT
AS
BEGIN
    UPDATE Productos 
    SET nombre = @nombre, descripcion = @descripcion, precio = @precio, id_categoria = @id_categoria
    WHERE id_producto = @id_producto;
END;
GO

-- Eliminar Producto (Físico - Cascada)
CREATE OR ALTER PROCEDURE sp_Producto_Eliminar
    @id_producto INT
AS
BEGIN
    -- Primero eliminamos del inventario (por la FK)
    DELETE FROM Inventario WHERE id_producto = @id_producto;
    -- Luego el producto
    DELETE FROM Productos WHERE id_producto = @id_producto;
END;
GO

-- Cambiar Estado Producto (Activación/Desactivación)
CREATE OR ALTER PROCEDURE sp_Producto_Estado
    @id_producto INT,
    @activo BIT
AS
BEGIN
    UPDATE Productos SET activo = @activo WHERE id_producto = @id_producto;
END;
GO

-- Listar Productos
CREATE OR ALTER PROCEDURE sp_Producto_Listar
AS
BEGIN
    SELECT P.id_producto, P.nombre, P.descripcion, P.precio, P.id_categoria,
           C.nombre as categoria, I.stock_actual, I.stock_minimo,
           CAST(ISNULL(P.activo, 1) AS INT) as activo 
    FROM Productos P
    INNER JOIN Categorias C ON P.id_categoria = C.id_categoria
    LEFT JOIN Inventario I ON P.id_producto = I.id_producto
    ORDER BY P.id_producto DESC;
END;
GO

---------------------------------------------------------
-- 2. CRUD CLIENTES (Normalizado: Nombres y Apellidos)
---------------------------------------------------------

-- Crear Cliente
CREATE OR ALTER PROCEDURE sp_Cliente_Crear
    @nombres VARCHAR(100),
    @apellidos VARCHAR(100),
    @documento VARCHAR(20),
    @telefono VARCHAR(20)
AS
BEGIN
    INSERT INTO Clientes (nombres, apellidos, documento_identidad, telefono, activo)
    VALUES (@nombres, @apellidos, @documento, @telefono, 1);
    SELECT SCOPE_IDENTITY() AS id_cliente;
END;
GO

-- Actualizar Cliente
CREATE OR ALTER PROCEDURE sp_Cliente_Actualizar
    @id_cliente INT,
    @nombres VARCHAR(100),
    @apellidos VARCHAR(100),
    @documento VARCHAR(20),
    @telefono VARCHAR(20)
AS
BEGIN
    UPDATE Clientes 
    SET nombres = @nombres, apellidos = @apellidos, documento_identidad = @documento, telefono = @telefono
    WHERE id_cliente = @id_cliente;
END;
GO

-- Listar Clientes
CREATE OR ALTER PROCEDURE sp_Cliente_Listar
AS
BEGIN
    SELECT 
        id_cliente, nombres, apellidos, documento_identidad, telefono, fecha_registro,
        CAST(ISNULL(activo, 1) AS INT) as activo
    FROM Clientes
    ORDER BY id_cliente DESC;
END;
GO

-- Cambiar Estado Cliente (Activación/Desactivación)
CREATE OR ALTER PROCEDURE sp_Cliente_Estado
    @id_cliente INT,
    @activo BIT
AS
BEGIN
    UPDATE Clientes SET activo = @activo WHERE id_cliente = @id_cliente;
END;
GO

---------------------------------------------------------
-- 3. CRUD CATEGORIAS
---------------------------------------------------------
-- Añadir la columna faltante a la tabla existente
ALTER TABLE Categorias 
ADD activo BIT DEFAULT 1 WITH VALUES;
GO
-- Listar Categorías (Todas con detalle)
CREATE OR ALTER PROCEDURE sp_Categoria_Listar
AS
BEGIN
    SELECT id_categoria, nombre, descripcion, CAST(ISNULL(activo, 1) AS INT) as activo 
    FROM Categorias 
    ORDER BY nombre ASC;
END;
GO

-- Crear Categoría
CREATE OR ALTER PROCEDURE sp_Categoria_Crear
    @nombre VARCHAR(100),
    @descripcion VARCHAR(255)
AS
BEGIN
    INSERT INTO Categorias (nombre, descripcion, activo)
    VALUES (@nombre, @descripcion, 1);
    SELECT SCOPE_IDENTITY() AS ID;
END;
GO

-- Actualizar Categoría
CREATE OR ALTER PROCEDURE sp_Categoria_Actualizar
    @id_categoria INT,
    @nombre VARCHAR(100),
    @descripcion VARCHAR(255)
AS
BEGIN
    UPDATE Categorias 
    SET nombre = @nombre, descripcion = @descripcion
    WHERE id_categoria = @id_categoria;
END;
GO

-- Eliminar Categoría (Solo Admin - Se valida en App, pero aquí se maneja la eliminación física)
CREATE OR ALTER PROCEDURE sp_Categoria_Eliminar
    @id_categoria INT
AS
BEGIN
    -- Nota: Esto puede fallar si hay productos asociados.
    DELETE FROM Categorias WHERE id_categoria = @id_categoria;
END;
GO

-- Cambiar Estado Categoría (Desactivar/Activar)
CREATE OR ALTER PROCEDURE sp_Categoria_Estado
    @id_categoria INT,
    @activo BIT
AS
BEGIN
    UPDATE Categorias SET activo = @activo WHERE id_categoria = @id_categoria;
END;
GO

---------------------------------------------------------
-- 4. CRUD USUARIOS (Gestión de Empleados)
---------------------------------------------------------

-- Crear Usuario (Empleado)
CREATE OR ALTER PROCEDURE sp_Usuario_Crear
    @nombre VARCHAR(100),
    @correo VARCHAR(100),
    @pass VARBINARY(MAX),
    @id_rol INT
AS
BEGIN
    INSERT INTO Usuarios (nombre, correo, password_hash, id_rol, activo)
    VALUES (@nombre, @correo, @pass, @id_rol, 1);
END;
GO

-- Desactivar Usuario
CREATE OR ALTER PROCEDURE sp_Usuario_Desactivar
    @id_usuario INT
AS
BEGIN
    UPDATE Usuarios SET activo = 0 WHERE id_usuario = @id_usuario;
END;
GO

---------------------------------------------------------
-- 5. GESTIÓN DE INVENTARIO
---------------------------------------------------------

-- Actualizar stock directamente (Actual y Mínimo)
CREATE OR ALTER PROCEDURE sp_Inventario_ActualizarStock
    @id_producto INT,
    @nueva_cantidad INT,
    @nuevo_minimo INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Inventario
    SET stock_actual = @nueva_cantidad,
        stock_minimo = @nuevo_minimo,
        ultima_actualizacion = GETDATE()
    WHERE id_producto = @id_producto;
    
    SELECT @@ROWCOUNT AS Actualizados;
END;
GO
