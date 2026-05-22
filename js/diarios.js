const diaL = localStorage.getItem("dia");
const zonaL = localStorage.getItem("zona");
let totalGlobal = 0;
let porPagar = 0;
let cancelado = 0;

document.addEventListener("DOMContentLoaded", function () {
    diarios();
    document.getElementById("topTitleDia").textContent = "Encomiendas del DIA: " + diaL;
});

function encomiendaGo(){
    localStorage.setItem("viajeL", '-');
    localStorage.setItem("encDest", '-');
    window.location = "encomienda.html";
}
function back(){
    window.location = "menu.html"; 
}
function editar(conEnc, destino){
    localStorage.setItem("encDest", destino);
    localStorage.setItem("encomiendaL", conEnc);
    window.location = "editar.html";
}
function cargarPlacas(selectId, destino, conEnc, viajeCod) {
    fetch(`php/diarios/placaDiaGet.php?fecha=${encodeURIComponent(diaL)}&destino=${encodeURIComponent(destino)}`)
    .then(response => response.json())
    .then(data => {
        let select = document.getElementById(selectId);
        if (viajeCod.trim() !== "-") {
            let aux = viajeCod.split("#");
            select.innerHTML = `<option value=""># ${aux[1]}</option>`;
        } else {
            select.innerHTML = '<option value="">-</option>';
        }
        console.log(data);
        data.forEach(viaje => {
            let opt = document.createElement("option");
            opt.value = viaje.viajeCod.trim();
            opt.setAttribute("data-viajeCod", viaje.viajeCod);
            opt.textContent = viaje.placa.trim() + ` (${viaje.destino})`;
            select.appendChild(opt);
        });

        select.addEventListener("change", function() {
            if (this.value !== "") {
                guardarAutomatico(this.value, conEnc);
            }
        });
    })
    .catch(error => console.error("Error cargando placas:", error));
}


