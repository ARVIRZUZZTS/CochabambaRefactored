<?php
include '../conexion.php';

$query = "SELECT placa, propietario, chofer FROM flota";
$result = $conexion->query($query);

$flotas = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $flotas[] = [
            "placa"      => $row['placa'],
            "propietario"=> $row['propietario'],
            "chofer"     => $row['chofer'],
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($flotas);
?>
