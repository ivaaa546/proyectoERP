USE bdERP;
GO

-- 1. Agregar columna 'aprobado' si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Usuarios') AND name = 'aprobado')
BEGIN
    ALTER TABLE Usuarios ADD aprobado BIT DEFAULT 1; -- Por defecto aprobados para no romper los existentes
END
GO

-- 2. Actualizar sp_Login para considerar aprobación
CREATE OR ALTER PROCEDURE sp_Login
    @correo VARCHAR(100),
    @password_hash VARBINARY(MAX),
    @ip_address VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_usuario INT;
    DECLARE @nombre_usuario VARCHAR(100);
    DECLARE @nombre_rol VARCHAR(50);
    DECLARE @id_rol INT;
    DECLARE @aprobado BIT;

    -- Buscar usuario activo con credenciales correctas
    SELECT 
        @id_usuario = U.id_usuario,
        @nombre_usuario = U.nombre,
        @id_rol = U.id_rol,
        @nombre_rol = R.nombre,
        @aprobado = U.aprobado
    FROM Usuarios U
    INNER JOIN Roles R ON U.id_rol = R.id_rol
    WHERE U.correo = @correo 
      AND U.password_hash = @password_hash
      AND U.activo = 1;

    IF @id_usuario IS NOT NULL
    BEGIN
        IF @aprobado = 0
        BEGIN
            SELECT 'FALLIDO' AS estado, 'Usuario en espera de aprobación' AS mensaje;
            RETURN;
        END

        -- Establecer el ID de usuario en el contexto de sesión
        EXEC sp_set_session_context @key = N'user_id', @value = @id_usuario;

        -- Registrar inicio de sesión exitoso
        INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, ip_address, fecha)
        VALUES (@id_usuario, 'LOGIN', 'Usuarios', 'Inicio de sesión exitoso', @ip_address, GETDATE());

        SELECT 
            @id_usuario AS id_usuario,
            @nombre_usuario AS nombre,
            @id_rol AS id_rol,
            @nombre_rol AS rol,
            'EXITOSO' AS estado;
    END
    ELSE
    BEGIN
        -- Registrar intento fallido
        INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, ip_address, fecha)
        VALUES (NULL, 'LOGIN_FAIL', 'Usuarios', 'Intento de sesión fallido para: ' + @correo, @ip_address, GETDATE());

        SELECT 'FALLIDO' AS estado, 'Credenciales incorrectas o usuario inactivo' AS mensaje;
    END
END;
GO

-- 3. Procedimiento para listar usuarios
CREATE OR ALTER PROCEDURE sp_Usuario_Listar
AS
BEGIN
    SELECT 
        U.id_usuario, U.nombre, U.correo, U.id_rol, R.nombre as rol, 
        CAST(U.activo AS INT) as activo, 
        CAST(U.aprobado AS INT) as aprobado,
        U.fecha_creacion
    FROM Usuarios U
    INNER JOIN Roles R ON U.id_rol = R.id_rol
    ORDER BY U.fecha_creacion DESC;
END;
GO

-- 4. Procedimiento para cambiar estado (activo/inactivo)
CREATE OR ALTER PROCEDURE sp_Usuario_SetEstado
    @id_usuario INT,
    @activo BIT
AS
BEGIN
    UPDATE Usuarios SET activo = @activo WHERE id_usuario = @id_usuario;
    
    INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
    VALUES (NULL, 'UPDATE', 'Usuarios', 'Cambio de estado activo=' + CAST(@activo AS VARCHAR(1)) + ' para user ID ' + CAST(@id_usuario AS VARCHAR(10)), GETDATE());
END;
GO

-- 5. Procedimiento para aprobar usuario
CREATE OR ALTER PROCEDURE sp_Usuario_Aprobar
    @id_usuario INT,
    @aprobado BIT
AS
BEGIN
    UPDATE Usuarios SET aprobado = @aprobado WHERE id_usuario = @id_usuario;
    
    INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
    VALUES (NULL, 'UPDATE', 'Usuarios', 'Estado aprobación=' + CAST(@aprobado AS VARCHAR(1)) + ' para user ID ' + CAST(@id_usuario AS VARCHAR(10)), GETDATE());
END;
GO
