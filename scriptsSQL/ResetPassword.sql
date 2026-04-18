USE bdERP;
GO

-- Procedimiento para que un Administrador restablezca la contraseña de un usuario
CREATE OR ALTER PROCEDURE sp_Admin_ResetPassword
    @id_usuario INT,
    @password_hash VARBINARY(MAX),
    @id_admin INT -- Opcional, para bitácora
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar si el usuario existe
    IF EXISTS(SELECT 1 FROM Usuarios WHERE id_usuario = @id_usuario)
    BEGIN
        -- Actualizar la contraseña
        UPDATE Usuarios 
        SET password_hash = @password_hash
        WHERE id_usuario = @id_usuario;

        -- Registrar en bitácora
        INSERT INTO Auditoria (id_usuario, accion, tabla_afectada, detalle, fecha)
        VALUES (@id_admin, 'UPDATE', 'Usuarios', 'Restablecimiento de contraseña por administrador para usuario ' + CAST(@id_usuario AS VARCHAR(10)), GETDATE());

        SELECT 'EXITOSO' AS estado, 'Contraseña restablecida exitosamente.' AS mensaje;
    END
    ELSE
    BEGIN
        SELECT 'FALLIDO' AS estado, 'El usuario no existe.' AS mensaje;
    END
END;
GO
