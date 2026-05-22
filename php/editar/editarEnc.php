<?php
include '../conexion.php';

$conEnc = $_GET['conEnc'] ?? '';

if ($conEnc === '') {
    echo json_encode(["success" => false, "error" => "Código de encomienda vacío"]);
    exit;
}

$map = [
    "rem"           => "remitente",
    "remT"          => "remTelf",
    "con"           => "consignatario",
    "conT"          => "conTelf",
    "bul"           => "bulto",
    "valDeclarado"  => "valDeclarado",
    "estadoPaga"    => "estadoPaga"
];

$updates = [];
$params  = [];
$types   = "";

foreach ($map as $key => $column) {
    if (isset($_GET[$key]) && $_GET[$key] !== "") {
        $updates[] = "$column = ?";
        $params[]  = trim($_GET[$key]);
        $types    .= "s";
    }
}

if (isset($_GET["tot"]) && $_GET["tot"] !== "") {

    $updates[] = "total = ?";
    $params[]  = $_GET["tot"];
    $types    .= "s";

} else if (isset($_GET["pri"], $_GET["seg"])) {

    $pri = (int)$_GET["pri"];
    $seg = (int)$_GET["seg"];
    $total = $pri + $seg;

    $updates[] = "priT = ?";
    $updates[] = "segT = ?";
    $updates[] = "total = ?";

    $params[] = $pri;
    $params[] = $seg;
    $params[] = $total;

    $types .= "sss";
}

if (empty($updates)) {
    echo json_encode(["success" => false, "error" => "Nada para actualizar"]);
    exit;
}

$sql = "UPDATE encomienda SET " . implode(", ", $updates) . " WHERE conEnc = ?";
$params[] = $conEnc;
$types   .= "s";

$stmt = $conexion->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "rows"    => $stmt->affected_rows
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error"   => $stmt->error
    ]);
}

$stmt->close();
$conexion->close();
