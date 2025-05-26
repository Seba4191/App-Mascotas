<?php
$nombre = $_POST['nombre'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$lat = $_POST['lat'] ?? '';
$lng = $_POST['lng'] ?? '';

if (!$nombre || !$descripcion || !$lat || !$lng) {
    exit('Faltan datos.');
}

$conn = new mysqli('127.0.0.1', 'root', '', 'mascotas');

if ($conn->connect_error) {
    die('Error de conexión: ' . $conn->connect_error);
}

$stmt = $conn->prepare("INSERT INTO reportes (nombre, descripcion, lat, lng) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssdd", $nombre, $descripcion, $lat, $lng);
$stmt->execute();
$stmt->close();
$conn->close();

echo "Mascota reportada con éxito.";
?>
