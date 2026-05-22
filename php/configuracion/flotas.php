<?php
    include '../conexion.php';

    $query = "SELECT * FROM flota";
    $stmt = $conexion->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $flotas = [];
    
    while ($fila = $result->fetch_assoc()) {
        $flotas[] = $fila;
    }
    
    echo json_encode([
        "success" => true,
        "flotas" => $flotas
    ]);

    $stmt->close();
?>