USE bdERP;
GO

-- 1. Historial de Respaldos (Asegurar que la tabla existe)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LogBackups')
BEGIN
    CREATE TABLE LogBackups (
        id_backup INT PRIMARY KEY IDENTITY(1,1),
        id_usuario INT,
        ruta_archivo VARCHAR(500),
        nombre_archivo VARCHAR(255),
        tipo VARCHAR(50) DEFAULT 'FULL',
        fecha_inicio DATETIME DEFAULT GETDATE(),
        fecha_fin DATETIME,
        estado VARCHAR(50), -- EXITOSO, FALLIDO
        mensaje_error VARCHAR(MAX),
        CONSTRAINT FK_LogBackups_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
    );
END;
GO

-- 2. Procedimiento de BACKUP con SQL Dinámico
CREATE OR ALTER PROCEDURE sp_GenerarBackup
    @id_usuario INT,
    @ruta_base NVARCHAR(255) = 'C:\Backups\' 
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @nombre_db NVARCHAR(50) = DB_NAME();
    DECLARE @nombre_archivo NVARCHAR(255);
    DECLARE @ruta_completa NVARCHAR(500);
    DECLARE @timestamp NVARCHAR(20);
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @id_log INT;

    SET @timestamp = REPLACE(REPLACE(REPLACE(CONVERT(NVARCHAR(20), GETDATE(), 120), '-', ''), ':', ''), ' ', '_');
    SET @nombre_archivo = @nombre_db + '_' + @timestamp + '.bak';
    SET @ruta_completa = @ruta_base + @nombre_archivo;

    -- Registrar inicio
    INSERT INTO LogBackups (id_usuario, ruta_archivo, nombre_archivo, estado)
    VALUES (@id_usuario, @ruta_completa, @nombre_archivo, 'PROCESANDO');
    SET @id_log = SCOPE_IDENTITY();

    BEGIN TRY
        -- Usar SQL Dinámico para el comando BACKUP
        SET @sql = N'BACKUP DATABASE ' + QUOTENAME(@nombre_db) + 
                   N' TO DISK = ''' + @ruta_completa + ''' WITH FORMAT, NAME = ''Full Backup of ' + @nombre_db + '''';
        
        EXEC sp_executesql @sql;

        UPDATE LogBackups SET fecha_fin = GETDATE(), estado = 'EXITOSO' WHERE id_backup = @id_log;
        PRINT 'Backup exitoso en: ' + @ruta_completa;
    END TRY
    BEGIN CATCH
        UPDATE LogBackups SET fecha_fin = GETDATE(), estado = 'FALLIDO', mensaje_error = ERROR_MESSAGE() WHERE id_backup = @id_log;
        THROW;
    END CATCH
END;
GO

-- 3. Procedimiento de RESTORE (Recuperación)
CREATE OR ALTER PROCEDURE sp_RestaurarBackup
    @ruta_archivo NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @nombre_db NVARCHAR(50) = DB_NAME();
    DECLARE @sql NVARCHAR(MAX);

    BEGIN TRY
        -- Poner la base de datos en modo SINGLE_USER para cerrar conexiones
        SET @sql = N'ALTER DATABASE ' + QUOTENAME(@nombre_db) + N' SET SINGLE_USER WITH ROLLBACK IMMEDIATE; ' +
                   N'RESTORE DATABASE ' + QUOTENAME(@nombre_db) + N' FROM DISK = ''' + @ruta_archivo + N''' WITH REPLACE; ' +
                   N'ALTER DATABASE ' + QUOTENAME(@nombre_db) + N' SET MULTI_USER;';
        
        EXEC sp_executesql @sql;
        PRINT 'Restauración completada con éxito.';
    END TRY
    BEGIN CATCH
        -- Asegurar que vuelva a modo multiusuario si falla
        SET @sql = N'ALTER DATABASE ' + QUOTENAME(@nombre_db) + N' SET MULTI_USER;';
        EXEC sp_executesql @sql;
        THROW;
    END CATCH
END;
GO
