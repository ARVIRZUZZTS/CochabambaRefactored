<?php
    include "../conexion.php";
        
    $prop = trim($_GET["prop"]);
    $chof = trim($_GET["chof"]);
    $ayud = trim($_GET["ayud"]) ?? " - ";
    $plac = trim($_GET["plac"]);
    $dest = trim($_GET["dpto"]);
    $hora = trim($_GET["hora"]);
    $fech = trim($_GET['dia']);
    $orgn = trim($_GET['org']);

    $stmt = $conexion->prepare("SELECT abrev FROM ZONAS WHERE nombreZona = ?");
    $stmt->bind_param("s", $dest);
    $stmt->execute();
    $stmt->bind_result($abrev);
    $stmt->fetch();
    $stmt->close();

    $prefijo = substr($abrev, 0, 2) . "V-";
    
    $queryMax = $conexion->prepare("SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(SUBSTRING(viajeCod, 5), '#', 1) AS UNSIGNED)), 0) 
                                    FROM viaje 
                                    WHERE viajeCod LIKE ?");
    $prefijoLike = $prefijo."%";
    $queryMax->bind_param("s", $prefijoLike);
    $queryMax->execute();
    $queryMax->bind_result($ultimoNumero);
    $queryMax->fetch();
    $queryMax->close();
    
    $nuevoCodigo = $prefijo . ($ultimoNumero + 1). "#" . $plac;

    $query = $conexion->prepare("INSERT INTO viaje 
    (viajeCod, propietario, chofer, ayudante, placa, origen, destino, fecha, hora) 
                                 VALUES (?,?,?,?,?,?,?,?,?)");
    $query->bind_param("sssssssss", $nuevoCodigo,$prop,$chof,$ayud,$plac,$orgn,$dest,$fech,$hora);
    
    if ($query->execute()) {
        
        echo json_encode([
            'viajeCod' => $nuevoCodigo,
            'propietario' => $prop,
            'chofer' => $chof,
            'ayudante' => $ayud,
            'placa' => $plac,
            'origen' => $orgn,
            'destino' => $dest,
            'fecha' => $fech,
            'hora' => $hora
        ]);
    } else {
        echo json_encode(['error' => "Error en el registro: " . $query->error]);
    }
?>