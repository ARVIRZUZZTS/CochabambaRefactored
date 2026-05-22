<?php
header("Content-Type: application/json");
include '../conexion.php';

$id = intval($_GET['id'] ?? 0);

if ($id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "ID inválido"
    ]);
    exit;
}

$sqlCheck = "SELECT usCod FROM usuarios WHERE usCod = ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Usuario no existe"
    ]);
    $stmt->close();
    exit;
}
$stmt->close();

$sqlDelete = "DELETE FROM usuarios WHERE usCod = ?";
$stmt = $conexion->prepare($sqlDelete);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Usuario eliminado"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al eliminar"
    ]);
}

$stmt->close();
$conexion->close();
