<?php
    include '../conexion.php';

    $desde = $_POST['desde'] ?? $_GET['desde'] ?? '';
    $hasta = $_POST['hasta'] ?? $_GET['hasta'] ?? '';

    if ($desde === '' || $hasta === '') {
        echo json_encode(["error" => "Faltan las fechas del rango"]);
        exit;
    }

    $d1 = DateTime::createFromFormat('d-m-Y', $desde);
    $d2 = DateTime::createFromFormat('d-m-Y', $hasta);
    if (!$d1 || !$d2) {
        echo json_encode(["error" => "Formato de fecha inválido"]);
        exit;
    }
    if ($d1 > $d2) {
        $tmp = $desde;
        $desde = $hasta;
        $hasta = $tmp;
    }

    $sql = "
        SELECT v.viajeCod, v.fecha, v.propietario, v.placa, COALESCE(f.tipo, 'Ok') AS tipo
        FROM viaje v
        LEFT JOIN flota f ON v.placa = f.placa
        WHERE STR_TO_DATE(v.fecha, '%d-%m-%Y') BETWEEN STR_TO_DATE(?, '%d-%m-%Y') AND STR_TO_DATE(?, '%d-%m-%Y')
        ORDER BY STR_TO_DATE(v.fecha, '%d-%m-%Y'), v.viajeCod
    ";
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        echo json_encode(["error" => "Error en la preparación de la consulta"]);
        exit;
    }
    $stmt->bind_param("ss", $desde, $hasta);
    $stmt->execute();
    $result = $stmt->get_result();

    $stmtSum = $conexion->prepare("SELECT COALESCE(SUM(total), 0) AS monto FROM encomienda WHERE codeViaje = ?");

    $viajes = [];
    while ($row = $result->fetch_assoc()) {
        $stmtSum->bind_param("s", $row['viajeCod']);
        $stmtSum->execute();
        $sumRes = $stmtSum->get_result()->fetch_assoc();
        $montoBruto = (float)$sumRes['monto'];

        $esOk = ($row['tipo'] === 'Ok');
        $rateTotal = $esOk ? 0.16 : 0.15;
        $rateSC = $esOk ? 0.07 : 0.06;
        $rateCBBA = 0.09;

        $viajes[] = [
            "fecha" => $row['fecha'],
            "propietario" => $row['propietario'],
            "placa" => $row['placa'],
            "tipo" => $row['tipo'],
            "montoBruto" => round($montoBruto, 2),
            "totalPct" => (int)ceil($montoBruto * $rateTotal),
            "cbbaPct" => (int)round($montoBruto * $rateCBBA),
            "scPct" => (int)ceil($montoBruto * $rateSC)
        ];
    }

    echo json_encode($viajes);
    $stmtSum->close();
    $stmt->close();
?>
