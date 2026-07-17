const zona = localStorage.getItem("zona");
var dia = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

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
            <button class="cerrar" onclick="closeModal()">Cerrar</button>
        </div>
    `;
}

function setContingencia() {
    let modBox = document.getElementById('modBox');
    modBox.innerHTML = `
        <div class="mod-contingencia">
            <div>
                <label for="fechaMod" id="tFechMod">Selecciona una fecha:</label>
                <input type="text" id="fechaMod" name="fechaMod">
            </div>
            <div>
                <div class="separete">
                    <h2>Viajes</h2>
                    <button class="cerrar" onclick="closeModal()">Cerrar</button>
                </div>
                <div id="viajesBoxMod"></div>
            </div>
        </div>
    `;
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
        if(data.data.legth === 0) {
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
    })
    .catch(error => console.error("Error obteniendo viajes:", error));
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