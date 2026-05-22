<?php
include '../conexion.php';

$fecha = $_GET['fecha'];
$destino = $_GET['destino'];

$sql = "SELECT * FROM viaje WHERE fecha = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $fecha);
$stmt->execute();
$result = $stmt->get_result();

$viajes = [];
while ($row = $result->fetch_assoc()) {
    $viajes[] = $row;
}

echo json_encode($viajes);
?>