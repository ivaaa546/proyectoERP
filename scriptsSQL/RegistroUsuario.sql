
-- 6. Procedimiento para Auto-Registro de Usuario
CREATE OR ALTER PROCEDURE sp_Usuario_RegistroPublico
    @nombre VARCHAR(100),
    @correo VARCHAR(100),
    @password_hash VARBINARY(MAX),
    @id_rol INT
AS
BEGIN
    -- Validar si el correo ya existe
    IF EXISTS(SELECT 1 FROM Usuarios WHERE correo = @correo)
    BEGIN
        SELECT 'FALLIDO' AS estado, 'El correo ya está registrado' AS mensaje;
        RETURN;
    END

    -- Insertar el usuario con activo=1 pero aprobado=0 (Pendiente de aprobación)
    INSERT INTO Usuarios (nombre, correo, password_hash, id_rol, activo, aprobado)
    VALUES (@nombre, @correo, @password_hash, @id_rol, 1, 0);

    DECLARE @NewUsuarioId INT = SCOPE_IDENTITY();

    -- Registrar en bitácora
    INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
    VALUES (@NewUsuarioId, 'INSERT', 'Usuarios', 'Auto-registro de usuario pendiente de aprobación', GETDATE());

    SELECT 'EXITOSO' AS estado, 'Usuario registrado. Pendiente de aprobación por un administrador.' AS mensaje;
END;
GO
