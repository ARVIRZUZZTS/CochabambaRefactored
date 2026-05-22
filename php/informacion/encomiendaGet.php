<?php
include '../conexion.php';

    $conEnc = $_GET["conEnc"];

    $sqlSelect = "SELECT *
                  FROM encomienda 
                  WHERE conEnc = ?";

    $stmtSelect = $conexion->prepare($sqlSelect);
    $stmtSelect->bind_param("s", $conEnc);
    $stmtSelect->execute();
    $result = $stmtSelect->get_result();
    $encomienda = $result->fetch_assoc();
    $stmtSelect->close();
    if ($encomienda) {
        echo json_encode(["success" => true, "encomienda" => $encomienda]);
    } else {
        echo json_encode(["success" => false, "error" => "No se pudo actualizar o recuperar la encomienda"]);
    }
    
    $conexion->close();
?>
