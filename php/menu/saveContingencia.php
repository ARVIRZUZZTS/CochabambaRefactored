<?php
    include '../conexion.php';

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['viajeCod']) && isset($_POST['destino'])) {
        $viajeCodStr = $_POST['viajeCod'];
        $viajeCodes = explode(",", $viajeCodStr);
        $destino = $_POST['destino'];
        $fecha = $_POST['fecha'];
        $placa = $_POST['placa'] ?? '';
        $propietario = $_POST['propietario'] ?? '';
        $chofer = $_POST['chofer'] ?? '';

        $result = $conexion->query("SELECT MAX(CAST(codigo AS UNSIGNED)) AS maxCod FROM contingencia");
        $row = $result->fetch_assoc();
        $newCodigo = ($row['maxCod'] ?? 0) + 1;

        $stmt = $conexion->prepare("INSERT INTO contingencia (codigo, viajeCod, destino, fecha, placa, propietario, chofer) VALUES (?, ?, ?, ?, ?, ?, ?)");

        foreach ($viajeCodes as $viajeCod) {
            $viajeCod = trim($viajeCod);
            if ($viajeCod === "") continue;
            $stmt->bind_param("sssssss", $newCodigo, $viajeCod, $destino, $fecha, $placa, $propietario, $chofer);
            $stmt->execute();
        }

        echo json_encode(["success" => true, "codigo" => $newCodigo]);
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "error" => "Datos incompletos"]);
    }
?>
