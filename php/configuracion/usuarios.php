<?php
    include '../conexion.php';

    $filtrar = $_GET['filtrar'];
    $sql = $conexion->prepare("SELECT * FROM usuarios
                               WHERE zona = ?
    ");
    $sql->bind_param("s", $filtrar);
    $sql->execute();
    $result = $sql->get_result();

    $usuarios = [];
    
    while ($fila = $result->fetch_assoc()) {
        $usuarios[] = $fila;
    }
    
    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios
    ]);
    $sql->close();
?>