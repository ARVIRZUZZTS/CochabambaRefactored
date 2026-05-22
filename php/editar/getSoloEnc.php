<?php
include '../conexion.php';

$conEnc = $_GET['conEnc'];

$sql = "SELECT * FROM encomienda WHERE conEnc = ?";
$stmt = $conexion->prepare($sql);

$stmt->bind_param("s", $conEnc);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode(["error" => "No se encontró la encomienda"]);
}

$stmt->close();
$conexion->close();
?>
