const zona = localStorage.getItem("zona");
var dia = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
let diasCont = [];
let codesCont = [];
let flotaVehiculo = null;

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
    procesarViajesPendientes();
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
            <button onclick="setPorcentajes()">Porcentajes</button>
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
                    <div class="flex" style="gap:6px">
                        <label for="flotaInput" style="font-weight:bold;font-size:small">Vehículo:</label>
                        <input type="text" id="flotaInput" list="flotaList" autocomplete="off" style="width:100%;height:32px;font-size:small;box-sizing:border-box" placeholder="Buscar placa...">
                        <datalist id="flotaList"></datalist>
                    </div>
                    <hr>
                    <div class="separate">
                        <button onclick="delContingencia()">Elminar Lista</button>
                        <button onclick="newContingencia()">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    cargarFlotasSelect();

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

function setPorcentajes() {
    diasCont = [];
    codesCont = [];

    let modBox = document.getElementById('modBox');
    modBox.innerHTML = `
        <div class="mod-porcentaje">
            <label class="titleFech noBack">Selecciona el Rango de Fechas del Reporte:</label>
            <hr>
            <div id="modCRight">
                <div class="separate">
                    <h2>Rango de Fechas</h2>
                </div>
                <div class="flex">
                    <div class="rangoFechas">
                        <div class="campoFecha">
                            <label for="porcDesde" style="font-weight:bold">Desde:</label>
                            <input type="date" id="porcDesde">
                        </div>
                        <div class="campoFecha">
                            <label for="porcHasta" style="font-weight:bold">Hasta:</label>
                            <input type="date" id="porcHasta">
                        </div>
                    </div>
                    <hr>
                    <div class="sb">
                        <button class="cerrar" onclick="setModalOpt()">Atras</button>
                        <button onclick="impPorcentajes()">IMPRIMIR</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    let hoy = new Date();
    let hace15 = new Date(hoy);
    hace15.setDate(hace15.getDate() - 15);
    document.getElementById("porcDesde").value = fmtDateISO(hoy);
    document.getElementById("porcHasta").value = fmtDateISO(hace15);
}

function fmtDateISO(d) {
    let dd = String(d.getDate()).padStart(2, "0");
    let mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function isoToDmy(iso) {
    let p = iso.split("-");
    return `${p[2]}-${p[1]}-${p[0]}`;
}

function impPorcentajes() {
    let desde = document.getElementById("porcDesde").value;
    let hasta = document.getElementById("porcHasta").value;
    if (!desde || !hasta) {
        showToast("Seleccione ambas fechas del rango.", true);
        return;
    }
    if (desde > hasta) {
        let aux = desde;
        desde = hasta;
        hasta = aux;
    }

    fetch("php/menu/getPorcentajes.php", {
        method: "POST",
        body: new URLSearchParams({ desde: isoToDmy(desde), hasta: isoToDmy(hasta) })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) throw new Error(data.error);
        console.log("Datos porcentajes:", data);

        let printBox = document.getElementById("porcentajePrint");
        if (!printBox) {
            showToast("No se encontro el contenedor de impresion.", true);
            return;
        }

        let filas = "";
        let totBruto = 0, totTotal = 0, totCBBA = 0, totSC = 0;

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(v => {
                totBruto += parseFloat(v.montoBruto);
                totTotal += parseFloat(v.totalPct);
                totCBBA += parseFloat(v.cbbaPct);
                totSC += parseFloat(v.scPct);
                filas += `
                    <tr>
                        <td>${v.fecha}</td>
                        <td>${v.propietario}</td>
                        <td>${v.placa}</td>
                        <td>${parseFloat(v.montoBruto).toFixed(2)}</td>
                        <td>${Math.ceil(parseFloat(v.totalPct))}</td>
                        <td>${parseFloat(v.cbbaPct)}</td>
                        <td>${Math.ceil(parseFloat(v.scPct))}</td>
                    </tr>
                `;
            });
        }

        printBox.innerHTML = `
            <div id="porcentajePrintContent">
                <div class="sb">
                    <img id="imgPrPorc" src="img/logXXF.png" alt="">
                    <div>
                        <h1>PORCENTAJES DE ENCOMIENDAS</h1>
                        <h3>Desde: ${isoToDmy(desde)} — Hasta: ${isoToDmy(hasta)}</h3>
                    </div>
                </div>
                <table id="tablaPorcentajes">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Propietario</th>
                            <th>Placa</th>
                            <th>Monto Bruto</th>
                            <th>Total 15-16%</th>
                            <th>CBBA 9%</th>
                            <th>SC 6-7%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filas || `<tr><td colspan="7">No hay viajes en el rango seleccionado.</td></tr>`}
                    </tbody>
                    ${filas ? `
                    <tfoot>
                        <tr>
                            <td colspan="3">TOTAL</td>
                            <td>${totBruto.toFixed(2)}</td>
                            <td>${Math.ceil(totTotal)}</td>
                            <td>${Math.round(totCBBA)}</td>
                            <td>${Math.ceil(totSC)}</td>
                        </tr>
                    </tfoot>` : ""}
                </table>
            </div>
        `;
        const imgElement = printBox.querySelector("#imgPrPorc");
        const imgPreload = new Image();
        const conteo = Array.isArray(data) ? data.length : 0;

        imgPreload.onload = function () {
            imgElement.src = imgPreload.src;
            printBox.classList.add("print-visible");
            window.print();
            printBox.classList.remove("print-visible");
            printBox.innerHTML = "";
            showToast(`Reporte generado con ${conteo} viajes.`);
        };
        imgPreload.onerror = function () {
            console.warn("No se pudo cargar la imagen, imprimiendo sin ella");
            printBox.classList.add("print-visible");
            window.print();
            printBox.classList.remove("print-visible");
            printBox.innerHTML = "";
            showToast(`Reporte generado con ${conteo} viajes.`);
        };
        imgPreload.src = 'img/logXXF.png';
    })
    .catch(err => {
        console.error("Error obteniendo porcentajes:", err);
        showToast("Error al generar el reporte.", true);
    });
}

function cargarFlotasSelect() {
    fetch("php/bus/flotas.php")
        .then(res => res.json())
        .then(data => {
            let input = document.getElementById("flotaInput");
            let list = document.getElementById("flotaList");
            if (!input || !list) return;
            list.innerHTML = "";
            data.forEach(f => {
                let opt = document.createElement("option");
                opt.value = f.placa;
                opt.dataset.prop = f.propietario;
                opt.dataset.chof = f.chofer;
                opt.textContent = `${f.placa} — ${f.propietario} | ${f.chofer}`;
                list.appendChild(opt);
            });
            input.addEventListener("input", function() {
                let val = this.value.trim();
                let match = data.find(f => f.placa === val);
                if (match) {
                    flotaVehiculo = { placa: match.placa, propietario: match.propietario, chofer: match.chofer };
                } else {
                    flotaVehiculo = null;
                }
            });
        })
        .catch(e => console.error("Error cargando flotas:", e));
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
    if (!flotaVehiculo) {
        showToast("Seleccione un vehículo (placa).");
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

    let tareas = [];

    if (grupos.cbba.length > 0) {
        tareas.push(() => guardarGrupo(grupos.cbba, "Cochabamba", dia));
    }
    if (grupos.montero.length > 0) {
        tareas.push(() => guardarGrupo(grupos.montero, "Montero", dia));
    }
    if (grupos.otros.length > 0) {
        tareas.push(() => guardarGrupo(grupos.otros, destinosOtros.join(", "), dia));
    }

    let ultimoCodigo = null;
    let promesa = Promise.resolve();

    tareas.forEach(t => {
        promesa = promesa.then(() => t().then(codigo => { ultimoCodigo = codigo; }));
    });

    promesa
        .then(() => {
            localStorage.setItem("contingencia", ultimoCodigo);
            showToast("Contingencia #" + ultimoCodigo + " guardada.");
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
            fecha: fecha,
            placa: flotaVehiculo.placa,
            propietario: flotaVehiculo.propietario,
            chofer: flotaVehiculo.chofer
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) throw new Error(data.error);
        return data.codigo;
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
                <h3>Placa</h3>
                <h3>Destino</h3>
                <h3>Información</h3>
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
                    <p>${viaje.placa}</p>
                    <p>${getDestinoFromViajeCod(viaje.viajeCod)}</p>
                    <button onclick="infoLlegada('${viaje.viajeCod}')">Info</button>
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
                <div class="viaje-item">
                    <p>${cont.placa || ""}</p>
                    <p>${cont.destino}</p>
                    <p>Contingencia #${cont.codigo}</p>
                    <button onclick="contingencia('${cont.codigo}')">+</button>
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

function getDestinoFromViajeCod(codigo) {
    if (codigo.includes("CB")) return "Cochabamba";
    if (codigo.includes("SC")) return "Santa Cruz";
    if (codigo.includes("MO")) return "Montero";
    return "Otro";
}

function showToast(mensaje, esError = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.style.backgroundColor = esError ? "#d9534f" : "#4CAF50";
    toast.className = "show";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 5000);
}
