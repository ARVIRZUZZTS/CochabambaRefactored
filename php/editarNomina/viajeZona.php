<?php
    include '../conexion.php';

    $viaje = $_GET['viaje'];

    $query = "SELECT * 
            FROM viaje v
            INNER JOIN zonas z ON z.nombreZona = v.destino
            WHERE viajeCod = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("s", $viaje);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode([
            "success" => true,
            "viaje" => $result->fetch_assoc()
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Viaje no encontrado"
        ]);
    }
    $stmt->close();
?>