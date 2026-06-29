<?php 
    include '../conexion.php';
    include '../supabase.php';

    $sb = new SupabaseClient();

    $code = $_GET['viaje'] ?? '';

    $sqlV = "SELECT viajeCod, placa, fecha, destino
            FROM viaje WHERE viajeCod = ?";
    $stmtV = $conexion->prepare($sqlV);
    $stmtV->bind_param("s", $code);
    $stmtV->execute();
    $resultV = $stmtV->get_result();
    
    
    while ($rowV = $resultV->fetch_assoc()) {
        $estado = ($rowV['destino'] == 'Cochabamba') ? 's' : 'c';
        $sb->insert('viajebodega', [
            'viajeCod' => $rowV['viajeCod'],
            'placa' => $rowV['placa'],
            'fecha' => $rowV['fecha'],
            'estado' => $estado
        ]);
    }

    $sqlE = "SELECT conEnc, codeViaje, remitente, remTelf, consignatario, conTelf, estadoPaga, priT, segT, total
            FROM encomienda WHERE codeViaje = ?";
    $stmtE = $conexion->prepare($sqlE);
    $stmtE->bind_param("s", $code);
    $stmtE->execute();
    $resultE = $stmtE->get_result();

    while ($rowE = $resultE->fetch_assoc()) {
        $total = 0;
        if ($rowE['estadoPaga'] == 1 || $rowE['estadoPaga'] == 2) {
            $total = $rowE['total'];
        } else if ($rowE['estadoPaga'] == 3) {
            $total = $rowE['segT'];
        } else if ($rowE['estadoPaga'] == 4){
            $total = $rowE['priT'];
        } else {
            $total = $rowE['total'];
        }
        $cons = (strlen($rowE['consignatario']) < 5) ? $rowE['remitente'] : $rowE['consignatario'];
        $telf = ($rowE['conTelf'] != 0) ?  $rowE['conTelf'] : $rowE['remTelf'];
        $sb->insert('encomiendabodega', [
            'conEnc'        => $rowE['conEnc'],
            'viajeCod'      => $rowE['codeViaje'],
            'consignatario' => $cons,
            'conTelf'       => $telf,
            'total'         => $total,
            'estadoPaga'    => $rowE['estadoPaga']
        ]);
    }
    echo json_encode(["status" => "success", "message" => "Sincronización completada"]);    
?>