<?php
include '../conexion.php';

$code = $_GET['code'];
$fecha = $_GET['fecha'];
$depto = $_GET['depto'];

$sql = "SELECT viajeCod FROM viaje WHERE viajeCod = ? AND fecha = ? AND origen = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("sss", $code, $fecha, $depto);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

echo json_encode($row ? $row : ["viajeCod" => null]);
?>
