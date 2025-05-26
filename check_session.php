<?php
// Configurar el tiempo de vida de la sesión antes de iniciarla
ini_set('session.gc_maxlifetime', 30 * 24 * 60 * 60); // 30 días
ini_set('session.cookie_lifetime', 30 * 24 * 60 * 60); // 30 días

session_start();

// Renovar la cookie de sesión
if (isset($_SESSION['user_id'])) {
    $lifetime = 30 * 24 * 60 * 60; // 30 días
    setcookie(session_name(), session_id(), time() + $lifetime, '/');
}

// Asegurarse de que la sesión esté activa y tenga los datos necesarios
$isAuthenticated = isset($_SESSION['user_id']) && !empty($_SESSION['user_id']) && 
                  isset($_SESSION['email']) && !empty($_SESSION['email']);

header('Content-Type: application/json');
echo json_encode([
    'authenticated' => $isAuthenticated,
    'email' => $isAuthenticated ? $_SESSION['email'] : null
]);
?> 