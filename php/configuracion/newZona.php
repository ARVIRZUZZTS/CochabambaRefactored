<?php
header("Content-Type: application/json");
include '../conexion.php';

$zona = trim($_GET['zona'] ?? '');
$abrev = trim($_GET['abrev'] ?? '');
$info = trim($_GET['info'] ?? '');
$telefono = trim($_GET['telefono'] ?? '');

if (empty($zona) || empty($abrev) || empty($info) || empty($telefono)) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

$sqlCheck = "SELECT nombreZona FROM zonas WHERE nombreZona = ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("s", $zona);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "La zona ya existe"
    ]);
    exit;
}
$stmt->close();

$sql = "INSERT INTO zonas (nombreZona, abrev, informacion, telefono)
        VALUES (?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssss", $zona, $abrev, $info, $telefono);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al crear zona"
    ]);
}

$stmt->close();
$conexion->close();
