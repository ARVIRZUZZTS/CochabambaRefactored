<?php
header("Content-Type: application/json");
include '../conexion.php';

$zona = trim($_GET['zona'] ?? '');

if (empty($zona)) {
    echo json_encode([
        "success" => false,
        "message" => "Zona no válida"
    ]);
    exit;
}

$sql = "DELETE FROM zonas WHERE nombreZona = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $zona);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "No se pudo eliminar la zona"
    ]);
}

$stmt->close();
$conexion->close();
