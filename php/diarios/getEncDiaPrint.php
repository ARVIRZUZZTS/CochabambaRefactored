<?php

include '../conexion.php';

$conEnc = $_GET['conEnc'];

$query = "SELECT * FROM encomienda WHERE conEnc = ?";
$stmt = $conexion->prepare($query);
$stmt->bind_param("s", $conEnc);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    echo json_encode(["success" => false, "message" => "Encomienda no encontrada"]);
    exit;
}

$encomienda = $result->fetch_assoc();
$response = ["success" => true, "encomienda" => $encomienda];

if ($encomienda["codeViaje"] !== "-") {
    $queryViaje = "SELECT * FROM viaje WHERE viajeCod = ?";
    $stmtViaje = $conexion->prepare($queryViaje);
    $stmtViaje->bind_param("s", $encomienda["codeViaje"]);
    $stmtViaje->execute();
    $resultViaje = $stmtViaje->get_result();

    if ($resultViaje->num_rows > 0) {
        $response["viaje"] = $resultViaje->fetch_assoc();
    }
}

echo json_encode($response);
?>
