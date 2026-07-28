<?php
include '../conexion.php';

    $viajeCod = $_GET['viajeCod'];

    if ($viajeCod !== '') {
        $sql = "SELECT conEnc, total
                FROM encomiendabodega
                WHERE viajeCod = ?";

        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $viajeCod);

        $stmt->execute();
        $result = $stmt->get_result();
        $encomiendas = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode($encomiendas);

        $stmt->close();
    } else {
        echo json_encode(["error" => "Falta viajeCod"]);
    }
    $conexion->close();
?>