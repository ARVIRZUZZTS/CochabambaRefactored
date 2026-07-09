<?php
    include '../conexion.php';

    $code = $_GET['viaje'] ?? '';

    $sql = "SELECT * FROM encomiendabodega WHERE viajeCod = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();
    $llegadas = [];
    
    while ($row = $result->fetch_assoc()) {
        $llegadas[] = $row;
    }

    echo json_encode($llegadas);
    $stmt->close();
?>