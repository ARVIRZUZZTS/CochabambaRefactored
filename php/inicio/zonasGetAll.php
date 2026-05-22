<?php
header("Content-Type: application/json");
include '../conexion.php';

$sql = "SELECT nombreZona, abrev FROM ZONAS ORDER BY nombreZona ASC";
$result = $conexion->query($sql);

$zonas = [];
while ($row = $result->fetch_assoc()) {
    $zonas[] = $row;
}

echo json_encode($zonas);
$conexion->close();
?>
