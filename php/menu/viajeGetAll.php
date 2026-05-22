<?php
    include '../conexion.php';
    if (isset($_POST['fecha']) && isset($_POST['depto'])) {

        $fecha = $_POST['fecha'];
        $depto = $_POST["depto"];
        $sql = "SELECT * FROM viaje WHERE fecha = ? AND origen = ? ORDER BY destino";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ss", $fecha, $depto);
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
