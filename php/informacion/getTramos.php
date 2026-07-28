<?php
include '../conexion.php';

    $viajeCod = $_GET['viajeCod'];

    if ($viajeCod !== '') {
        $sql = "SELECT e.conEnc, z.abrev, e.segT
                FROM encomienda e
                INNER JOIN zonas z ON z.nombreZona = e.destino
                WHERE codeViaje = ?
                  AND e.destino <> 'Cochabamba'
                  AND e.destino <> 'Santa Cruz'";

        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $viajeCod);

        $stmt->execute();
        $result = $stmt->get_result();
        $tramos = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode($tramos);

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "error" => "Falta viajeCod"]);
    }
    $conexion->close();
?>
