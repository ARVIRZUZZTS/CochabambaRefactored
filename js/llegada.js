const zona = localStorage.getItem("zona");
const fecha = localStorage.getItem("dia");
const viaje = localStorage.getItem("viajeLlegada");
let placa = "";
let origen = "";
let destino = "";
let abrevDes = "";

let hora = horaAct();

let totalGlobal = 0;
let porPagar = 0;
let cancelado = 0;

let espV = 0;
function back() {
    window.location = "menu.html";
}

document.addEventListener("DOMContentLoaded", function () {destino
    procesarViajesPendientes();
    cargarDatos();
    setH();
});
function cargarDatos() {
    fetch(`php/llegada/viajeLlegada.php?viaje=${encodeURIComponent(viaje)}`)
        .then(response => response.json())
        .then(data => {
            const listaViajes = data.llegadas;
            const viajeData = listaViajes[0];
            console.log(viajeData);
            placa = viajeData.placa ? viajeData.placa.trim() : "Sin placa";
            
            if (viaje.substring(0, 2) == 'SC') {
                destino = 'Cochabamba';
            } else if (viaje.substring(0, 2) == 'CB') {
                destino = 'Santa Cruz';
            } else if (viaje.substring(0, 2) == 'MN') {
                destino = 'Montero';
            } else {
                destino = 'Otro';
            }
            document.getElementById("viTk").textContent = `Llegada de: ${destino}`;
            document.getElementById("fcTk").textContent = `Fecha de creación: ${fecha}`;
            
            obtenerEncomiendas();
            
            document.getElementById("infoH1").textContent = `Informacion de la Llegada: ${viaje}`;
            document.getElementById("plTit").textContent = `Placa: ${placa}`;
            document.getElementById("llTit").textContent = `Llegada de: ${destino}`;
            document.getElementById("feTit").textContent = `Fecha: ${fecha}`;

            document.getElementById("cdTk").textContent = `Código: ${viaje}`;
            document.getElementById("plTk").textContent = `Placa: ${placa}`;
            document.getElementById("horaP").textContent = `Hora: ${hora}`;  
            setZona();
            cargarTitulos();     
        }).catch(error => {
            console.error("Error al cargar datos del viaje:", error);
        });
}
function cargarTitulos(){
    let titulos = document.getElementById("titles");
    let titulosTicket = document.getElementById("titPrint");
    titulos.innerHTML = `
        <h2>N°</h2>
        <h2>Consignatario</h2>
        <h2>Telfono C</h2>
        <h2>Detalle</h2>
        <h2>Estado Pago</h2>
    `;
    titulosTicket.innerHTML = `
        <h2 id="tt">T</h2>
        <h2 id="num">N°</h2>
        <h2 id="con">Consignatario</h2>
        <h2 id="ci">Ci</h2>
        <h2 id="det">Detalle</h2>
        <h2 id="cel">Cel</h2>
    `;
    titulos.innerHTML += `
        <h2>Total</h2>
    `;
    titulosTicket.innerHTML += `
        <h2 id="fe">Fecha</h2>
        <h2 class="pago">C</h2>
        <h2 class="pago">PxP</h2>
        <h2 id="fir">Firma</h2>
    `;
}
function setH() {
    document.getElementById("horaP").innerText = "Hora: " + horaAct();
}
function setZona() {
    console.log(destino);
    if (destino != "Santa Cruz" && destino != "Cochabamba") {
        document.getElementById("destiny").textContent = destino.toUpperCase();
    }
}
function showToast(mensaje, esError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.style.backgroundColor = esError ? "#d9534f" : "#4CAF50";
    
    toast.className = "show";
    
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 5000);
}
function obtenerEncomiendas() {
    fetch(`php/llegada/encomiendaLlegada.php?viaje=${encodeURIComponent(viaje)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }
            return response.json();
        })
        .then(data => {
            let contenedor = document.getElementById("encomiendas");
            let listEnco = document.getElementById("impDiv");
            let res = document.getElementById("resumen");
            let pagosBox = document.getElementById("pagos");
            let pagosFoo = document.getElementById("pagosFoo");
            console.log(abrevDes);
            
            contenedor.innerHTML = "";
            listEnco.innerHTML = "";
            let viajeEnco = `Llegada de ${destino}`;
            res.innerHTML = `
                <img id="imgPr3" src="img/logXXF.png" alt="">
                <h3 id="titu">LIQ. ENC. PXP</h3>
                <h3>${viajeEnco}</h3>
                <h3>Placa: ${placa}</h3>
                <div id="fechHR">
                    <h3>Fecha: ${fecha}</h3>
                    <h3>Hora: ${horaAct()}</h3>
                </div>
                <div id="titRes">
                    <h3>N°</h3>
                    <h3>Total</h3>
                    <h3>Firma</h3>
                </div>
                <div id="listR"></div>                
            `;

            if (!Array.isArray(data) || data.length === 0) {
                contenedor.innerHTML = '<p id="noEnc">No hay encomiendas para este viaje.</p>';
                listEnco.innerHTML = '<p id="noEnc">No hay encomiendas para este viaje.</p>';
                return;
            }
            let cont = 0;
            console.log(data);
            data.forEach(encomienda => {
                let divEncomienda = document.createElement("div");
                let listImp = document.createElement("div");
                let listRes = document.createElement("div");
                
                espV++;

                divEncomienda.classList.add("encomienda-item");
                listImp.classList.add("encomienda-print");

                let [numero, ciudad] = encomienda.conEnc.split('-');

                if (numero.length > 5) {
                    numero = numero.slice(-5);
                }

                let maxConEnc = `${numero}-${ciudad}`;
                
                let encomiendaHTML = `
                    <textarea readonly>${maxConEnc}</textarea>
                    <textarea readonly>${encomienda.consignatario}</textarea>
                    <textarea readonly>${encomienda.conTelf}</textarea>
                    <textarea readonly>${encomienda.bulto}</textarea>
                `;

                let estadoPagaClass = "";
                let estadoPagaTexto = "";
                
                if (encomienda.estadoPaga != '1') {
                    listRes.innerHTML = `
                        <h4>${maxConEnc}</h4>
                        <h4>${encomienda.total}</h4>
                        <h4></h4>
                    `;
                }                

                if (encomienda.estadoPaga.trim() == "1") {
                    estadoPagaTexto = "Cancelado";
                    estadoPagaClass = "";                    
                } else {
                    estadoPagaTexto = "Por Pagar";
                    estadoPagaClass = " class=\"xp\"";                    
                }
                encomiendaHTML += `
                    <textarea ${estadoPagaClass} readonly>${estadoPagaTexto}</textarea>
                    <textarea readonly>${encomienda.total} Bs</textarea>
                `;
                
                divEncomienda.innerHTML = encomiendaHTML;
                let telfImp = encomienda.conTelf == "0" ? "R " + encomienda.remTelf : encomienda.conTelf;
                let bultosMax = encomienda.bulto.length > 50 ? "<h5 class=\"bult\">" + encomienda.bulto + "</h5>" : "<h3 class=\"bult\">" + encomienda.bulto + "</h3>";
                //encomienda impresion////////////////////////////////////////////////////////////////////
                listImp.innerHTML = `
                    <h3 class="ttc"></h3>
                    <h3 class="conE">${maxConEnc}</h3>
                    <h3 class="consg">${encomienda.consignatario}</h3>
                    <h3 class="ci"></h3>
                    ${bultosMax}
                    <h3 class="cel">${telfImp}</h3>
                `;
                let pagoC = "";
                let pagoPP = "";
                if (encomienda.estadoPaga == "1") {
                    pagoC = encomienda.total;
                    pagoPP = "0";
                    cancelado += parseFloat(encomienda.total);
                } else {
                    pagoC = "0";
                    pagoPP = encomienda.total;
                    porPagar += parseFloat(encomienda.total);
                }
                listImp.innerHTML += `
                    <h3 class="fe"></h3>                  
                    <h3 class="pago">${pagoC}</h3>
                    <h3 class="pago">${pagoPP}</h3>
                    <h3 class="fir"></h3>
                `;
                totalGlobal += parseFloat(encomienda.total) || 0;
                
                document.getElementById("listR").appendChild(listRes);
                contenedor.appendChild(divEncomienda);
                listEnco.appendChild(listImp);
                
            }); 
            console.log("entra??");
            pagosBox.innerHTML = `
                <h2 id="porPagarPrint">Por Pagar: ${porPagar.toFixed(2)} Bs</h2>
                <h2 id="canceladoPrint">Cancelado: ${cancelado.toFixed(2)} Bs</h2>
                <h2 id="totalPrint">Total: ${totalGlobal.toFixed(2)} Bs</h2>
            `;
            pagosFoo.innerHTML = `
                <h2 id="porPagar">Por Pagar: ${porPagar.toFixed(2)} Bs</h2>
                <h2 id="cancelado">Cancelado: ${cancelado.toFixed(2)} Bs</h2>
                <h2 id="total">Total: ${totalGlobal.toFixed(2)} Bs</h2>
            `;
            res.innerHTML += `
                <h3 class="pag" id="porPagarR">Por Pagar: ${porPagar.toFixed(2)} Bs</h3>                
            `;
            res.innerHTML += `                
                <div id="spaceRes"></div>
                <hr>
            `;        
            document.getElementById("auxi").textContent = "Despachador"; //+ espV; 
        })
        .catch(error => console.error("Error obteniendo encomiendas:", error));
}

function printDiv(aux) {
    document.getElementById('ticket').classList.add('print-visible');
    document.getElementById('resumen').classList.remove('print-visible');
    setSpace(aux);
    window.print();
    document.getElementById('ticket').classList.remove('print-visible');
}

function setSpace(aux) {
    const tick = document.querySelector("#ticket.print-visible");
    const esp = document.getElementById("espacioBox");

    if (aux !== '1') {
        tick.style.transform = "rotate(0deg)";
        return;
    }

    tick.style.transform = "rotate(180deg)";

    const margins = [
        "12cm","11.5cm","11cm","10cm","8.5cm","7.5cm","6.5cm","5.5cm","4.5cm","3.5cm",
        "2.5cm","2cm","1cm","0cm","17cm","16cm","14cm","13cm","12cm","11cm",
        "10cm","9cm","8cm","7cm","6cm","5cm","4cm","3cm","2cm","2cm",
        "1cm","0cm","17cm","16cm","14cm","13cm","12cm","11cm","10cm","9cm",
        "8cm","7cm","6cm","5cm","4cm","3cm","2cm","2cm","1cm","0cm",
        "0cm","17cm","16cm","15cm","14cm","12cm","11cm","10cm","9cm","8cm",
        "7cm","6cm","5cm","4cm","3cm","2cm","2cm","1cm","0cm","0cm",
        "17cm","16cm","15cm","14cm","12cm","11cm","10cm","9cm","8cm","7cm",
        "6cm","5cm","4cm","3cm","2cm","2cm","1cm","0cm","0cm","17cm",
        "16cm","15cm","14cm","13cm","12cm","11cm","10cm","9cm","8cm","7cm",
        "6cm","5cm","4cm","3cm","2cm","2cm","1cm","0cm","0cm","16cm",
        "15cm","14cm","13cm","12cm","11cm","10cm","9cm","8cm","7cm","6cm",
        "5cm","4cm","3cm","2cm","2cm","1cm","0cm","0cm"
    ];

    esp.style.marginTop = margins[espV] ?? "16cm";
}


function resPrint() {
    document.getElementById('resumen').classList.add('print-visible');
    document.getElementById('ticket').classList.remove('print-visible');
    print();
    document.getElementById('resumen').classList.remove('print-visible');
}
function horaAct() {
    let ahora = new Date();
    let horas = ahora.getHours().toString().padStart(2, "0");
    let min = ahora.getMinutes().toString().padStart(2, "0");
    return `${horas}:${min}`;
}

function goExcel() {
    showToast("Generando Excel...", false);

    const link = document.createElement('a');
    link.href = `php/llegada/generarExcel.php?viaje=${encodeURIComponent(viaje)}&destino=${encodeURIComponent(destino)}`;
    link.target = '_blank';
    link.download = `${viaje}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Excel generado exitosamente", false);
}

let tramosData = [];

function tramos() {
    let box = document.getElementById("modBox");
    if (!box) {
        showToast("Error: modal no encontrado", true);
        return;
    }
    box.style.display = "flex";
    box.innerHTML = `
        <div id="tramosContainer">
            <h1>Medios Tramos</h1>
            <h3>${fecha}</h3>
            <div id="tramosTitle">
                <h3 class="tT-1 nm tB-1">Dest</h3>
                <h3 class="tT-2 nm tB-2">Enc</h3>
                <h3 class="tT-3 nm tB-3">Total</h3>
            </div>
            <div id="tramosList"></div>
            <div id="tramosFoot"></div>
            <div class="sb">
                <button class="cerrar" onclick="closeModal()">Cerrar</button>
                <button onclick="printTramos()">Imprimir</button>
            </div>
        </div>
    `;
    let tramosList = document.getElementById("tramosList");
    let tramosFoot = document.getElementById("tramosFoot");
    fetch(`php/llegada/getTramosEB.php?viajeCod=${encodeURIComponent(viaje)}`)
    .then(response => response.json())
    .then(data => {
        let destinosFiltro = ["SCZ", "CBBA", "MON"];
        let filtrados = data.filter(e => {
            let partes = e.conEnc.split('-');
            let sufijo = partes.length > 1 ? partes[1].trim().toUpperCase() : "";
            return !destinosFiltro.includes(sufijo);
        });
        tramosData = filtrados;
        if (!Array.isArray(filtrados) || filtrados.length === 0) {
            tramosList.innerHTML = '<p>No hay tramos para este viaje.</p>';
            return;
        }
        let totalSum = 0;
        filtrados.forEach(e => {
            let partes = e.conEnc.split('-');
            let sufijo = partes.length > 1 ? partes[1] : "";
            let numEnc = partes[0];
            if (numEnc.length > 5) numEnc = numEnc.slice(-5);
            let monto = parseFloat(e.total) || 0;
            totalSum += monto;
            tramosList.innerHTML += `
                <div class="tramosRow">
                    <h3 class="tT-1 nm tB-1">${sufijo}</h3>
                    <h3 class="tT-2 nm tB-2">${numEnc}</h3>
                    <h3 class="tT-3 nm tB-3">${monto.toFixed(2)}</h3>
                </div>
            `;
        });
        tramosFoot.innerHTML = `
            <hr>
            <div class="sb">
                <h3 class ="nm">Total:</h3>
                <h3 class ="nm">${totalSum.toFixed(2)} Bs</h3>
            </div>
        `;
    })
    .catch(error => console.error("Error al cargar los Tramos: ", error));
}

function closeModal() {
    let box = document.getElementById("modBox");
    if (box) box.style.display = "none";
}

function printTramos() {
    let printBox = document.getElementById("tramosPrint");
    if (!printBox) {
        showToast("Error: elemento de impresion no encontrado", true);
        return;
    }
    if (!Array.isArray(tramosData) || tramosData.length === 0) {
        showToast("No hay datos para imprimir", true);
        return;
    }
    let listHtml = "";
    let totalSum = 0;
    tramosData.forEach(e => {
        let partes = e.conEnc.split('-');
        let sufijo = partes.length > 1 ? partes[1] : "";
        let numEnc = partes[0];
        if (numEnc.length > 5) numEnc = numEnc.slice(-5);
        let monto = parseFloat(e.total) || 0;
        totalSum += monto;
        listHtml += `
            <div class="tramosRow">
                <h3 class="tT-1 nm tB-1">${sufijo}</h3>
                <h3 class="tT-2 nm tB-2">${numEnc}</h3>
                <h3 class="tT-3 nm tB-3">${monto.toFixed(2)}</h3>
            </div>
        `;
    });
    printBox.innerHTML = `
        <div id="tramosPrintContent">
            <img id="imgPr3" src="img/logXXF.png" alt="">
            <div class="sb">
                <h2>Medios Tramos</h2>
                <h3>${fecha}</h3>
            </div>
            <div id="tramosTitle">
                <h3 class="tT-1 nm tB-1">Dest</h3>
                <h3 class="tT-2 nm tB-2">Enc</h3>
                <h3 class="tT-3 nm tB-3">Total</h3>
            </div>
            <div id="tramosList">${listHtml}</div>
            <hr>
            <div class="sb">
                <h3>Total:</h3>
                <h3>${totalSum.toFixed(2)} Bs</h3>
            </div>
        </div>
    `;
    printBox.classList.add("print-visible");
    window.print();
    printBox.classList.remove("print-visible");
    printBox.innerHTML = "";
}