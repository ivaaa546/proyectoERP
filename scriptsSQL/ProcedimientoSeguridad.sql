USE bdERP;
GO

-- 1. Procedimiento Almacenado para autenticación de usuarios (Login)
-- Requisito II - Punto 2-3
CREATE PROCEDURE sp_Login
    @correo VARCHAR(100),
    @password_hash VARBINARY(MAX), -- En producción se compara el hash enviado por la app
    @ip_address VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_usuario INT;
    DECLARE @nombre_usuario VARCHAR(100);
    DECLARE @nombre_rol VARCHAR(50);
    DECLARE @id_rol INT;

    -- Buscar usuario activo con credenciales correctas
    SELECT 
        @id_usuario = U.id_usuario,
        @nombre_usuario = U.nombre,
        @id_rol = U.id_rol,
        @nombre_rol = R.nombre
    FROM Usuarios U
    INNER JOIN Roles R ON U.id_rol = R.id_rol
    WHERE U.correo = @correo 
      AND U.password_hash = @password_hash
      AND U.activo = 1;

    IF @id_usuario IS NOT NULL
    BEGIN
        -- Establecer el ID de usuario en el contexto de sesión para los Triggers
        EXEC sp_set_session_context @key = N'user_id', @value = @id_usuario;

        -- Registrar inicio de sesión exitoso en Auditoría (Requisito 3)
        INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, ip_address, fecha)
        VALUES (@id_usuario, 'LOGIN', 'Usuarios', 'Inicio de sesión exitoso', @ip_address, GETDATE());

        -- Retornar datos del usuario y sus permisos
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

-- 2. Procedimiento para cambiar contraseña con validación
CREATE PROCEDURE sp_CambiarPassword
    @id_usuario INT,
    @password_viejo VARBINARY(MAX),
    @password_nuevo VARBINARY(MAX)
AS
BEGIN
    IF EXISTS(SELECT 1 FROM Usuarios WHERE id_usuario = @id_usuario AND password_hash = @password_viejo)
    BEGIN
        UPDATE Usuarios SET password_hash = @password_nuevo WHERE id_usuario = @id_usuario;
        
        INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
        VALUES (@id_usuario, 'UPDATE', 'Usuarios', 'Cambio de contraseña', GETDATE());
        
        SELECT 'EXITOSO' AS estado;
    END
    ELSE
    BEGIN
        SELECT 'FALLIDO' AS estado, 'La contraseña anterior no coincide' AS mensaje;
    END
END;
GO
