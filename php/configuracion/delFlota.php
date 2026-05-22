<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

if (!isset($_GET["placa"])) {
    $response["message"] = "Placa no recibida";
    echo json_encode($response);
    exit;
}

$placa = trim($_GET["placa"]);

if ($placa === "") {
    $response["message"] = "Placa inválida";
    echo json_encode($response);
    exit;
}

$sqlCheck = "SELECT placa FROM FLOTA WHERE placa = ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("s", $placa);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    $response["message"] = "La flota no existe";
    echo json_encode($response);
    $stmt->close();
    exit;
}
$stmt->close();

$sqlDelete = "DELETE FROM FLOTA WHERE placa = ?";
$stmt = $conexion->prepare($sqlDelete);

if (!$stmt) {
    $response["message"] = "Error al preparar eliminación";
    echo json_encode($response);
    exit;
}

$stmt->bind_param("s", $placa);

if ($stmt->execute()) {
    $response["success"] = true;
} else {
    $response["message"] = "Error al eliminar flota";
}

$stmt->close();
$conexion->close();

echo json_encode($response);
