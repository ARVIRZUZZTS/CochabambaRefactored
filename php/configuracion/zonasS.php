<?php
    header("Content-Type: application/json");
    include '../conexion.php';

    $filtrar = $_GET['filtrar'];

    $sql = $conexion->prepare("SELECT nombreZona, abrev 
                                FROM ZONAS 
                                WHERE nombreZona = ?");
    $sql->bind_param("s",$filtrar);
    $sql->execute();
    $result = $sql->get_result();

    $zonas = [];
    while ($row = $result->fetch_assoc()) {
        $zonas[] = $row;
    }

    echo json_encode($zonas);
    $sql->close();
    $conexion->close();
?>