<?php
    include '../conexion.php';
    if (isset($_POST['fecha'])) {

        $fecha = $_POST['fecha'];
        $sql = "SELECT viajeCod, placa, destino FROM viaje WHERE fecha = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $fecha);
        $stmt->execute();
        $result = $stmt->get_result();

        $viajes = [];
        while ($row = $result->fetch_assoc()) {
            $viajes[] = $row;
        }

        echo json_encode($viajes);
        $stmt->close();
    }
?>