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

document.addEventListener("DOMContentLoaded", function () {destino
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

function goExcel() {
    fetch(`php/llegada/encomiendaLlegada.php?viaje=${encodeURIComponent(viaje)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }
            return response.json();
        })
        .then(data => {
            data.forEach(encomienda => {
                
            }); 
            document.getElementById("auxi").textContent = "Despachador"; //+ espV; 
        })
        .catch(error => console.error("Error obteniendo encomiendas:", error));
}