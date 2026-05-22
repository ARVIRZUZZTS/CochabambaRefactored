<?php
include '../conexion.php';

$fecha = $_GET['fecha'];
$depto = $_GET['depto'];

$sql = "
    SELECT *
    FROM encomienda
    WHERE fecha = ? AND origen = ?
    ORDER BY 
        CAST(SUBSTRING_INDEX(conEnc, '-', 1) AS UNSIGNED) ASC
";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode(["error" => "Error en la preparación de la consulta"]);
    exit;
}

$stmt->bind_param("ss", $fecha, $depto);
$stmt->execute();
$result = $stmt->get_result();

$viajes = [];
while ($row = $result->fetch_assoc()) {
    $viajes[] = $row;
}

echo json_encode($viajes);
$stmt->close();
$conexion->close();
?>
