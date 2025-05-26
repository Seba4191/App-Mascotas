<?php
header('Content-Type: application/json');
require_once 'config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = $conn->real_escape_string($data['email']);
    $password = $data['password'];
    
    // Verificar si el correo ya existe
    $checkEmail = "SELECT id FROM usuarios WHERE email = '$email'";
    $result = $conn->query($checkEmail);
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Este correo electrónico ya está registrado']);
        $conn->close();
        exit();
    }
    
    // Hash de la contraseña
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar nuevo usuario
    $sql = "INSERT INTO usuarios (email, password) VALUES ('$email', '$hashedPassword')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Registro exitoso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();
?> 