function diarios() {
    fetch(`php/diarios/getDiarios.php?fecha=${encodeURIComponent(diaL)}&depto=${encodeURIComponent(zonaL)}`)
    .then(response => response.json())
    .then(data => {
        let encomiendaBox = document.getElementById("encomiendas");
        encomiendaBox.innerHTML = "";

        let contenedor = document.getElementById("encomiendas");

        if (data.error) {
            encomiendaBox.innerHTML = `<h1>${data.error}</h1>`;
            return;
        }

        if (data.length === 0) {
            encomiendaBox.innerHTML = "<h1>No hay ENTREGAS EN ESTA FECHA.</h1>";
        } else {
            data.forEach((encomienda, index) => {
                
                let divEncomienda = document.createElement("div");
                divEncomienda.classList.add("encomienda-item");

                let selectPlacaId = `placa-${encomienda.conEnc}`;
                let placatxt = `${encomienda.codeViaje}`;
                if (placatxt !== "-") {
                    let parts = placatxt.split("#");
                    if (parts.length > 1) {
                        placatxt = placatxt.split("#")[1];
                    }
                }
                let cobradoPor = "";
                if (encomienda.entregadoPor && encomienda.entregadoPor.trim().length > 0) {
                    cobradoPor = encomienda.entregadoPor;
                } else {
                    cobradoPor = "Cobrado Por";
                }
                let encomiendaHTML = `
                    <div class="inpEnc">
                        <select id="${selectPlacaId}" name="placa">
                            <option value="">Seleccionar placa...</option>
                        </select>
                    </div>

                    <textarea readonly>${encomienda.remitente}</textarea>
                    <textarea readonly>${encomienda.remTelf}</textarea>
                    <textarea readonly>${encomienda.consignatario}</textarea>
                    <textarea readonly>${encomienda.conTelf}</textarea>
                    <textarea readonly>${encomienda.bulto}</textarea>
                    <textarea readonly>${encomienda.contenido}</textarea>
                    <textarea readonly>${encomienda.valDeclarado}</textarea>
                `;

                let estadoPagaClass = encomienda.estadoPaga.trim() == "1" ? "cancelado" : "xp";
                let estadoPagaTexto = encomienda.estadoPaga.trim() == "1" ? "Cancelado" : "Por Pagar";
                if (encomienda.destino.trim() === "Santa Cruz" || encomienda.destino.trim() === "Cochabamba") {
                    console.log("nada");
                } else if (encomienda.destino.trim() === "Montero") {
                    divEncomienda.classList.add("dest-montero");
                } else {
                    divEncomienda.classList.add("dest-yacuiba");
                }


                if (encomienda.estadoPaga.trim() == "1" || encomienda.estadoPaga.trim() == "2") {
                    encomiendaHTML += `
                        <textarea readonly class="${estadoPagaClass}">${estadoPagaTexto}\n${encomienda.conEnc}</textarea>
                    `;
                } else if (encomienda.estadoPaga.trim() == "3") {
                    encomiendaHTML += `
                        <textarea readonly class="${estadoPagaClass}">Canc | PXP\n${encomienda.conEnc}</textarea>
                    `;
                } else {
                    encomiendaHTML += `
                        <textarea readonly class="${estadoPagaClass}">PXP | Canc\n${encomienda.conEnc}</textarea>
                    `;
                }

                if (encomienda.destino.trim() != "Santa Cruz" && encomienda.destino.trim() != "Cochabamba" && encomienda.destino.trim() != "Montero") {
                    encomiendaHTML += `
                        <textarea readonly>${encomienda.total} Bs\nT1:${encomienda.priT} T2:${encomienda.segT}</textarea>    
                    `;
                } else {
                    encomiendaHTML += `<textarea readonly>${encomienda.total} Bs</textarea>`;
                }

                encomiendaHTML += `
                    <button id="impriCS" onclick="imprimir('${encomienda.conEnc}')">Imprimir</button>
                    <button onclick="editar('${encomienda.conEnc}','${encomienda.destino.trim()}')">Editar</button>
                `;

                divEncomienda.innerHTML = encomiendaHTML;
                contenedor.appendChild(divEncomienda);

                cargarPlacas(selectPlacaId, encomienda.destino.trim(), encomienda.conEnc, encomienda.codeViaje);
                
                if (encomienda.destino.trim() == "Santa Cruz" || encomienda.destino.trim() == "Cochabamba" || encomienda.destino.trim() == "Montero") {
                    if (encomienda.estadoPaga == "1") {
                        cancelado += parseFloat(encomienda.total) || 0;
                    } else if (encomienda.estadoPaga == "2") {
                        porPagar += parseFloat(encomienda.total) || 0;                        
                    }
                    totalGlobal += parseFloat(encomienda.total) || 0;
                } else {
                    if (encomienda.estadoPaga == "1") {
                        cancelado += parseFloat(encomienda.priT) || 0;
                        totalGlobal += parseFloat(encomienda.priT) || 0;
                    } else if (encomienda.estadoPaga == "2") {
                        porPagar += parseFloat(encomienda.priT) || 0;
                    } else if (encomienda.estadoPaga == "3") {
                        cancelado += parseFloat(encomienda.priT) || 0;
                        porPagar += parseFloat(encomienda.segT) || 0;
                        totalGlobal += parseFloat(encomienda.priT) || 0;
                    } else if (encomienda.estadoPaga == "4") {                    
                        porPagar += parseFloat(encomienda.priT) || 0;
                        cancelado += parseFloat(encomienda.segT) || 0;
                        totalGlobal += parseFloat(encomienda.segT) || 0;
                    }
                }
            });
            //#//
            document.getElementById("porPagar").textContent = `Por Pagar: ${porPagar.toFixed(2)} Bs`;
            document.getElementById("cancelado").textContent = `Cancelado: ${cancelado.toFixed(2)} Bs`;
            document.getElementById("total").textContent = `Total: ${totalGlobal.toFixed(2)} Bs`;
        }
    })
    .catch(error => console.error("Error obteniendo viajes:", error));
}
async function guardarAutomatico(code, conEncInp) {
    if (code !== "" && code !== "-") {  
        fetch(`php/diarios/getViajeDia.php?code=${encodeURIComponent(code)}&fecha=${encodeURIComponent(diaL)}&depto=${encodeURIComponent(zonaL)}`)
        .then(response => response.json())
        .then(async (data) => {
            if (data.viajeCod) {
                fetch(`php/diarios/guardarEncomienda.php?conEnc=${encodeURIComponent(conEncInp)}&viajeCod=${encodeURIComponent(data.viajeCod)}`)
                .then(response => response.json())
                .then(async (result) => {
                    console.log("Encomienda guardada automáticamente");
                })                
                .catch(error => {
                    console.error("Error en la solicitud:", error);
                });
            }
        })
        .catch(error => {
            console.error("Error al obtener viaje:", error);
        });
    }
}

