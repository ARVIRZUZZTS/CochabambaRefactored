<?php
header("Content-Type: application/json");
include '../conexion.php';

$entity = $_GET['entity'] ?? '';
$action = $_GET['action'] ?? '';

function jsonExit($data) {
    echo json_encode($data);
    exit;
}

if (!$entity || !$action) {
    jsonExit(["success" => false, "message" => "entity and action required"]);
}

switch ("$entity/$action") {
    // ─── FLOTAS ─────────────────────────────────────────────
    case "flotas/list":
        $query = "SELECT * FROM flota";
        $stmt = $conexion->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        while ($fila = $result->fetch_assoc()) {
            $data[] = $fila;
        }
        $stmt->close();
        jsonExit(["success" => true, "flotas" => $data]);

    case "flotas/new":
        $placa = trim($_GET['placa'] ?? '');
        $propietario = trim($_GET['propietario'] ?? '');
        $chofer = trim($_GET['chofer'] ?? '');
        $licencia = trim($_GET['licencia'] ?? '');
        if (!$placa || !$propietario || !$chofer || !$licencia) {
            jsonExit(["success" => false, "message" => "Todos los campos son obligatorios"]);
        }
        $sqlCheck = "SELECT placa FROM FLOTA WHERE placa = ?";
        $stmt = $conexion->prepare($sqlCheck);
        $stmt->bind_param("s", $placa);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            jsonExit(["success" => false, "message" => "La placa ya existe"]);
        }
        $stmt->close();
        $sqlInsert = "INSERT INTO FLOTA (placa, propietario, chofer, licencia) VALUES (?, ?, ?, ?)";
        $stmt = $conexion->prepare($sqlInsert);
        $stmt->bind_param("ssss", $placa, $propietario, $chofer, $licencia);
        $success = $stmt->execute();
        $stmt->close();
        jsonExit($success
            ? ["success" => true]
            : ["success" => false, "message" => "Error al guardar flota"]);

    case "flotas/edit":
        $placa = trim($_GET['placa'] ?? '');
        $propietario = trim($_GET['propietario'] ?? '');
        $chofer = trim($_GET['chofer'] ?? '');
        $licencia = trim($_GET['licencia'] ?? '');
        if (!$placa || !$propietario || !$chofer || !$licencia) {
            jsonExit(["success" => false, "message" => "Campos vacíos"]);
        }
        $sql = "UPDATE FLOTA SET propietario = ?, chofer = ?, licencia = ? WHERE placa = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ssss", $propietario, $chofer, $licencia, $placa);
        $success = $stmt->execute();
        $stmt->close();
        jsonExit($success
            ? ["success" => true]
            : ["success" => false, "message" => "Error al actualizar flota"]);

    case "flotas/del":
        $placa = trim($_GET['placa'] ?? '');
        if (!$placa) {
            jsonExit(["success" => false, "message" => "Placa no recibida"]);
        }
        $sqlCheck = "SELECT placa FROM FLOTA WHERE placa = ?";
        $stmt = $conexion->prepare($sqlCheck);
        $stmt->bind_param("s", $placa);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows === 0) {
            jsonExit(["success" => false, "message" => "La flota no existe"]);
        }
        $stmt->close();
        $sqlDelete = "DELETE FROM FLOTA WHERE placa = ?";
        $stmt = $conexion->prepare($sqlDelete);
        $stmt->bind_param("s", $placa);
        $success = $stmt->execute();
        $stmt->close();
        jsonExit($success
            ? ["success" => true]
            : ["success" => false, "message" => "Error al eliminar flota"]);

    // ─── USUARIOS ───────────────────────────────────────────
    case "usuarios/list":
        $filtrar = $_GET['filtrar'] ?? '';
        $sql = $conexion->prepare("SELECT * FROM usuarios WHERE zona = ?");
        $sql->bind_param("s", $filtrar);
        $sql->execute();
        $result = $sql->get_result();
        $data = [];
        while ($fila = $result->fetch_assoc()) {
            $data[] = $fila;
        }
        $sql->close();
        jsonExit(["success" => true, "usuarios" => $data]);

    case "usuarios/new":
        $user = trim($_GET['userR'] ?? '');
        $pass = trim($_GET['passR'] ?? '');
        $zona = trim($_GET['opcion'] ?? '');
        if (!$user || !$pass || !$zona) {
            jsonExit(["status" => "error", "message" => "Todos los campos son obligatorios"]);
        }
        if (strlen($user) < 3) {
            jsonExit(["status" => "error", "message" => "Usuario muy corto"]);
        }
        $passHash = password_hash($pass, PASSWORD_BCRYPT);
        $sqlCheck = "SELECT user FROM usuarios WHERE user = ?";
        $stmt = $conexion->prepare($sqlCheck);
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            jsonExit(["status" => "error", "message" => "Usuario ya existe"]);
        }
        $stmt->close();
        $sqlInsert = "INSERT INTO usuarios (user, cont, zona) VALUES (?, ?, ?)";
        $stmt = $conexion->prepare($sqlInsert);
        $stmt->bind_param("sss", $user, $passHash, $zona);
        $success = $stmt->execute();
        $insertId = $stmt->insert_id;
        $stmt->close();
        jsonExit($success
            ? ["status" => "success", "usCod" => $insertId]
            : ["status" => "error", "message" => "Error al registrar"]);

    case "usuarios/edit":
        $id = intval($_GET['id'] ?? 0);
        $user = trim($_GET['user'] ?? '');
        if ($id <= 0 || !$user) {
            jsonExit(["success" => false, "message" => "Datos incompletos"]);
        }
        if (strlen($user) < 3) {
            jsonExit(["success" => false, "message" => "Usuario muy corto"]);
        }
        $sqlCheck = "SELECT usCod FROM usuarios WHERE user = ? AND usCod != ?";
        $stmt = $conexion->prepare($sqlCheck);
        $stmt->bind_param("si", $user, $id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            jsonExit(["success" => false, "message" => "El usuario ya existe"]);
        }
        $stmt->close();
        $sqlUpdate = "UPDATE usuarios SET user = ? WHERE usCod = ?";
        $stmt = $conexion->prepare($sqlUpdate);
        $stmt->bind_param("si", $user, $id);
        $success = $stmt->execute();
        $stmt->close();
        jsonExit($success
            ? ["success" => true, "message" => "Usuario actualizado"]
            : ["success" => false, "message" => "Error al actualizar"]);

    case "usuarios/del":
        $id = intval($_GET['id'] ?? 0);
        if ($id <= 0) {
            jsonExit(["success" => false, "message" => "ID inválido"]);
        }
        $sqlCheck = "SELECT usCod FROM usuarios WHERE usCod = ?";
        $stmt = $conexion->prepare($sqlCheck);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows === 0) {
            jsonExit(["success" => false, "message" => "Usuario no existe"]);
        }
        $stmt->close();
        $sqlDelete = "DELETE FROM usuarios WHERE usCod = ?";
        $stmt = $conexion->prepare($sqlDelete);
        $stmt->bind_param("i", $id);
        $success = $stmt->execute();
        $stmt->close();
        jsonExit($success
            ? ["success" => true, "message" => "Usuario eliminado"]
            : ["success" => false, "message" => "Error al eliminar"]);

    // ─── ZONAS ──────────────────────────────────────────────
    case "zonas/list":
        $query = "SELECT * FROM zonas";
        $stmt = $conexion->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        while ($fila = $result->fetch_assoc()) {
            $data[] = $fila;
        }
        $stmt->close();
        jsonExit(["success" => true, "zonas" => $data]);

    case "zonas/listOne":
        $filtrar = $_GET['filtrar'] ?? '';
        $sql = $conexion->prepare("SELECT nombreZona, abrev FROM ZONAS WHERE nombreZona = ?");
        $sql->bind_param("s", $filtrar);
        $sql->execute();
        $result = $sql->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $sql->close();
        jsonExit($data);

    case "zonas/new":
        $zona = trim($_GET['zona'] ?? '');
        $abrev = trim($_GET['abrev'] ?? '');
        $info = trim($_GET['info'] ?? '');
        $telefono = trim($_GET['telefono'] ?? '');
        if (!$zona || !$abrev || !$info || !$telefono) {
            jsonExit(["success" => false, "message" => "Todos los campos son obligatorios"]);
        }
        $sqlCheck = "SELECT nombreZona FROM zonas WHERE nombreZona = ?";
        $stmt = $conexion->prepare($sqlCheck);
        $stmt->bind_param("s", $zona);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            jsonExit(["success" => false, "message" => "La zona ya existe"]);
        }
        $stmt->close();
        $sql = "INSERT INTO zonas (nombreZona, abrev, informacion, telefono) VALUES (?, ?, ?, ?)";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ssss", $zona, $abrev, $info, $telefono);
        $success = $stmt->execute();
        $stmt->close();
        jsonExit($success
            ? ["success" => true]
            : ["success" => false, "message" => "Error al crear zona"]);

    case "zonas/edit":
        $zona = trim($_GET['zona'] ?? '');
        $info = trim($_GET['info'] ?? '');
        $telefono = trim($_GET['telefono'] ?? '');
        if (!$zona || !$info || !$telefono) {
            jsonExit(["success" => false, "message" => "Todos los campos son obligatorios"]);
        }
        $sql = "UPDATE zonas SET informacion = ?, telefono = ? WHERE nombreZona = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("sss", $info, $telefono, $zona);
        $success = $stmt->execute();
        $stmt->close();
        jsonExit($success
            ? ["success" => true]
            : ["success" => false, "message" => "Error al actualizar zona"]);

    case "zonas/del":
        $zona = trim($_GET['zona'] ?? '');
        if (!$zona) {
            jsonExit(["success" => false, "message" => "Zona no válida"]);
        }
        $sql = "DELETE FROM zonas WHERE nombreZona = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $zona);
        $success = $stmt->execute();
        $stmt->close();
        jsonExit($success
            ? ["success" => true]
            : ["success" => false, "message" => "No se pudo eliminar la zona"]);

    default:
        jsonExit(["success" => false, "message" => "Invalid entity/action: $entity/$action"]);
}

$conexion->close();
