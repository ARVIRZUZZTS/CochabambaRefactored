const diaL = localStorage.getItem("dia");
const zonaL = localStorage.getItem("zona");


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("horaInp").value = horaAct();
    document.getElementById("fechaTitle").textContent = "Fecha: " + diaL;
    document.getElementById("origenTitle").textContent = "Origen: " + zonaL;
    cargarFlotas();
    cargarZonas();
});

function fin() {
    var prop = document.getElementById('propInp').value.trim();
    var chof = document.getElementById('chofInp').value.trim();
    var plac = document.getElementById('placInp').value.trim();
    var dest = document.getElementById('destInp').value.trim();
    var hora = document.getElementById('horaInp').value.trim();
    let ayud = document.getElementById('ayudInp') ? document.getElementById('ayudInp').value.trim() : "";

    if (prop === "" || chof === "" || plac === "" || dest === "" || hora === "") {
        document.getElementById("msgVia").innerText = "Todos los campos son obligatorios menos Ayudante.";
        return;
    }

    fetch(`php/bus/viaje.php?prop=${encodeURIComponent(prop.trim())}
            &chof=${encodeURIComponent(chof.trim())}
            &ayud=${encodeURIComponent(ayud.trim())}
            &plac=${encodeURIComponent(plac.trim())}
            &dpto=${encodeURIComponent(dest.trim())}
            &hora=${encodeURIComponent(hora.trim())}
            &dia=${encodeURIComponent(diaL.trim())}
            &org=${encodeURIComponent(zonaL.trim())}`)
    .then(response => response.json()) 
    .then(data => {
        document.getElementById("msgVia").innerText = data.error || "Viaje registrado correctamente.";

        if (!data.error) {
            localStorage.setItem("encDest", dest);
            localStorage.setItem("viajeL", data.viajeCod);
            window.location.href = "encomienda.html";
        }
    })
    .catch(error => console.error("Error:", error));
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

function cargarZonas() {
    fetch(`php/bus/zonasF.php?filtrar=${encodeURIComponent(zonaL)}`)
    .then(response => response.json())
    .then(data => {
        let select = document.getElementById("destInp");
        select.innerHTML = "";

        if (data.length > 0) {
            select.innerHTML += `<option value="${data[0].nombreZona}" selected>
                                    ${data[0].nombreZona} (${data[0].abrev})
                                </option>`;
        }

        for (let i = 1; i < data.length; i++) {
            const zona = data[i];
            select.innerHTML += `<option value="${zona.nombreZona}">
                                    ${zona.nombreZona} (${zona.abrev})
                                </option>`;
        }
    })
    .catch(err => console.error("Error cargando zonas:", err));
}

function horaAct() {
    let ahora = new Date();
    let horas = ahora.getHours().toString().padStart(2, "0");
    let min = ahora.getMinutes().toString().padStart(2, "0");
    return `${horas}:${min}`;
}

function back() {
    window.location = "menu.html";
}