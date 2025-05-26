<?php
$conn = new mysqli('127.0.0.1', 'root', '', 'mascotas');
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$result = $conn->query("SELECT nombre, descripcion, lat, lng FROM reportes");
$reportes = [];

while ($row = $result->fetch_assoc()) {
    $reportes[] = $row;
}

echo json_encode($reportes);
$conn->close();
?>
