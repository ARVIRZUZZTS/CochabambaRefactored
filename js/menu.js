const zona = localStorage.getItem("zona");
var dia = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
let diasCont = [];
let codesCont = [];

localStorage.setItem("dia", dia);

function showOp(event) {
    event.stopPropagation();
    document.getElementById("modBox").style.display = "flex";
}
function closeModal() {
    document.getElementById("modBox").style.display = "none";
}
window.addEventListener("click", function(event) {
    const modal = document.getElementById("modBox");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

function goAddBus() {
    window.location = "bus.html";
}
document.addEventListener('DOMContentLoaded', () => {
    setModalOpt();
    flatpickr("#fecha", {
        inline: true,
        dateFormat: "d-m-Y",
        locale: "es",
        defaultDate: dia,
        onChange: function (selectedDates, dateStr) {
            dia = dateStr;
            localStorage.setItem("dia",dia);
            console.log("Fecha seleccionada: " + dia);
            setPanel();
        }
    });
    
    setPanel();
});

function setModalOpt() {
    let modBox = document.getElementById('modBox');
    modBox.innerHTML = `
        <div class="modal-content">
            <h2>Opciones</h2>
            <button onclick="setContingencia()">Contingencia</button>
            <button onclick="listas()">Configuracion</button>
            <button onclick="out()">Cerrar Sesión</button>        
            <button class="cerrar" onclick="closeModal()">Cancelar</button>
        </div>
    `;
}

function setContingencia() {
    diasCont = [];
    codesCont = [];

    let modBox = document.getElementById('modBox');
    modBox.innerHTML = `
        <div class="mod-contingencia">
            <div>
                <label for="fechaMod" class="titleFech noBack">Selecciona una fecha:</label>
                <input type="text" id="fechaMod" name="fechaMod">
            </div>
            <div id="modCRight">
                <div class="separate">
                    <h2>Viajes Seleccionados</h2>
                    <button class="cerrar" onclick="setModalOpt()">Atras</button>
                </div>
                <div class="flex">
                    <div id="viaModTT" class="sb">
                        <h3 id="mt-1">Sel.</h3>
                        <h3 id="mt-2">Placa</h3>
                        <h3 id="mt-3">Destino</h3>
                        <h3 id="mt-4">Fecha</h3>
                    </div>
                    <hr>
                    <div id="viaModDin">Seleccione Fechas.</div>
                    <hr>
                    <div class="separate">
                        <button onclick="delContingencia()">Cancelar</button>
                        <button onclick="newContingencia()">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    flatpickr("#fechaMod", {
        inline: true,
        dateFormat: "d-m-Y",
        locale: "es",
        defaultDate: dia,
        onChange: function (selectedDates, dateStr) {
            if (!diasCont.includes(dateStr)) {
                diasCont.push(dateStr);
            }
            console.log("Fechas seleccionadas: " + diasCont.join(", "));
            cargarViajesFecha(dateStr);
        }
    });

    if (!diasCont.includes(dia)) {
        diasCont.push(dia);
    }
    cargarViajesFecha(dia);
}

function cargarViajesFecha(fecha) {
    fetch("php/menu/viajeFast.php", {
        method: "POST",
        body: new URLSearchParams({ fecha: fecha })
    })
    .then(res => res.json())
    .then(data => {
        let lista = document.getElementById("viaModDin");
        if (data.length === 0) {
            if (lista.innerHTML.trim() === "" || lista.innerHTML === "Seleccione Fechas.") {
            }
            return;
        }
        if (lista.innerHTML === "Seleccione Fechas.") {
            lista.innerHTML = "";
        }
        data.forEach(viaje => {
            if (codesCont.some(c => c.codigo === viaje.viajeCod)) return;
            codesCont.push({ codigo: viaje.viajeCod, destino: viaje.destino, placa: viaje.placa, fecha: fecha });
            lista.innerHTML += `
                <div class="contingencia-item">
                    <input type="checkbox" class="cont-check" data-codigo="${viaje.viajeCod}" checked>
                    <p>${viaje.placa}</p>
                    <p>${viaje.destino}</p>
                    <p>${fecha}</p>
                </div>
            `;
        });
    })
}

document.addEventListener("change", function(event) {
    if (event.target.classList.contains("cont-check")) {
        let codigo = event.target.dataset.codigo;
        if (event.target.checked) {
            let viajeRef = codesCont.find(c => c.codigo === codigo);
            if (!viajeRef) {
                let item = event.target.closest(".contingencia-item");
                let placa = item.querySelector("p:nth-of-type(1)").textContent;
                let destino = item.querySelector("p:nth-of-type(2)").textContent;
                let fecha = item.querySelector("p:nth-of-type(3)").textContent;
                codesCont.push({ codigo: codigo, destino: destino, placa: placa, fecha: fecha });
            }
        } else {
            codesCont = codesCont.filter(c => c.codigo !== codigo);
        }
    }
});

function newContingencia() {
    let selected = codesCont.filter(c => document.querySelector(`.cont-check[data-codigo="${c.codigo}"]`));
    if (selected.length === 0) {
        showToast("Seleccione al menos un viaje.");
        return;
    }
    if (diasCont.length === 0) {
        showToast("Seleccione al menos una fecha.");
        return;
    }

    let grupos = { cbba: [], montero: [], otros: [] };
    let destinosOtros = [];

    selected.forEach(v => {
        let d = v.destino.trim().toLowerCase();
        if (d === "cochabamba") {
            grupos.cbba.push(v.codigo);
        } else if (d === "montero") {
            grupos.montero.push(v.codigo);
        } else {
            grupos.otros.push(v.codigo);
            if (!destinosOtros.includes(v.destino)) {
                destinosOtros.push(v.destino);
            }
        }
    });

    let pendientes = [];

    if (grupos.cbba.length > 0) {
        pendientes.push(guardarGrupo(grupos.cbba, "Cochabamba", dia));
    }
    if (grupos.montero.length > 0) {
        pendientes.push(guardarGrupo(grupos.montero, "Montero", dia));
    }
    if (grupos.otros.length > 0) {
        pendientes.push(guardarGrupo(grupos.otros, destinosOtros.join(", "), dia));
    }

    Promise.all(pendientes)
        .then(() => {
            showToast("Contingencia guardada correctamente.");
            setTimeout(() => {
                window.location = "contingencia.html";
            }, 1000);
        })
        .catch(err => {
            console.error("Error al guardar:", err);
            showToast("Error al guardar la contingencia.", true);
        });
}

function guardarGrupo(viajeCodes, destino, fecha) {
    return fetch("php/menu/saveContingencia.php", {
        method: "POST",
        body: new URLSearchParams({
            viajeCod: viajeCodes.join(","),
            destino: destino,
            fecha: fecha
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) throw new Error(data.error);
    });
}

function delContingencia() {
    if (!confirm("Esta seguro de cancelar la contingencia? La lista se perdera.")) return;
    codesCont = [];
    diasCont = [];
    document.getElementById("viaModDin").innerHTML = "Seleccione Fechas.";
    showToast("Lista de contingencia cancelada.");
}

function setPanel(){
    let boxi = document.getElementById("all");
    boxi.innerHTML = `
        <div id="titulo">
            <h1 id="titleEncomiendas">Buses de ${zona}</h1>
            <button id="viajeEncomiendass" onclick="setLlegada()">LLEGADA</button>
        </div>
        <div id="encomiendas">
            <div class="titleMenu">
                <h3 class="placH3">Placa</h3>
                <h3 class="destH3">Destino</h3>
                <h3 class="chofH3">Chofer</h3>
                <h3 class="infoH3">Información</h3>
            </div>
            <div id="encBox"></div>
            <button id="addBut" onclick="goAddBus()">AGREGAR ENVIO</button>
        </div>
    `;
    obtenerViajes(dia);
}

function setLlegada(){
    let boxi = document.getElementById("all");

    boxi.innerHTML = `
        <div id="titulo">
            <h1 id="titleEncomiendas">Llegada</h1>
            <button id="viajeEncomiendass" onclick="setPanel()">Atras</button>
        </div>
        <div id="encomiendas">
            <div class="titleLlegada">
                <h3 class="placLl3">Placa</h3>
                <h3 class="infoLl3">Información</h3>
            </div>
            <div id="encBox">
                <div id="listaLlegada">Cargando...</div>
            </div>            
            <button id="addBut" onclick="goAddBus()">AGREGAR ENVIO</button>
        </div>
    `;
    fetch("php/menu/llegadaSB.php", {
        method: "POST",
        body: new URLSearchParams({
            zona: localStorage.getItem("zona"),
            dia: localStorage.getItem("dia")
        })
    })
    .then(res => res.json())
    .then(data => {
        let lista = document.getElementById("listaLlegada");
        lista.innerHTML = "";
        if (!data.data || data.data.length === 0) {
            lista.innerHTML = "<p>No hay viajes pendientes.</p>";
            return;
        }
        data.data.forEach(viaje => {
            lista.innerHTML += `
                <div class="llegada-item">
                    <p class="llegadaPlaca">${viaje.placa}</p>
                    <button id="llegadaInfo" onclick="infoLlegada('${viaje.viajeCod}')">Info</button>
                </div>
            `;
        });
    })
}

function obtenerViajes(fecha) {
    let aux = zona.trim();
    fetch("php/menu/viajeGetAll.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "fecha=" + encodeURIComponent(fecha) +
              "&depto=" + encodeURIComponent(zona)
    })
    .then(response => response.json())
    .then(data => {
        let viajeContainer = document.getElementById("encBox");
        viajeContainer.innerHTML = ""; 

        if (data.length === 0) {
            viajeContainer.innerHTML = "<p>No hay VIAJES para esta fecha.</p>";
        } else {
            data.forEach(viaje => {                
                if (aux.trim()  !== viaje.destino.trim()) {
                    console.log("entro");
                    viajeContainer.innerHTML += `<br>`;
                    aux = viaje.destino.trim();
                }
                viajeContainer.innerHTML += `
                    <div class="viaje-item">
                        <p>${viaje.placa}</p>
                        <p>${viaje.destino}</p>
                        <p>${viaje.chofer}</p>
                        <button onclick="info('${viaje.viajeCod}')">+</button>
                    </div>
                `;
            })
        }
        mostrarContingencias(fecha);
    })
    .catch(error => console.error("Error obteniendo viajes:", error));
}

function mostrarContingencias(fecha) {
    fetch("php/menu/contingenciaGet.php", {
        method: "POST",
        body: new URLSearchParams({ fecha: fecha })
    })
    .then(res => res.json())
    .then(data => {
        if (data.length === 0) return;
        let container = document.getElementById("encBox");
        data.forEach(cont => {
            container.innerHTML += `
                <div class="viaje-item contingencia-info">
                    <p class="m2-1">Contingencia #${cont.codigo}</p>
                    <p class="m2-2">${cont.destino}</p>
                    <button class="m2-3" onclick="contingencia('${cont.codigo}')">Info.</button>
                </div>
            `;
        });
    })
}

function contingencia(id){
    localStorage.setItem("contingencia", id);
    window.location = "contingencia.html";
}
function info(code){
    localStorage.setItem("viajeL", code);
    window.location = "informacion.html";
}
function infoLlegada(code){
    localStorage.setItem("viajeLlegada", code);
    window.location = "llegada.html";
}
function listas() {
    window.location = "configuracion.html";
}
function out() {
    window.location = "inicio.html";
}
function faltas() {
    window.location = "faltas.html";
}
function encDia(){
    window.location = "diarios.html";
}

function showToast(mensaje, esError = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.style.backgroundColor = esError ? "#d9534f" : "#4CAF50";
    toast.className = "show";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}
