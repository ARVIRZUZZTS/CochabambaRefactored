<?php
header("Content-Type: application/json");
include '../conexion.php';

$zona = trim($_GET['zona'] ?? '');
$info = trim($_GET['info'] ?? '');
$telefono = trim($_GET['telefono'] ?? '');

if (empty($zona) || empty($info) || empty($telefono)) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

$sql = "UPDATE zonas SET informacion = ?, telefono = ? WHERE nombreZona = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("sss", $info, $telefono, $zona);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar zona"
    ]);
}

$stmt->close();
$conexion->close();
