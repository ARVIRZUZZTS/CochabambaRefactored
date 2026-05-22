<?php
include '../conexion.php';

$abrev = isset($_GET['abrev']) ? $_GET['abrev'] : '';

$sql = "SELECT nombreZona, abrev, informacion, telefono
        FROM ZONAS
        WHERE abrev = ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $abrev);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

echo json_encode($row ? $row : ["success" => false]);
?>
