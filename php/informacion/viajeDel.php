<?php
include '../conexion.php';

    $viajeCod = $_GET['viajeCod'];

    if ($viajeCod !== '') {
        $nuevaFecha = "23-12-2002";

        $sql = "UPDATE viaje 
                SET fecha = ?
                WHERE viajeCod = ?";

        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ss", $nuevaFecha, $viajeCod);

        $success = $stmt->execute();

        if ($success) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "error" => "Falta viajeCod"]);
    }
    $conexion->close();
?>
