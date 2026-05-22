<?php
header("Content-Type: application/json");
include '../conexion.php';

$user = trim($_GET['userR'] ?? '');
$pass = trim($_GET['passR'] ?? '');
$zona = trim($_GET['opcion'] ?? '');

if (empty($user) || empty($pass) || empty($zona)) {
    echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios"]);
    exit;
}

if (strlen($user) < 3) {
    echo json_encode(["status" => "error", "message" => "Usuario muy corto"]);
    exit;
}


$passHash = password_hash($pass, PASSWORD_BCRYPT);

$sqlCheck = "SELECT user FROM usuarios WHERE user = ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("s", $user);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Usuario ya existe"]);
    exit;
}
$stmt->close();

$sqlInsert = "INSERT INTO usuarios (user, cont, zona) VALUES (?, ?, ?)";
$stmt = $conexion->prepare($sqlInsert);
$stmt->bind_param("sss", $user, $passHash, $zona);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "usCod" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Error al registrar"
    ]);
}

$stmt->close();
$conexion->close();
