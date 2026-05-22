<?php
    include '../conexion.php';

    $codigo = $_GET['viajeCod'];
    
    $sql = "UPDATE viaje SET estadoImp = '1' WHERE viajeCod = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $codigo);
    
    if ($stmt->execute()) {
        echo "OK";
    } else {
        echo "Error al actualizar";
    }
    $stmt->close();
    $conexion->close();
?>
