<?php
header('Content-Type: application/json');

include '../conexion.php';

$code      = $_GET['code'];
$prop      = $_GET['prop'];
$chofer    = $_GET['chofer'];
$ayudante  = $_GET['ayudante'];
$placa     = $_GET['placa'];
$destino   = $_GET['destino'];
$hora      = $_GET['hora'];

$stmt = $conexion->prepare("
    UPDATE viaje 
    SET propietario = ?, chofer = ?, ayudante = ?, placa = ?, destino = ?, hora = ?
    WHERE viajeCod = ?
");

if ($stmt) {
    $stmt->bind_param("sssssss", $prop, $chofer, $ayudante, $placa, $destino, $hora, $code);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Viaje actualizado correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al ejecutar la consulta']);
    }

    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta']);
}

if (isset($conexion)) {
    $conexion->close();
}
