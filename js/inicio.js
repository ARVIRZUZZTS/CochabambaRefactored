document.addEventListener("DOMContentLoaded", () => {
    verificador();
    cargarZonas();
});

async function verificador() {
    try {
        const response = await fetch("php/inicio/userVerificar.php");
        const data = await response.json();

        const form = document.getElementById("regForm");

        if (data.usuarios > 0) {
            form.style.display = "none";
            console.log("Usuarios existentes:", data.usuarios);
        } else {
            form.style.display = "flex";
            console.log("Sin usuarios registrados.");
        }
    } catch (error) {
        console.error("Error al verificar usuarios:", error);
    }
}
async function cargarZonas() {
    const select = document.getElementById("zonaSelect");
    try {
        const response = await fetch("php/inicio/zonasGetAll.php");
        const zonas = await response.json();

        zonas.forEach(z => {
            const option = document.createElement("option");
            option.value = z.nombreZona;
            option.textContent = z.nombreZona;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando zonas:", error);
    }
}

function login() {
    var formData = new FormData(document.getElementById("logForm"));

    fetch("php/inicio/userLoggin.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("msgLog").innerText = data.message;

        if (data.status === "exito") {
            localStorage.setItem("usuario", data.usuario);
            localStorage.setItem("zona", data.zona);

            window.location.href = "menu.html";
        }
    })
    .catch(error => console.error("Error:", error));
}

async function register(event) {
    event.preventDefault();

    const user = document.getElementById("userReg").value.trim();
    const pass = document.getElementById("passReg").value.trim();
    const zona = document.getElementById("zonaSelect").value;

    if (!user || !pass || !zona) {
        document.getElementById("msgReg").innerText = "Todos los campos son obligatorios";
        return;
    }

    const data = {
        userR: user,
        passR: pass,
        opcion: zona
    };

    try {
        const response = await fetch("php/inicio/userRegister.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        document.getElementById("msgReg").innerText = result.message;

        if (result.status === "success") {
            console.log("Usuario registrado con código:", result.usCod);
            window.location.href = "menu.html";
        }
    } catch (error) {
        console.error("Error en el registro:", error);
        document.getElementById("msgReg").innerText = "Error al registrar usuario.";
    }
}


function verLog() {
    const sL = document.getElementById("passLog");
    sL.type = sL.type === "password" ? "text" : "password";
}

function verReg() {
    const sL = document.getElementById("passReg");
    sL.type = sL.type === "password" ? "text" : "password";
}

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "g") {
        const regForm = document.getElementById("regForm");
        if (regForm) {
            regForm.style.display = "flex";
        } else {
            console.warn("No se encontró el elemento con id 'regForm'");
        }
    }
});
