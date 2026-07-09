<?php
include '../conexion.php';
include '../supabase.php';

$sb = new SupabaseClient();
$zona = $_POST['zona'] ?? '';
$dia = $_POST['dia'] ?? '';
$filtro = ($zona == 'Santa Cruz') ? 'c' : 's';

$urlViajes = SUPABASE_URL . "/viajebodega?estado=eq." . $filtro . "&fecha=eq." . $dia;
$viajes = $sb->get($urlViajes);

if (is_array($viajes)) {
    foreach ($viajes as $v) {
        $stmtV = $conexion->prepare("INSERT IGNORE INTO viajebodega (viajeCod, placa, fecha) VALUES (?, ?, ?)");
        $stmtV->bind_param("sss", $v['viajeCod'], $v['placa'], $v['fecha']);
        $stmtV->execute();
    
        $urlEnc = SUPABASE_URL . "/encomiendabodega?viajeCod=eq." . urlencode($v['viajeCod']);
        $encomiendas = $sb->get($urlEnc);
        error_log("Encomiendas para " . $v['viajeCod'] . ": " . json_encode($encomiendas));

        foreach ($encomiendas as $e) {
            $stmtE = $conexion->prepare("INSERT IGNORE INTO encomiendabodega (conEnc, viajeCod, consignatario, conTelf, bulto, estadoPaga, total) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmtE->bind_param("ssssssi", $e['conEnc'], $e['viajeCod'], $e['consignatario'], $e['conTelf'], $e['bulto'], $e['estadoPaga'], $e['total']);
            $stmtE->execute();
        }

        $nuevoEstado = ($filtro == 'c') ? 'x' : 'y';

        $sb->update('viajebodega', ['estado' => $nuevoEstado], 'viajeCod=eq.' . urlencode($v['viajeCod']));
    }
}

$stmt = $conexion->prepare("SELECT * FROM viajebodega WHERE fecha = ?");
$stmt->bind_param("s", $dia);
$stmt->execute();
$resLocal = $stmt->get_result();
echo json_encode(["status" => "success", "data" => $resLocal->fetch_all(MYSQLI_ASSOC)]);
?>
