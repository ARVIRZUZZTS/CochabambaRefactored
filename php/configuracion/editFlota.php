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
    $response["message"] = "Campos vacíos";
    echo json_encode($response);
    exit;
}

if ($tipo !== "Ok" && $tipo !== "Familiar") {
    $response["message"] = "Tipo inválido";
    echo json_encode($response);
    exit;
}

$sql = "UPDATE FLOTA 
        SET propietario = ?, chofer = ?, licencia = ?, tipo = ?
        WHERE placa = ?";

$stmt = $conexion->prepare($sql);

if (!$stmt) {
    $response["message"] = "Error en la preparación";
    echo json_encode($response);
    exit;
}

$stmt->bind_param("sssss", $propietario, $chofer, $licencia, $tipo, $placa);

if ($stmt->execute()) {
    $response["success"] = true;
} else {
    $response["message"] = "Error al actualizar flota";
}

$stmt->close();
$conexion->close();

echo json_encode($response);
?>