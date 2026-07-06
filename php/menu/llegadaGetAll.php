<?php
    include '../conexion.php';
    if (isset($_POST['fecha'])) {

        $fecha = $_POST['fecha'];
        $sql = "SELECT * FROM viajebodega WHERE fecha = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $fecha);
        $stmt->execute();
        $result = $stmt->get_result();

        $llegadas = [];
        while ($row = $result->fetch_assoc()) {
            $llegadas[] = $row;
        }

        echo json_encode($llegadas);
        $stmt->close();
    }
?>
