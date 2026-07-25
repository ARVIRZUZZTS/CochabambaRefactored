<?php
include '../conexion.php';

    $viajeCod = $_GET['viajeCod'];

    if ($viajeCod !== '') {
        $sql = "SELECT e.conEnc, z.abrev, e.segT
                FROM encomiendas e
                INNER JOIN zonas z ON z.nombreZona = e.destino
                WHERE codeViaje = ?";

        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $viajeCod);

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
