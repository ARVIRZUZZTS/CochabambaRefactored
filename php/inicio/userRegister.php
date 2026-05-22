<?php
header("Content-Type: application/json");
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$user = trim($data['userR'] ?? '');
$pass = trim($data['passR'] ?? '');
$zona = trim($data['opcion'] ?? '');

if (empty($user) || empty($pass) || empty($zona)) {
    echo json_encode(["status" => "error", "message" => "Todos los campos son obligatorios"]);
    exit;
}

if (strlen($user) < 3) {
    echo json_encode(["status" => "error", "message" => "El nombre de usuario es muy corto"]);
    exit;
}

if (strlen($pass) < 6) {
    echo json_encode(["status" => "error", "message" => "La contraseña debe tener mínimo 6 caracteres"]);
    exit;
}

$passHash = password_hash($pass, PASSWORD_BCRYPT);

$sqlCheck = "SELECT user FROM usuarios WHERE user = ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("s", $user);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "El usuario ya existe."]);
    $stmt->close();
    $conexion->close();
    exit;
}
$stmt->close();

$sqlZona = "SELECT nombreZona FROM ZONAS WHERE nombreZona = ?";
$stmtZona = $conexion->prepare($sqlZona);
$stmtZona->bind_param("s", $zona);
$stmtZona->execute();
$stmtZona->store_result();

if ($stmtZona->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Zona no válida"]);
    $stmtZona->close();
    $conexion->close();
    exit;
}
$stmtZona->close();

$sqlInsert = "INSERT INTO usuarios (user, cont, zona) VALUES (?, ?, ?)";
$stmtInsert = $conexion->prepare($sqlInsert);
$stmtInsert->bind_param("sss", $user, $passHash, $zona);

if ($stmtInsert->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Registro exitoso",
        "usCod" => $stmtInsert->insert_id
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Error al registrar el usuario: " . $stmtInsert->error
    ]);
}

$stmtInsert->close();
$conexion->close();
?>
