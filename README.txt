1. Crear la base de datos 'mascotas' y esta tabla:
CREATE TABLE reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

2. Actualizar los datos de conexión en reportar.php y reportes.php.

3. Subir todos los archivos a un servidor con PHP y MySQL.
