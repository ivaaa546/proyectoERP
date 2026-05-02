USE bdERP;
GO

-- 1. Insertar Roles
INSERT INTO Roles (nombre, descripcion) VALUES 
('Administrador', 'Acceso total al sistema'),
('Vendedor', 'Acceso a ventas y consultas de inventario'),
('Reportes', 'Acceso a reportes');

-- 2. Insertar Categorías
INSERT INTO Categorias (nombre, descripcion) VALUES 
('Electrónica', 'Dispositivos, gadgets y accesorios'),
('Ropa', 'Prendas de vestir para todas las edades'),
('Hogar', 'Muebles y decoración para el hogar');

-- 3. Insertar Usuarios (Contraseña temporal en binario para ejemplo)
-- Nota: En la app real se usará HASH bytes desde Node.js
INSERT INTO Usuarios (nombre, correo, password_hash, id_rol) VALUES 
('Admin Sistema', 'admin@erp.com', 0x123456, 1),
('Vendedor Uno', 'vendedor1@erp.com', 0x123456, 2);

-- 4. Insertar Productos
INSERT INTO Productos (nombre, descripcion, precio, id_categoria) VALUES 
('Laptop Gamer', 'PC portátil de alto rendimiento', 1200.00, 1),
('Smartphone Pro', 'Teléfono inteligente de última generación', 850.00, 1),
('Camiseta Algodón', 'Camiseta básica 100% algodón', 15.50, 2),
('Sofá 3 plazas', 'Sofá cómodo para sala de estar', 450.00, 3);

-- 5. Insertar Inventario Inicial (Relacionado con los productos anteriores)
-- Si el stock actual baja de 5, habrá alertas
INSERT INTO Inventario (id_producto, stock_actual, stock_minimo) VALUES 
(1, 10, 5), -- ID Laptop
(2, 20, 5), -- ID Smartphone
(3, 50, 10), -- ID Camiseta
(4, 5, 2);   -- ID Sofá

-- 6. Insertar Clientes (Incluyendo Consumidor Final)
INSERT INTO Clientes (nombres, apellidos, documento_identidad, telefono) VALUES 
('Consumidor', 'Final', 'C/F', '00000000'),
('Juan', 'Perez', '1234567-8', '5555-1234');

-- Verificación rápida
SELECT 'Roles' as Tabla, COUNT(*) as Registros FROM Roles
UNION SELECT 'Categorias', COUNT(*) FROM Categorias
UNION SELECT 'Usuarios', COUNT(*) FROM Usuarios
UNION SELECT 'Productos', COUNT(*) FROM Productos
UNION SELECT 'Clientes', COUNT(*) FROM Clientes;
GO
