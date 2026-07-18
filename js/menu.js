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
            diasCont.push(dateStr);
            console.log("FechaArray: " + diasCont[diasCont.length - 1]);
        }
    });
    fetch("php/menu/viajeFast.php", {
        method: "POST",
        body: new URLSearchParams({
            fecha: dia
        })
    })
    .then(res => res.json())
    .then(data => {
        let lista = document.getElementById("viaModDin");
        lista.innerHTML = "";
        if(data.data.legth === 0) {
            lista.innerHTML = "<p>No hay viajes pendientes.</p>";
            return;
        }
        data.data.forEach(viaje => {
            codesCont.push(viaje.viajeCod);
            lista.innerHTML += `
                <div class="contingencia-item">
                    //checkbox en true por defecto porque ya esta en codesCont, si lo quitamos, lo quitamos en codeCont
                    <p>${viaje.placa}</p>
                    <p>${viaje.destino}</p>
                </div>
            `;
        });
    })
}

//function evento de agregar y de quitar con los checkbox a la codesCont, no importa el orden realmente

function newContingencia() {
    // en este caso tenemos que guardar los viajes en las validaciones, revisa contingencia.sql
    // y guardamos segun el destino, imagino talvez que deberiamos guardar una tupla no?
    // en la parte de codeCont para tener el viajeCod y destino, ya que si el destino
    // es "Cochabamba", "Montero", pues se crea una contingencia unos es auto increment que es el id, luego
    // vemos el codigo, el ultimo que fue creado y agregamos ese numero+1 y toda la lista de viajeCod
    //ojo mira, en un dia se pueden enviar de varios destinos, pero solo agrupamos segun destino
    // digamos "Cochabamba" y "Montero" para eso hay viajes en un mismo dia pero digamos tenemos varias fechas seleccionadas
    // 14,15,16,17 y 18 del 07, y hay 3 viajes a "Santa Cruz" y "Yacuiba" y como no son Cochabamba o Montero, pues lo coloco en uno mismo, digamos id=1,codigo=3,codeViaje=${codeviaje} y asi, 
    // luego el tercero es a "Montero" entonces lo agrupamos en otra variable o algo asi, y este de montero o si fuese de cbba pues seria tipo id=2,codigo=4,codeViaje=${codeviaje}
    // y lo mandamos a saveContingencia, y bueno ese seria el flujo, y ahi se guardaria
    // eso si en las contingencias con las fechas actuales
    // entonces en este caso debemos crear 2 contingencias no, si no son de cbba o mont pues
    // todo junto
    fetch("php/menu/saveContingencia.php", {
        method: "POST",
        body: new URLSearchParams({
            fecha: dia
        })
    })
    .then(res => res.json())
    .then(data => {
        
    })
    window.location = "contingencia.html";
}

function delContingencia() {
    confirmation("Esta seguro de cancelar la contingencia? La lista se perdera."); //revisa esta parte si esta bien la confirmacion para limpiar la variable
    codesCont.length = 0;
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
        // aqui deberiamos agregar la contingencia con este formato
        //<div>
        //    <p>Contingencia #${contigencia.codigo}</p>
        //    <button onclick="contingencia('${contingencia.codigo}')">Info.</button>
        //</div>
    })
    .catch(error => console.error("Error obteniendo viajes:", error));
}
// deberiamos crear la de function contingencia() y guardamos en el localStorage, ya estaria
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
function encDia(){
    window.location = "diarios.html";
}