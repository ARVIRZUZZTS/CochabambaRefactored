<?php
include '../conexion.php';

if (!isset($_GET["conEnc"])) {
    echo json_encode(["success" => false, "error" => "Falta conEnc"]);
    exit;
}

$conEnc = $_GET["conEnc"];

$nuevoCodeViaje = "-";
$nuevaFecha = "23-12-2002";
$nuevoEstadoPaga = "P";
$nuevoTotal = 0;

$sql = "UPDATE encomienda 
        SET codeViaje = ?, 
            fecha = ?, 
            estadoPaga = ?, 
            total = ? 
        WHERE conEnc = ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("sssis", $nuevoCodeViaje, $nuevaFecha, $nuevoEstadoPaga, $nuevoTotal, $conEnc);

$success = $stmt->execute();

if ($success) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
