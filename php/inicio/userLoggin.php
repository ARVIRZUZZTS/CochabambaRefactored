<?php
    include "../conexion.php";
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $usuario = $_POST["userL"];
        $pass = $_POST["passL"];

        $query = $conexion->prepare("SELECT cont, zona FROM usuarios WHERE user = ?");
        $query->bind_param("s", $usuario);
        $query->execute();
        $result = $query->get_result();

        header("Content-Type: application/json");

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if(password_verify($pass, $row["cont"])) {
                echo json_encode([
                    "status" => "exito",
                    "message" => "Inicio de sesion exitoso",
                    "usuario" => $usuario,
                    "zona" => $row["zona"]
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Contraseña Incorrecta"
                ]);
            }
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Usuario no encontrado"
            ]);
        }
        $query->close();
        $conexion->close();
    }
?>
