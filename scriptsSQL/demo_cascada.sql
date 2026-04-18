-- REQUISITO V - PUNTO 56: Demostración de Cascada con tablas temporales
-- (Ya que las originales usan IDENTITY y no permiten UPDATE)

-- 1. Crear tabla padre temporal
CREATE TABLE #CategoriasPrueba (
    id INT PRIMARY KEY,
    nombre VARCHAR(50)
);

-- 2. Crear tabla hija temporal con ON UPDATE CASCADE
CREATE TABLE #ProductosPrueba (
    id_prod INT PRIMARY KEY,
    nombre VARCHAR(50),
    id_cat_fk INT FOREIGN KEY REFERENCES #CategoriasPrueba(id) ON UPDATE CASCADE
);

-- 3. Insertar datos iniciales
INSERT INTO #CategoriasPrueba VALUES (1, 'Electrónica');
INSERT INTO #ProductosPrueba VALUES (101, 'Laptop', 1);

PRINT '--- ANTES DEL UPDATE ---';
SELECT * FROM #ProductosPrueba; -- Muestra que el producto tiene la categoría 1

-- 4. REALIZAR EL UPDATE EN LA TABLA PADRE
UPDATE #CategoriasPrueba SET id = 99 WHERE id = 1;

PRINT '--- DESPUÉS DEL UPDATE (CASCADA) ---';
SELECT * FROM #ProductosPrueba; -- ¡Ahora el producto tiene categoría 99 automáticamente!

-- Limpiar
DROP TABLE #ProductosPrueba;
DROP TABLE #CategoriasPrueba;
