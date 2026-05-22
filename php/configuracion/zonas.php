<?php
    include '../conexion.php';

    $query = "SELECT * FROM zonas";
    $stmt = $conexion->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $zonas = [];
    
    while ($fila = $result->fetch_assoc()) {
        $zonas[] = $fila;
    }
    
    echo json_encode([
        "success" => true,
        "zonas" => $zonas
    ]);

    $stmt->close();
?>