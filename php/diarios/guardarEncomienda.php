<?php
include '../conexion.php';

$conEnc = $_GET['conEnc'];
$viajeCod = $_GET['viajeCod'];

if (!empty($conEnc) && !empty($viajeCod)) {
    $sql = "UPDATE encomienda SET codeViaje = ? WHERE conEnc = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ss", $viajeCod, $conEnc);

    $success = $stmt->execute();
} else {
    $success = false;
}

echo json_encode(["success" => $success]);
?>
