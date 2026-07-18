<?php
    include '../conexion.php';

    if (isset($_POST['codigo'])) {
        $codigo = $_POST['codigo'];

        $stmt = $conexion->prepare("SELECT destino, fecha FROM contingencia WHERE codigo = ? LIMIT 1");
        $stmt->bind_param("s", $codigo);
        $stmt->execute();
        $contRes = $stmt->get_result();
        $contData = $contRes->fetch_assoc();

        if (!$contData) {
            echo json_encode(["success" => false, "error" => "Contingencia no encontrada"]);
            exit;
        }

        $stmtV = $conexion->prepare("SELECT viajeCod FROM contingencia WHERE codigo = ?");
        $stmtV->bind_param("s", $codigo);
        $stmtV->execute();
        $viajesRes = $stmtV->get_result();

        $viajeCodes = [];
        while ($row = $viajesRes->fetch_assoc()) {
            $viajeCodes[] = $row['viajeCod'];
        }

        if (empty($viajeCodes)) {
            echo json_encode(["success" => true, "codigo" => $codigo, "destino" => $contData['destino'], "fecha" => $contData['fecha'], "encomiendas" => []]);
            exit;
        }

        $placeholders = implode(',', array_fill(0, count($viajeCodes), '?'));
        $types = str_repeat('s', count($viajeCodes));
        $sql = "SELECT * FROM encomienda WHERE codeViaje IN ($placeholders) ORDER BY conEnc ASC";
        $stmtE = $conexion->prepare($sql);
        $stmtE->bind_param($types, ...$viajeCodes);
        $stmtE->execute();
        $encoRes = $stmtE->get_result();

        $encomiendas = [];
        while ($row = $encoRes->fetch_assoc()) {
            $encomiendas[] = $row;
        }

        echo json_encode([
            "success" => true,
            "codigo" => $codigo,
            "destino" => $contData['destino'],
            "fecha" => $contData['fecha'],
            "encomiendas" => $encomiendas
        ]);

        $stmtE->close();
        $stmtV->close();
        $stmt->close();
    }
?>
