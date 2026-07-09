<?php 
    include '../conexion.php';
    include '../supabase.php';

    set_time_limit(300);

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

    $sqlE = "SELECT conEnc, codeViaje, remitente, remTelf, consignatario, conTelf, bulto, estadoPaga, priT, segT, total
            FROM encomienda WHERE codeViaje = ?";
    $stmtE = $conexion->prepare($sqlE);
    $stmtE->bind_param("s", $code);
    $stmtE->execute();
    $resultE = $stmtE->get_result();

    $datosParaSubir = [];
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
        $telf = (strlen($rowE['conTelf']) > 7) ?  $rowE['conTelf'] : $rowE['remTelf'];

        $datosParaSubir[] = [
            'conEnc'        => $rowE['conEnc'],
            'viajeCod'      => $rowE['codeViaje'],
            'consignatario' => $cons,
            'conTelf'       => $telf,
            'total'         => $total,
            'bulto'         => $rowE['bulto'],
            'estadoPaga'    => $rowE['estadoPaga']
        ];

        if(!empty($datosParaSubir)) {
            $sb->insert('encomiendabodega', $datosParaSubir);
        }
    }
    echo json_encode(["status" => "success", "message" => "Sincronización completada"]);    
?>