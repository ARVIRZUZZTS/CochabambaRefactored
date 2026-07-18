<?php
    include '../conexion.php';

    $codigo = $_GET['codigo'] ?? '';

    if ($codigo !== '') {
        $stmt = $conexion->prepare("DELETE FROM contingencia WHERE codigo = ?");
        $stmt->bind_param("s", $codigo);
        $success = $stmt->execute();

        if ($success) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(["success" => false, "error" => "Falta codigo"]);
    }
    $conexion->close();
?>