async function guardar(idInp, conEncInp) {
    let placa = document.getElementById(idInp).value.trim();

    if (placa !== "" && placa !== "-") {  
        fetch(`php/diarios/getViajeDia.php?placa=${encodeURIComponent(placa)}&fecha=${encodeURIComponent(diaL)}&depto=${encodeURIComponent(zonaL)}`)
        .then(response => response.json())
        .then(async (data) => {
            if (data.viajeCod) {
                fetch(`php/diarios/guardarEncomienda.php?conEnc=${encodeURIComponent(conEncInp)}&viajeCod=${encodeURIComponent(data.viajeCod)}`)
                .then(response => response.json())
                .then(async (result) => {
                    console.log("todo chido");
                })                
                .catch(error => {
                    console.error("Error en la solicitud:", error);
                    document.getElementById("msgDia").value = "Error en la conexión.";
                    setTimeout(() => { document.getElementById("msgDia").value = ""; }, 1000);
                });
            } else {
                document.getElementById("msgDia").value = "No se encontró un viaje con esta placa.";
                setTimeout(() => { document.getElementById("msgDia").value = ""; }, 1000);
            }
        })
        .catch(error => {
            console.error("Error al obtener viaje:", error);
            document.getElementById("msgDia").value = "Error en la búsqueda.";
            setTimeout(() => { document.getElementById("msgDia").value = ""; }, 1000);
        });

    } else {
        document.getElementById("msgDia").value = "Ingrese una placa válida.";
        setTimeout(() => { document.getElementById("msgDia").value = ""; }, 1000);
    }
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
            const abrev = data.encomienda.conEnc.split("-")[1];
            fetch(`php/diarios/zonaGet.php?abrev=${abrev}`)
            .then(r => r.json())
            .then(zona => {

                let direccion = zona.informacion;
                let telefonos = zona.telefono;

                let textVD = data.encomienda.valDeclarado == "Si" ? "" : "SIN DINERO NI OBJETOS DE VALOR" ;
                let txtpp = data.encomienda.estadoPaga == "1" ? "Total Pagado" : "Total Por Pagar";
                
                let destino = zona.nombreZona;
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

                document.getElementById("print").innerHTML = `
                    <img id="imgPr" src="img/logXXF.png" alt="">
                    <p>${direccion} Telf: ${telefonos}</p>
                    <h1>${txtpagar}</h1>
                    <div id="impDiv">
                        <h1 id="guia"><strong>GUIA N°:</strong> ${data.encomienda.conEnc}</h1>
                        <div id="dat">
                            <h1><strong>Fecha:</strong> ${data.encomienda.fecha}</h1>
                            <h2><strong>Hora de emision:</strong> ${hora}</h2>
                        </div>
                        <h2>Origen: ${data.encomienda.origen.toUpperCase()}</h2>
                        <h2 class="destinos">Destino: ${destino.toUpperCase()}</h2>
                        <h2><strong>Remitente:</strong> ${data.encomienda.remitente} (${data.encomienda.remTelf.trim()})</h2>
                        <h2><strong>Consignatario:</strong> ${data.encomienda.consignatario} (${data.encomienda.conTelf.trim()})</h2>
                        <h2><strong>Detalle:</strong> ${data.encomienda.bulto}</h2>
                `;
                if (data.encomienda.destino.trim() != "Santa Cruz" && data.encomienda.destino.trim() != "Cochabamba" && data.encomienda.destino.trim() != "Montero") {
                    if (data.encomienda.estadoPaga == "1") {
                        document.getElementById("print").innerHTML += `
                            <h2><strong>1° Tramo:</strong> ${data.encomienda.priT}Bs - Santa Cruz</h2>
                            <h2><strong>2° Tramo:</strong> ${data.encomienda.segT}Bs - ${data.encomienda.destino}</h2>
                        `;
                    } else if (data.encomienda.estadoPaga == "2") {
                        document.getElementById("print").innerHTML += `
                            <h2><strong>1° Tramo:</strong> ${data.encomienda.priT}Bs - Santa Cruz</h2>
                            <h2><strong>2° Tramo:</strong> ${data.encomienda.segT}Bs - ${data.encomienda.destino}</h2>
                        `;
                    } else if (data.encomienda.estadoPaga == "3") {
                        document.getElementById("print").innerHTML += `
                            <h2><strong>1° Tramo:</strong> ${data.encomienda.priT}Bs - Santa Cruz</h2>
                            <h2><strong>2° Tramo:</strong> ${data.encomienda.segT}Bs - ${data.encomienda.destino}</h2>
                        `;
                    } else if (data.encomienda.estadoPaga == "4") {
                        document.getElementById("print").innerHTML += `
                            <h2><strong>1° Tramo:</strong> ${data.encomienda.priT}Bs - Santa Cruz</h2>
                            <h2><strong>2° Tramo:</strong> ${data.encomienda.segT}Bs - ${data.encomienda.destino}</h2>
                        `;
                    }
                }
                document.getElementById("print").innerHTML += `
                        <h1 id="totalPrint"><strong>${txtpp}: </strong>${data.encomienda.total}Bs</h1>
                        <br>
                    </div>
                    <div id="notaF">
                        <P>${textVD}</P>
                        <p>Nota: No Valido para Crédito Fiscal.</p>
                        <p>SI SU ENCOMIENDA ES DE VALOR DECLARELA</p>
                    </div>
                `;
                const imgElement = document.getElementById('imgPr');
                const imgPreload = new Image();
                
                imgPreload.onload = function() {
                    imgElement.src = imgPreload.src;
                    setTimeout(() => {
                        window.print();
                    }, 200);
                };

                imgPreload.onerror = function() {
                    console.warn("No se pudo cargar la imagen, imprimiendo sin ella");
                    setTimeout(() => {
                        window.print();
                    }, 200);
                };

                imgPreload.src = 'img/logXXF.png';
            });
        } else {
            alert("Hubo un problema al obtener los datos.");
        }
    })
    .catch(error => console.error("Error al obtener los datos:", error));
}

function horaAct() {
    let ahora = new Date();
    let horas = ahora.getHours().toString().padStart(2, "0");
    let min = ahora.getMinutes().toString().padStart(2, "0");
    return `${horas}:${min}`;
}