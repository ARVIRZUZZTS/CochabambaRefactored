<?php
include "../conexion.php";

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $query = $conexion->prepare("SELECT COUNT(*) AS total FROM usuarios");
    $query->execute();
    $result = $query->get_result();
    $row = $result->fetch_assoc();

    $totalUsuarios = (int)$row["total"];

    if ($totalUsuarios > 0) {
        echo json_encode([
            "status" => "ok",
            "usuarios" => $totalUsuarios,
            "message" => "Ya hay usuarios registrados."
        ]);
    } else {
        echo json_encode([
            "status" => "empty",
            "usuarios" => 0,
            "message" => "No hay usuarios registrados."
        ]);
    }

    $query->close();
    $conexion->close();
}
?>
