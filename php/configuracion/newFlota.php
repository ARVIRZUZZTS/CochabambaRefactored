<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

if (
    !isset($_GET["placa"]) ||
    !isset($_GET["propietario"]) ||
    !isset($_GET["chofer"]) ||
    !isset($_GET["licencia"]) ||
    !isset($_GET["tipo"])
) {
    $response["message"] = "Datos incompletos";
    echo json_encode($response);
    exit;
}

$placa = trim($_GET["placa"]);
$propietario = trim($_GET["propietario"]);
$chofer = trim($_GET["chofer"]);
$licencia = trim($_GET["licencia"]);
$tipo = trim($_GET["tipo"]);

if ($placa === "" || $propietario === "" || $chofer === "" || $licencia === "") {
    $response["message"] = "Todos los campos son obligatorios";
    echo json_encode($response);
    exit;
}

if ($tipo !== "Ok" && $tipo !== "Familiar") {
    $response["message"] = "Tipo inválido";
    echo json_encode($response);
    exit;
}

$sqlCheck = "SELECT placa FROM FLOTA WHERE placa = ?";
$stmt = $conexion->prepare($sqlCheck);
$stmt->bind_param("s", $placa);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $response["message"] = "La placa ya existe";
    echo json_encode($response);
    $stmt->close();
    exit;
}
$stmt->close();

$sqlInsert = "INSERT INTO FLOTA (placa, propietario, chofer, licencia, tipo)
              VALUES (?, ?, ?, ?, ?)";

$stmt = $conexion->prepare($sqlInsert);

if (!$stmt) {
    $response["message"] = "Error en la preparación";
    echo json_encode($response);
    exit;
}

$stmt->bind_param("sssss", $placa, $propietario, $chofer, $licencia, $tipo);

if ($stmt->execute()) {
    $response["success"] = true;
} else {
    $response["message"] = "Error al guardar flota";
}

$stmt->close();
$conexion->close();

echo json_encode($response);
?>