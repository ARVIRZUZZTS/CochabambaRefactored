const zona = localStorage.getItem("zona");
const fecha = localStorage.getItem("dia");
const viaje = localStorage.getItem("viajeL");
let propietario = "";
let chofer = "";
let ayudante = "";
let placa = "";
let origen = "";
let destino = "";
let est = "";
let hora = "";
let abrevOrg = "";
let abrevDes = "";

let totalGlobal = 0;
let porPagar = 0;
let cancelado = 0;

let tramo1C = 0;
let tramo1PP = 0;
let tramo2C = 0;
let tramo2PP = 0;

let espV = 0;
function back() {
    window.location = "menu.html";
}

function crear() {
    localStorage.setItem("encDest", destino);
    window.location = "encomienda.html";
}
function edit() {
    window.location.href = `editarNomina.html`;
}

document.addEventListener("DOMContentLoaded", function () {destino
    cargarDatos();
    setH();
});
function cargarDatos() {
    fetch(`php/informacion/viajeAll.php?viaje=${encodeURIComponent(viaje)}`)
        .then(response => response.json())
        .then(data => {
            const viajeData = data.viaje; 
            console.log(viajeData);
            propietario = viajeData.propietario.trim();
            chofer = viajeData.chofer.trim();
            ayudante = viajeData.ayudante.trim();
            placa = viajeData.placa.trim();
            origen = viajeData.origen.trim();
            destino = viajeData.destino.trim();
            est = viajeData.estadoImp.trim();
            hora = viajeData.hora.trim();
            
            fetch(`php/informacion/abreviaciones.php?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`)
                .then(response => response.json())
                .then(abrevData => {
                    abrevOrg = abrevData.abrevOrigen;
                    abrevDes = abrevData.abrevDestino;
                    document.getElementById("viTk").textContent = `Viaje: ${abrevOrg} a ${destino}`;
                    
                }).catch(error => {
                    console.error("Error al cargar abreviaciones:", error);
                });

            obtenerEncomiendas();
            
            document.getElementById("infoH1").textContent = `Informacion del Viaje: ${viaje}`;
            document.getElementById("prTit").textContent = `Propietario: ${propietario}`;
            document.getElementById("chTit").textContent = `Chofer: ${chofer}`;
            document.getElementById("ayTit").textContent = `Ayudante: ${ayudante}`;
            document.getElementById("plTit").textContent = `Placa: ${placa}`;
            document.getElementById("orTit").textContent = `Origen: ${origen}`;
            document.getElementById("deTit").textContent = `Destino: ${destino}`;
            document.getElementById("feTit").textContent = `Fecha: ${fecha}`;
            document.getElementById("hrTit").textContent = `Hora: ${hora}`;
            document.getElementById("prTk").textContent = `Propietario: ${propietario}`;
            document.getElementById("chTk").textContent = `Chofer: ${chofer}`;
            document.getElementById("ayTk").textContent = `Ayudante: ${ayudante}`;
            document.getElementById("cdTk").textContent = `Código: ${viaje}`;
            document.getElementById("fcTk").textContent = `Fecha de creación: ${fecha}`;
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
        <h2>Remitente</h2>
        <h2>Telfono R</h2>
        <h2>Consignatario</h2>
        <h2>Telfono C</h2>
        <h2>Detalle</h2>
        <h2>VD</h2>
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
    if (destino == "Santa Cruz" || destino == "Cochabamba" || destino == "Montero") {
        titulos.innerHTML += `
            <h2>Total</h2>
            <h2>Imprimir</h2>
        `;
        titulosTicket.innerHTML += `
            <h2 id="fe">Fecha</h2>
            <h2 class="pago">C</h2>
            <h2 class="pago">PxP</h2>
            <h2 id="fir">Firma</h2>
        `;
    } else {
        titulos.innerHTML += `
            <h2>Total<br>T1 | T2</h2>
            <h2>Imprimir</h2>
        `;
        titulosTicket.innerHTML += `
            <h2 id="fe">Fecha</h2>       
            <h2 class="pago">C</h2>
            <h2 class="pago">PXP</h2>
            <h2 id="fir">Firma</h2>
        `;
    }
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
    fetch(`php/informacion/infoEnco.php?viaje=${encodeURIComponent(viaje)}`)
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
            console.log(abrevOrg, abrevDes);
            
            contenedor.innerHTML = "";
            listEnco.innerHTML = "";
            let viajeEnco = `Viaje de ${abrevOrg} a ${abrevDes}`;
            res.innerHTML = `
                <img id="imgPr3" src="img/logXXF.png" alt="">
                <h3 id="titu">LIQ. ENCOMIENDAS</h3>
                <h3>${viajeEnco}</h3>
                <h3>Propietario: ${propietario}</h3>
                <h3>Placa: ${placa}</h3>    
                <div id="fechHR">
                    <h3>Fecha: ${fecha}</h3>
                    <h3>Hora: ${horaAct()}</h3>
                </div>
                <div id="titRes">
                    <h3>N°</h3>
                    <h3>Paga</h3>
                    <h3>Total</h3>
                </div>
                <div id="listR"></div>                
            `;

            if (!Array.isArray(data) || data.length === 0) {
                contenedor.innerHTML = '<p id="noEnc">No hay encomiendas para este viaje.</p>';
                listEnco.innerHTML = '<p id="noEnc">No hay encomiendas para este viaje.</p>';
                return;
            }
            let cont = 0;

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
                    <textarea readonly>${encomienda.remitente}</textarea>
                    <textarea readonly>${encomienda.remTelf}</textarea>
                    <textarea readonly>${encomienda.consignatario}</textarea>
                    <textarea readonly>${encomienda.conTelf}</textarea>
                    <textarea readonly>${encomienda.bulto}</textarea>
                    <textarea readonly>${encomienda.contenido}</textarea>
                    <textarea readonly>${encomienda.valDeclarado}</textarea>
                `;

                let estadoPagaClass = "";
                let estadoPagaTexto = "";
                
                if (encomienda.destino.trim() == "Santa Cruz" || encomienda.destino.trim() == "Cochabamba" || encomienda.destino.trim() == "Montero") {

                    if (encomienda.estadoPaga.trim() == "1") {
                        estadoPagaTexto = "Cancelado";
                        estadoPagaClass = "";
                        listRes.innerHTML = `
                            <h4>${maxConEnc}</h4>
                            <h4>C</h4>
                            <h4>${encomienda.total}</h4>
                        `;
                    } else {
                        estadoPagaTexto = "Por Pagar";
                        estadoPagaClass = " class=\"xp\"";
                        listRes.innerHTML = `
                            <h4>${maxConEnc}</h4>
                            <h4>PxP</h4>
                            <h4>${encomienda.total}</h4>
                        `;
                    }

                    encomiendaHTML += `
                        <textarea ${estadoPagaClass} readonly>${estadoPagaTexto}</textarea>
                        <textarea readonly>${encomienda.total} Bs</textarea>
                    `;
                } else {
                    if (encomienda.estadoPaga.trim() == "1") {
                        estadoPagaClass = "";
                        encomiendaHTML += `
                            <textarea ${estadoPagaClass} readonly>Cancelado</textarea>
                            <textarea readonly>${encomienda.total} Bs\nT1:${encomienda.priT} | T2:${encomienda.segT}</textarea>
                        `;
                        listRes.innerHTML = `
                            <h4>${maxConEnc}</h4>
                            <h4>C</h4>
                            <h4>${encomienda.priT}</h4>
                        `;
                    } else {
                        estadoPagaClass = " class=\"xp\"";
                        if (encomienda.estadoPaga.trim() == "2") {
                            encomiendaHTML += `
                                <textarea ${estadoPagaClass} readonly>Por Pagar</textarea>
                                <textarea readonly>${encomienda.total} Bs\nT1:${encomienda.priT} | T2:${encomienda.segT}</textarea>
                            `;
                            listRes.innerHTML = `
                                <h4>${maxConEnc}</h4>
                                <h4>PxP</h4>
                                <h4>${encomienda.priT}</h4>
                            `;
                        } else if (encomienda.estadoPaga.trim() == "3") {
                            encomiendaHTML += `
                                <textarea ${estadoPagaClass} readonly>Canc | PXP</textarea>
                                <textarea readonly>${encomienda.total} Bs\nT1:${encomienda.priT} | T2:${encomienda.segT}</textarea>
                            `;
                            listRes.innerHTML = `
                                <h4>${maxConEnc}</h4>
                                <h4>C-PxP</h4>
                                <h4>${encomienda.priT}</h4>
                            `;
                        } else if (encomienda.estadoPaga.trim() == "4") {
                            encomiendaHTML += `
                                <textarea ${estadoPagaClass} readonly>PXP | Canc</textarea>
                                <textarea readonly>${encomienda.total} Bs\nT1:${encomienda.priT} | T2:${encomienda.segT}</textarea>
                            `;
                            listRes.innerHTML = `
                                <h4>${maxConEnc}</h4>
                                <h4>PxP-C</h4>
                                <h4>${encomienda.priT}</h4>
                            `;
                        }
                    }
                }

                encomiendaHTML += `                    
                    <button onclick="imprimir('${encomienda.conEnc}')">Imprimir</button>
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
                if (destino == "Santa Cruz" || destino == "Cochabamba" || destino == "Montero") {
                    let pagoC = "";
                    let pagoPP = "";
                    if (encomienda.destino == "Santa Cruz" || encomienda.destino == "Cochabamba" || encomienda.destino == "Montero") {
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
                    } else {
                        let t1c = "";
                        let t1pp = "";
                        let t2c = "";
                        let t2pp = "";
                        if (encomienda.estadoPaga == "1") {
                            t1c = encomienda.priT;
                            t1pp = "0";
                            t2c = encomienda.segT;
                            t2pp = "0";
                            tramo1C += parseFloat(encomienda.priT) || 0;
                            cancelado += parseFloat(encomienda.priT) || 0;
                            tramo2C += parseFloat(encomienda.segT) || 0;
                            totalGlobal += parseFloat(encomienda.priT) || 0;
                        } else if (encomienda.estadoPaga == "2") {
                            t1c = "0";
                            t1pp = encomienda.priT;
                            t2c = "0";
                            t2pp = encomienda.segT;
                            tramo1PP += parseFloat(encomienda.priT) || 0;
                            tramo2PP += parseFloat(encomienda.segT) || 0;
                        } else if (encomienda.estadoPaga == "3") {
                            t1c = encomienda.priT;
                            t1pp = "0";
                            t2c = "0";
                            t2pp = encomienda.segT;
                            tramo1C += parseFloat(encomienda.priT) || 0;
                            cancelado += parseFloat(encomienda.priT) || 0;
                            totalGlobal += parseFloat(encomienda.priT) || 0;
                            tramo2PP += parseFloat(encomienda.segT) || 0;
                        } else if (encomienda.estadoPaga == "4") {
                            t1c = "0";
                            t1pp = encomienda.priT;
                            t2c = encomienda.segT;
                            t2pp = "0";
                            tramo1PP += parseFloat(encomienda.priT) || 0;
                            tramo2C += parseFloat(encomienda.segT) || 0;
                        }
                        listImp.innerHTML += `
                            <h3 class="fe"></h3>  
                            <h3 class="pago">${t1c}</h3>
                            <h3 class="pago">${t1pp}</h3>                        
                            <h3 class="fir"></h3>
                        `;
                    }
                } else {
                    let t1c = "";
                    let t1pp = "";
                    let t2c = "";
                    let t2pp = "";
                    if (encomienda.estadoPaga == "1") {
                        t1c = encomienda.priT;
                        t1pp = "0";
                        t2c = encomienda.segT;
                        t2pp = "0";
                        tramo1C += parseFloat(encomienda.priT) || 0;
                        tramo2C += parseFloat(encomienda.segT) || 0;
                        totalGlobal += parseFloat(encomienda.total) || 0;
                    } else if (encomienda.estadoPaga == "2") {
                        t1c = "0";
                        t1pp = encomienda.priT;
                        t2c = "0";
                        t2pp = encomienda.segT;
                        tramo1PP += parseFloat(encomienda.priT) || 0;
                        tramo2PP += parseFloat(encomienda.segT) || 0;
                    } else if (encomienda.estadoPaga == "3") {
                        t1c = encomienda.priT;
                        t1pp = "0";
                        t2c = "0";
                        t2pp = encomienda.segT;
                        tramo1C += parseFloat(encomienda.priT) || 0;
                        tramo2PP += parseFloat(encomienda.segT) || 0;
                        totalGlobal += parseFloat(encomienda.total) || 0;
                    } else if (encomienda.estadoPaga == "4") {
                        t1c = "0";
                        t1pp = encomienda.priT;
                        t2c = encomienda.segT;
                        t2pp = "0";
                        tramo1PP += parseFloat(encomienda.priT) || 0;
                        tramo2C += parseFloat(encomienda.segT) || 0;
                    }
                    listImp.innerHTML += `
                        <h3 class="fe"></h3>  
                        <h3 class="pago">${t1c}</h3>
                        <h3 class="pago">${t1pp}</h3>                        
                        <h3 class="fir"></h3>
                    `;
                }

                document.getElementById("listR").appendChild(listRes);
                contenedor.appendChild(divEncomienda);
                listEnco.appendChild(listImp);
                
            }); 
            if (destino.trim() == "Santa Cruz" || destino.trim() == "Cochabamba" || destino.trim() == "Montero") {
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
                    <h3 class="pag" id="canceladoR">Cancelado: ${cancelado.toFixed(2)} Bs</h3>
                    <h3 class="pag" id="totalR">Total: ${totalGlobal.toFixed(2)} Bs</h3>
                `;
            } else {
                pagosBox.innerHTML = `
                    <h2 id="t1ppTk">TR 1 POR PAGAR:${tramo1PP.toFixed(2)}Bs</h2>
                    <h2 id="t1cTk">TR 1 CANCELADO:${tramo1C.toFixed(2)}Bs</h2>
                    <h2 id="totalPrint">Total:${(tramo1C + tramo1PP).toFixed(2)}Bs</h2>
                `;
                pagosFoo.innerHTML = `
                    <h2 id="t1pp">TR 1 POR PAGAR:${tramo1PP.toFixed(2)}Bs</h2>
                    <h2 id="t1c">TR 1 CANCELADO:${tramo1C.toFixed(2)}Bs</h2>
                    <h2 id="total">Total:${(tramo1C + tramo1PP).toFixed(2)}Bs</h2>
                `;
                res.innerHTML += `
                    <h3 id="t1Res">TRAMO 1</h3>
                    <h3>Por Pagar: ${tramo1PP.toFixed(2)}Bs</h3>
                    <h3>Cancelado: ${tramo1C.toFixed(2)}</h3>
                    <h3 id="totalRes">Total:${(tramo1C + tramo1PP).toFixed(2)}Bs</h3>
                `;
            }
            res.innerHTML += `                
                <div id="spaceRes"></div>
                <hr>
            `;        
            document.getElementById("auxi").textContent = "Despachador"; //+ espV; 
        })
        .catch(error => console.error("Error obteniendo encomiendas:", error));
}

function imprimir(conEnc) {
    fetch(`php/diarios/getEncDiaPrint.php?conEnc=${conEnc}`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al obtener los datos de la encomienda");
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.encomienda) {
            const abrev = data.encomienda.conEnc.split('-')[1];
            fetch(`php/diarios/zonaGet.php?abrev=${abrev}`)
            .then(r => r.json())
            .then(zona => {
                let direccion = zona.informacion;
                let telefonos = zona.telefono;

                let textVD = data.encomienda.valDeclarado == "Si" ? "" : " SIN DINERO NI OBJETOS DE VALOR";
                let txtpp = data.encomienda.estadoPaga == "1" ? "Total Pagado" : "Total Por Pagar";

                let destinoAux = zona.nombreZona;
                let hora = horaAct();
                let txtpagar = "";

                if (data.encomienda.destino.trim() == "Santa Cruz" && data.encomienda.destino.trim() == "Cochabamba" && data.encomienda.destino.trim() == "Montero") {
                    if (data.encomienda.estadoPaga == "1") {
                        txtpagar = "GUIA PAGADA EN ORIGEN";
                    } else {
                        txtpagar = "GUIA PxP EN DESTINO";
                    }
                } else {
                    if (data.encomienda.estadoPaga == "1") {
                        txtpagar = "GUIA PAGADA EN ORIGEN";
                    } else if (data.encomienda.estadoPaga == "2") {
                        txtpagar = "GUIA PxP EN DESTINO";
                    } else {
                        txtpagar = "";
                    }
                }

                document.getElementById("boletin").innerHTML = `
                    <img id="imgPr2" src="img/logXXF.png" alt="">
                    <p>${direccion} Telf: ${telefonos}</p>
                    <h1>${txtpagar}</h1>
                    <div id="impDiv2">
                        <h1 id="guia"><strong>Guia N°:</strong> ${data.encomienda.conEnc}</h1>
                        <div id="dat2">
                            <h1><strong>Fecha:</strong> ${data.encomienda.fecha}</h1>
                            <h2><strong>Hora Emision:</strong>${hora}</h2>
                        </div>
                        <h2>Origen: ${data.encomienda.origen.toUpperCase()}</h2>
                        <h2 class="destinos">Destino: ${destinoAux.toUpperCase()}</h2>
                        <h2><strong>Remitente:</strong> ${data.encomienda.remitente} (${data.encomienda.remTelf})</h2>
                        <h2><strong>Consignatario:</strong> ${data.encomienda.consignatario} (${data.encomienda.conTelf})</h2>
                        <h2><strong>Detalle:</strong> ${data.encomienda.bulto}</h2>
                `;
                
                if (data.encomienda.destino.trim() != "Santa Cruz" && data.encomienda.destino.trim() != "Cochabamba" && data.encomienda.destino.trim() != "Montero") {
                    if (data.encomienda.estadoPaga == "1") {
                        document.getElementById("boletin").innerHTML += `
                            <h2><strong>1° Tramo:</strong> ${data.encomienda.priT}Bs - Santa Cruz</h2>
                            <h2><strong>2° Tramo:</strong> ${data.encomienda.segT}Bs - ${data.encomienda.destino}</h2>
                        `;
                    } else if (data.encomienda.estadoPaga == "2") {
                        document.getElementById("boletin").innerHTML += `
                            <h2><strong>1° Tramo:</strong> ${data.encomienda.priT}Bs - Santa Cruz</h2>
                            <h2><strong>2° Tramo:</strong> ${data.encomienda.segT}Bs - ${data.encomienda.destino}</h2>
                        `;
                    } else if (data.encomienda.estadoPaga == "3") {
                        document.getElementById("boletin").innerHTML += `
                            <h2><strong>1° Tramo:</strong> ${data.encomienda.priT}Bs - Santa Cruz</h2>
                            <h2><strong>2° Tramo:</strong> ${data.encomienda.segT}Bs - ${data.encomienda.destino}</h2>
                        `;
                    } else if (data.encomienda.estadoPaga == "4") {
                        document.getElementById("boletin").innerHTML += `
                            <h2><strong>1° Tramo:</strong> ${data.encomienda.priT}Bs - Santa Cruz</h2>
                            <h2><strong>2° Tramo:</strong> ${data.encomienda.segT}Bs - ${data.encomienda.destino}</h2>
                        `;
                    }
                }
                document.getElementById("boletin").innerHTML += `
                        <h1 id="totalPrint"><strong>${txtpp}: </strong> ${data.encomienda.total}Bs</h1>
                        <br>
                    </div>
                    <div id="notaF">
                        <P>${textVD}</P>
                        <p>SI SU ENCOMIENDA ES DE VALOR DECLARELA</p>
                        <p>Nota: No Valido para Crédito Fiscal.</p>
                    </div>
                `;
                const imgElement = document.getElementById('imgPr2');
                const imgPreload = new Image();

                imgPreload.onload = function () {
                    imgElement.src = imgPreload.src;

                    document.getElementById('boletin').classList.add('print-visible');
                    window.print();
                    document.getElementById('boletin').classList.remove('print-visible');
                }
                imgPreload.onerror = function () {
                    console.warn("No se pudo cargar la imagen, imprimiendo sin ella");
                    window.print();
                }
                imgPreload.src = 'img/logXXF.png';

            })
        } else {
            alert("Hubo un problema al obtener los datos de la encomienda para imprimir.");
        }
    })
    .catch(error => console.error("Error obteniendo encomienda para imprimir:", error));      
}

function printDiv(aux) {
    document.getElementById('ticket').classList.add('print-visible');
    document.getElementById('boletin').classList.remove('print-visible');
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
    document.getElementById('boletin').classList.remove('print-visible');
    print();
    document.getElementById('resumen').classList.remove('print-visible');
}
function horaAct() {
    let ahora = new Date();
    let horas = ahora.getHours().toString().padStart(2, "0");
    let min = ahora.getMinutes().toString().padStart(2, "0");
    return `${horas}:${min}`;
}
function eliminar() {
    if (!confirm("¿Estás seguro de que deseas eliminar este Viaje?")) {
        return; 
    }
    
    fetch(`php/informacion/viajeDel.php?viajeCod=${encodeURIComponent(viaje)}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("viajeL", "-");
            window.location = "menu.html";
        } else {
            alert("Error al eliminar: " + data.error);
        }
    })
    .catch(error => console.error("Error al eliminar:", error));
}