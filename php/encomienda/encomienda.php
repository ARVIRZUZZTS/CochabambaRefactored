<?php
include "../conexion.php";

$code = trim($_GET["code"]);
$remitente = trim($_GET["rem"]);
$remTelf = trim($_GET["remT"]);
$consignatario = trim($_GET["con"]);
$conTelf = trim($_GET["conT"]);
$bulto = trim($_GET["bul"]);
$fecha = trim($_GET["dia"]);
$zona = trim($_GET["zona"]);
$dest = trim($_GET["dest"]);
$valorDeclarado = (trim($_GET["val"]) === "Si") ? "Si" : "No";
$opcion = $_GET["opc"];

$existe = false;
if (isset($_GET["tot"]) && $_GET["tot"] !== "") {
    $total = (int)$_GET["tot"];
    $existe = true;
} else {
    $primerTr = (int)$_GET["pri"];
    $segundoTr = (int)$_GET["seg"];
    $total = $primerTr + $segundoTr;
    $bulto = $bulto . " MEDIO TRAMO A " . $dest . " " . $segundoTr . ".-";
}

$stmt = $conexion->prepare("SELECT abrev FROM ZONAS WHERE nombreZona = ?");
$stmt->bind_param("s", $dest);
$stmt->execute();
$stmt->bind_result($abrev);
$stmt->fetch();
$stmt->close();

if ($zona === 'Santa Cruz') {
    $queryMax = $conexion->prepare(
        "SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(conEnc, '-', 1) AS UNSIGNED)), 0)
         FROM encomienda
         WHERE destino = ? AND conEnc LIKE ?"
    );
    $likeDest = "%-" . $abrev;
    $queryMax->bind_param("ss", $dest, $likeDest);

} else {
    $queryMax = $conexion->prepare(
        "SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(conEnc, '-', 1) AS UNSIGNED)), 0)
         FROM encomienda"
    );
}

$queryMax->execute();
$queryMax->bind_result($ultimoNumero);
$queryMax->fetch();
$queryMax->close();

$nuevoNumero = $ultimoNumero + 1;
$nuevoCodigo = $nuevoNumero . "-" . $abrev;

if ($existe) {
    $query = $conexion->prepare(
        "INSERT INTO encomienda 
        (conEnc, codeViaje, remitente, remTelf, consignatario, conTelf, total, bulto, valDeclarado, estadoPaga, fecha, origen, destino) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $query->bind_param(
        "sssssssssssss",
        $nuevoCodigo, $code, $remitente, $remTelf, $consignatario, $conTelf,
        $total, $bulto, $valorDeclarado, $opcion, $fecha, $zona, $dest
    );
} else {
    $query = $conexion->prepare(
        "INSERT INTO encomienda 
        (conEnc, codeViaje, remitente, remTelf, consignatario, conTelf, priT, segT, total, bulto, valDeclarado, estadoPaga, fecha, origen, destino) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $query->bind_param(
        "sssssssssssssss",
        $nuevoCodigo, $code, $remitente, $remTelf, $consignatario, $conTelf,
        $primerTr, $segundoTr, $total, $bulto, $valorDeclarado, $opcion, $fecha, $zona, $dest
    );
}


if ($query->execute()) {
    echo json_encode(['success' => "Encomienda registrada con código: " . $nuevoCodigo]);
} else {
    echo json_encode(['error' => "Error en el registro: " . $query->error]);
}

?>
