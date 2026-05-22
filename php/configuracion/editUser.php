<?php
header("Content-Type: application/json");
include '../conexion.php';

$id     = intval($_GET['id'] ?? 0);
$user   = trim($_GET['user'] ?? '');


if ($id <= 0 || empty($user)) {
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit;
}

if (strlen($user) < 3) {
    echo json_encode([
        "success" => false,
        "message" => "Usuario muy corto"
    ]);
    exit;
}

$sqlCheck = "SELECT usCod FROM usuarios WHERE user = ? AND usCod != ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("si", $user, $id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "El usuario ya existe"
    ]);
    $stmt->close();
    exit;
}
$stmt->close();

$sqlUpdate = "UPDATE usuarios SET user = ? WHERE usCod = ?";
$stmt = $conexion->prepare($sqlUpdate);
$stmt->bind_param("si", $user, $id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Usuario actualizado"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar"
    ]);
}

$stmt->close();
$conexion->close();
