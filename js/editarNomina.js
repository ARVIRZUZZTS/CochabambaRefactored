const diaL = localStorage.getItem("dia");
const zonaL = localStorage.getItem("zona");
const viajeL = localStorage.getItem("viajeL");

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fechaTitle").textContent = "Viaje en Fecha: " + diaL;
    document.getElementById("origenTitle").textContent = "Origen: " + zonaL;
    cargarFlotas();
    cargarDatos();
});

function cargarDatos() {
    fetch(`php/editarNomina/viajeZona.php?viaje=${encodeURIComponent(viajeL)}`)
        .then(res => res.json())
        .then(data => {
            console.log("Datos del viaje cargados:", data);
            document.getElementById("propInp").placeholder = data.viaje.propietario;
            document.getElementById("chofInp").placeholder = data.viaje.chofer;
            document.getElementById("ayudInp").placeholder = data.viaje.ayudante || "Ayudante";
            document.getElementById("placInp").placeholder = data.viaje.placa;
            document.getElementById("horaInp").placeholder = data.viaje.hora;
            const select = document.getElementById("destInp");
            const texto = `${data.viaje.destino.trim()} (${data.viaje.abrev})`;
            const opt = document.createElement("option");
            opt.value = data.viaje.destino;
            opt.textContent = texto;
            opt.selected = true;
            opt.disabled = true;
            select.appendChild(opt);
            select.disabled = true;
        })
        .catch(e => console.error("Error cargando datos del viaje:", e));
}

let flotas = [];

function cargarFlotas() {
    fetch("php/bus/flotas.php")
        .then(res => res.json())
        .then(data => {
            flotas = data;

            const placas = [...new Set(data.map(f => f.placa))];
            const props = [...new Set(data.map(f => f.propietario))];
            const chofs = [...new Set(data.map(f => f.chofer))];

            llenarLista("placlist", placas);
            llenarLista("proplist", props);
            llenarLista("choflist", chofs);
        })
        .catch(e => console.error("Error cargando flotas:", e));
}

function llenarLista(id, valores) {
    let list = document.getElementById(id);
    list.innerHTML = "";
    valores.forEach(v => {
        list.innerHTML += `
            <option value="${v}">${v}</option>
        `;
    })
}

function onSelectPlaca() {
    const placa = document.getElementById("placInp").value;
    const f = flotas.find(x => x.placa === placa);
    if (f) {
        document.getElementById("propInp").value = f.propietario;
        document.getElementById("chofInp").value = f.chofer;
    }
}

function onSelectPropietario() {
    const prop = document.getElementById("propInp").value;

    let f = flotas.find(x => x.propietario === prop);
    if (f) {
        document.getElementById("placInp").value = f.placa;
        document.getElementById("chofInp").value = f.chofer;
    }
}

function onSelectChofer() {
    const chofer = document.getElementById("chofInp").value;

    let f = flotas.find(x => x.chofer === chofer);
    if (f) {
        document.getElementById("placInp").value = f.placa;
        document.getElementById("propInp").value = f.propietario;
    }
}

function back() {
  window.location.href = `informacion.html`;
};

function fin() {
    const prop = document.getElementById("propInp").value.trim() || document.getElementById("propInp").placeholder;
    const chofer = document.getElementById("chofInp").value.trim() || document.getElementById("chofInp").placeholder;
    const ayudante = document.getElementById("ayudInp").value.trim() || document.getElementById("ayudInp").placeholder;
    const placa = document.getElementById("placInp").value.trim() || document.getElementById("placInp").placeholder;
    const destino = document.getElementById("destInp").value.trim() || document.getElementById("destInp").placeholder;
    const hora = document.getElementById("horaInp").value.trim() || document.getElementById("horaInp").placeholder;

    const params = new URLSearchParams(window.location.search);

    fetch(`php/editarNomina/editarNominas.php?code=${encodeURIComponent(viajeL.trim())}
            &prop=${encodeURIComponent(prop.trim())}
            &chofer=${encodeURIComponent(chofer.trim())}
            &ayudante=${encodeURIComponent(ayudante.trim())}
            &placa=${encodeURIComponent(placa.trim())}
            &destino=${encodeURIComponent(destino.trim())}
            &hora=${encodeURIComponent(hora)}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = `informacion.html`;
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        console.error("Error al actualizar:", err);
        alert("Ocurrió un error en la actualización.");
    });
}