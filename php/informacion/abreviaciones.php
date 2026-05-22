<?php
    include '../conexion.php';

    $origen = $_GET['origen'];
    $destino = $_GET['destino'];

    $queryOrg = "SELECT abrev FROM zonas WHERE nombreZona = ?";
    $stmtOrg = $conexion->prepare($queryOrg);
    $stmtOrg->bind_param("s", $origen);
    $stmtOrg->execute();
    $resultOrg = $stmtOrg->get_result();

    $queryDes = "SELECT abrev FROM zonas WHERE nombreZona = ?";
    $stmtDes = $conexion->prepare($queryDes);
    $stmtDes->bind_param("s", $destino);
    $stmtDes->execute();
    $resultDes = $stmtDes->get_result();

    if ($resultOrg->num_rows > 0 && $resultDes->num_rows > 0) {
        echo json_encode([
            "success" => true,
            "abrevOrigen" => $resultOrg->fetch_assoc()['abrev'],
            "abrevDestino" => $resultDes->fetch_assoc()['abrev']
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => "Viaje no encontrado"
        ]);
    }
?>