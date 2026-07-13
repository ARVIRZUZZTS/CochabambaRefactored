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
        list.innerHTML += `<option value="${v}">${v}</option>`;
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
    const zonaL = localStorage.getItem("zona");
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
