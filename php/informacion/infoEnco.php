<?php
    include '../conexion.php';

    $code = $_GET['viaje'] ?? '';

    $sql = "SELECT * FROM encomienda WHERE codeViaje = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();
    $encomiendas = [];
    
    while ($row = $result->fetch_assoc()) {
        $encomiendas[] = $row;
    }

    echo json_encode($encomiendas);
    $stmt->close();
?>
