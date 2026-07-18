<?php
    include '../conexion.php';

    if (isset($_POST['fecha'])) {
        $fecha = $_POST['fecha'];
        $sql = "SELECT DISTINCT codigo, destino, fecha, placa FROM contingencia WHERE fecha = ? ORDER BY codigo DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $fecha);
        $stmt->execute();
        $result = $stmt->get_result();

        $contingencias = [];
        while ($row = $result->fetch_assoc()) {
            $contingencias[] = $row;
        }

        echo json_encode($contingencias);
        $stmt->close();
    }
?>
