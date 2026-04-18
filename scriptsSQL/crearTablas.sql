-- Crear la base de datos
CREATE DATABASE bdERP;
GO

USE bdERP;
GO

-- 1. Tabla de Roles
CREATE TABLE Roles (
    id_rol INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- 2. Tabla de Usuarios
CREATE TABLE Usuarios (
    id_usuario INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARBINARY(MAX) NOT NULL,
    id_rol INT NOT NULL,
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

-- 3. Tabla de Categorías
CREATE TABLE Categorias (
    id_categoria INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BIT DEFAULT 1 -- Columna para desactivación lógica
);

-- 4. Tabla de Productos
CREATE TABLE Productos (
    id_producto INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(300),
    precio DECIMAL(18,2) NOT NULL CHECK (precio >= 0),
    id_categoria INT NOT NULL,
    activo BIT DEFAULT 1, -- Columna añadida para activación/desactivación
    fecha_registro DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Productos_Categorias FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria) 
        ON UPDATE CASCADE -- Requisito de cascada
);

-- 5. Tabla de Inventario
CREATE TABLE Inventario (
    id_inventario INT PRIMARY KEY IDENTITY(1,1),
    id_producto INT NOT NULL UNIQUE,
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    ultima_actualizacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Inventario_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- 6. Tabla de Clientes
CREATE TABLE Clientes (
    id_cliente INT PRIMARY KEY IDENTITY(1,1),
    nombres VARCHAR(100) NOT NULL, -- Normalizado: Separado de apellidos
    apellidos VARCHAR(100) NOT NULL, -- Normalizado
    documento_identidad VARCHAR(20), 
    telefono VARCHAR(20),
    activo BIT DEFAULT 1, -- Columna añadida para desactivación lógica
    fecha_registro DATETIME DEFAULT GETDATE()
);

-- Índice Único Filtrado: Solo valida unicidad si no es 'C/F' y no es NULL
CREATE UNIQUE INDEX IX_Clientes_Documento_Unico 
ON Clientes(documento_identidad) 
WHERE documento_identidad IS NOT NULL AND documento_identidad <> 'C/F';

-- 7. Tabla de Ventas
CREATE TABLE Ventas (
    id_venta INT PRIMARY KEY IDENTITY(1,1),
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL, -- El vendedor que realizó la operación
    fecha DATETIME DEFAULT GETDATE(),
    total DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT FK_Ventas_Clientes FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    CONSTRAINT FK_Ventas_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- 8. Tabla de Detalle de Ventas
CREATE TABLE DetalleVentas (
    id_detalle INT PRIMARY KEY IDENTITY(1,1),
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(18,2) NOT NULL,
    subtotal AS (cantidad * precio_unitario),
    CONSTRAINT FK_Detalle_Ventas FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta) ON DELETE CASCADE,
    CONSTRAINT FK_Detalle_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- 9. Tabla de Auditoría (Bitácora)
CREATE TABLE Auditoria (
    id_log INT PRIMARY KEY IDENTITY(1,1),
    id_usuario INT,
    accion VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN
    tabla_afectada VARCHAR(50),
    detalle VARCHAR(300),
    ip_address VARCHAR(50),
    fecha DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Auditoria_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Índices básicos para optimización (Requisito VI)
CREATE INDEX IX_Productos_Categoria ON Productos(id_categoria);
CREATE INDEX IX_Ventas_Fecha ON Ventas(fecha);
CREATE INDEX IX_Ventas_Cliente ON Ventas(id_cliente);
CREATE INDEX IX_DetalleVentas_Venta ON DetalleVentas(id_venta);
