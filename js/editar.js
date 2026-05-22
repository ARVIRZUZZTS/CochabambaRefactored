const dia = localStorage.getItem("dia");
const code = localStorage.getItem("encomiendaL");
const zona = localStorage.getItem("zona");
const encDest = localStorage.getItem("encDest");
function back(){
    window.location = "diarios.html";
}
document.addEventListener("DOMContentLoaded", function () {
    sety();
    cargarDestinos();
    document.getElementById("titleEncomienda").innerText = `Editar datos de la Encomienda: ${code}`;
});
function sety() {
    fetch(`php/editar/getSoloEnc.php?conEnc=${encodeURIComponent(code)}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let setP = data.estadoPaga == "XP" ? "<label><input type=\"radio\" name=\"opc\" value=\"XP\" checked> Por Pagar</label>\n<label><input type=\"radio\" name=\"opc\" value=\"P\"> Cancelado</label>" : "<label><input type=\"radio\" name=\"opc\" value=\"XP\"> Por Pagar</label>\n<label><input type=\"radio\" name=\"opc\" value=\"P\" checked> Cancelado</label>"
        document.getElementById("rem").placeholder = data.remitente.trim();
        document.getElementById("remT").placeholder = data.remTelf.trim();
        document.getElementById("con").placeholder = data.consignatario.trim();
        document.getElementById("conT").placeholder = data.conTelf.trim();
        document.getElementById("bul").placeholder = data.bulto.trim();
        let boxLab = document.getElementById("boxLab");
        let recio = document.getElementById("recio");
        let checked = data.valDeclarado.trim() === "Si" ? " checked" : "";
        boxLab.innerHTML = `
            <label><input id="valorDeclarado" type="checkbox" name="val" ${checked}> Valor Declarado</label>
        `;
        if (data.estadoPaga.trim() == "1") {
            if (data.destino.trim() == "Cochabamba" || data.destino.trim() == "Santa Cruz" || data.destino.trim() == "Montero") {
                recio.innerHTML = `
                    <input type="number" id="tot" class="precio" maxlength="10" placeholder="${data.total}">
                `;
                boxLab.innerHTML += `
                    <div id="xpp">
                        <label><input type="radio" name="opc" value="XP"> Por Pagar</label>
                        <label><input type="radio" name="opc" value="P" checked> Cancelado</label>
                    </div>
                `;
            } else {
                recio.innerHTML = `
                    <input type="number" id="prTr" class="precio tramos" maxlength="10" placeholder="${data.priT}">
                    <input type="number" id="sgTr" class="precio tramos" maxlength="10" placeholder="${data.segT}">
                `;
                boxLab.innerHTML += `
                    <div id="xpp">
                        <div class="tramoEstado">
                            <h4>1° Tramo</h4>
                            <label><input type="radio" name="t1" value="XP"> Por Pagar</label>
                            <label><input type="radio" name="t1" value="P" checked> Cancelado</label>
                        </div>
                        <div class="tramoEstado">
                            <h4>2° Tramo</h4>
                            <label><input type="radio" name="t2" value="XP"> Por Pagar</label>
                            <label><input type="radio" name="t2" value="P" checked> Cancelado</label>
                        </div>
                    </div>
                `;
            }
        } else if (data.estadoPaga.trim() == "2") {
            if (data.destino.trim() == "Cochabamba" || data.destino.trim() == "Santa Cruz" || data.destino.trim() == "Montero") {
                recio.innerHTML = `
                    <input type="number" id="tot" class="precio" maxlength="10" placeholder="${data.total}">
                `;
                boxLab.innerHTML += `
                    <div id="xpp">
                        <label><input type="radio" name="opc" value="XP" checked> Por Pagar</label>
                        <label><input type="radio" name="opc" value="P"> Cancelado</label>
                    </div>
                `;
            } else {
                recio.innerHTML = `
                    <input type="number" id="prTr" class="precio tramos" maxlength="10" placeholder="${data.priT}">
                    <input type="number" id="sgTr" class="precio tramos" maxlength="10" placeholder="${data.segT}">
                `;
                boxLab.innerHTML += `
                    <div id="xpp">
                        <div class="tramoEstado">
                            <h4>1° Tramo</h4>
                            <label><input type="radio" name="t1" value="XP" checked> Por Pagar</label>
                            <label><input type="radio" name="t1" value="P"> Cancelado</label>
                        </div>
                        <div class="tramoEstado">
                            <h4>2° Tramo</h4>
                            <label><input type="radio" name="t2" value="XP" checked> Por Pagar</label>
                            <label><input type="radio" name="t2" value="P"> Cancelado</label>
                        </div>
                    </div>
                `;
            }
        } else if (data.estadoPaga.trim() == "3") {
            recio.innerHTML = `
                <input type="number" id="prTr" class="precio tramos" maxlength="10" placeholder="${data.priT}">
                <input type="number" id="sgTr" class="precio tramos" maxlength="10" placeholder="${data.segT}">
            `;
            boxLab.innerHTML += `
                <div id="xpp">
                    <div class="tramoEstado">
                        <h4>1° Tramo</h4>
                        <label><input type="radio" name="t1" value="XP"> Por Pagar</label>
                        <label><input type="radio" name="t1" value="P" checked> Cancelado</label>
                    </div>
                    <div class="tramoEstado">
                        <h4>2° Tramo</h4>
                        <label><input type="radio" name="t2" value="XP" checked> Por Pagar</label>
                        <label><input type="radio" name="t2" value="P"> Cancelado</label>
                    </div>
                </div>
            `;
        } else if (data.estadoPaga.trim() == "4") {
            recio.innerHTML = `
                <input type="number" id="prTr" class="precio tramos" maxlength="10" placeholder="${data.priT}">
                <input type="number" id="sgTr" class="precio tramos" maxlength="10" placeholder="${data.segT}">
            `;
            boxLab.innerHTML += `
                <div id="xpp">
                    <div class="tramoEstado">
                        <h4>1° Tramo</h4>
                        <label><input type="radio" name="t1" value="XP" checked> Por Pagar</label>
                        <label><input type="radio" name="t1" value="P"> Cancelado</label>
                    </div>
                    <div class="tramoEstado">
                        <h4>2° Tramo</h4>
                        <label><input type="radio" name="t2" value="XP"> Por Pagar</label>
                        <label><input type="radio" name="t2" value="P" checked> Cancelado</label>
                    </div>
                </div>
            `;
        }
    })
    .catch(error => console.error("Error cargando placas:", error));
}
function cargarDestinos() {
    fetch(`php/encomienda/getDestinos.php?filtrar=${encodeURIComponent(zona)}`)
    .then(response => response.json())
    .then(data => {
        const destinoSelect = document.getElementById('dest');
        destinoSelect.innerHTML = '';
        destinoSelect.disabled = true;
        data.forEach(destino => {
            if (encDest.trim() == destino.nombreZona.trim()) {
                destinoSelect.innerHTML += `
                    <option value="${destino.nombreZona}">
                        ${destino.nombreZona} (${destino.abrev})
                    </option>
                `;
            }
        });
        
    })
    .catch(error => console.error("Error:", error));
}

function actu() {
    fetch(`php/editar/getSoloEnc.php?conEnc=${encodeURIComponent(code)}`)
    .then(response => response.json())
    .then(data => {
        let remitente = document.getElementById("rem").value.trim() != "" ? document.getElementById("rem").value.trim() : data.remitente.trim() ;
        let remTelf = document.getElementById("remT").value.trim() != "" ? document.getElementById("remT").value.trim() : data.remTelf.trim() ;
        let consignatario = document.getElementById("con").value.trim() != "" ? document.getElementById("con").value.trim() : data.consignatario.trim() ;
        let conTelf = document.getElementById("conT").value.trim() != "" ? document.getElementById("conT").value.trim() : data.conTelf.trim() ;
        let bulto = document.getElementById("bul").value.trim() != "" ? document.getElementById("bul").value.trim() : data.bulto.trim() ;
        let valDeclarado = document.getElementById("valorDeclarado").checked ? "Si" : "No";
        let tot = "";
        var opc = "";
        let dest = document.getElementById("dest").value;
        console.log(dest);
        if (dest === "Cochabamba" || dest === "Santa Cruz" || dest === "Montero") {
            tot = document.getElementById('tot').value.trim() != "" ? document.getElementById('tot').value.trim() : data.total;
            var aux = document.querySelector('input[name="opc"]:checked');
            if (aux.value == "XP") {
                opc = "2";
            } else {
                opc = "1";
            }
        } else {
            var t1 = document.querySelector('input[name="t1"]:checked').value;
            var t2 = document.querySelector('input[name="t2"]:checked').value;
            if (t1 == "XP" && t2 == "XP") {
                opc = "2";
            } else if (t1 == "P" && t2 == "P") {
                opc = "1";
            } else if (t1 == "P" && t2 == "XP") {
                opc = "3";
            } else {
                opc = "4";
            }
        }

        let url = `php/editar/editarEnc.php?conEnc=${encodeURIComponent(code)}`

        url += `&rem=${encodeURIComponent(remitente)}`;
        url += `&remT=${encodeURIComponent(remTelf)}`;
        url += `&con=${encodeURIComponent(consignatario)}`;
        url += `&conT=${encodeURIComponent(conTelf)}`;
        url += `&bul=${encodeURIComponent(bulto)}`;

        url += `&valDeclarado=${valDeclarado}&estadoPaga=${opc}`;

        if (tot !== "") {
            url += `&tot=${encodeURIComponent(tot)}`;
        } else {
            var pri = document.getElementById('prTr').value.trim() != "" ? document.getElementById('prTr').value.trim() : data.priT;
            var seg = document.getElementById('sgTr').value.trim() != "" ? document.getElementById('sgTr').value.trim() : data.segT;
            url += `&pri=${encodeURIComponent(pri)}&seg=${encodeURIComponent(seg)}`;
        }

        fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location = "diarios.html";
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(error => console.error("Error al actualizar:", error));
    })
    .catch(error => console.error("Error cargando placas:", error));    
}

function eliminar() {
    if (!confirm("¿Estás seguro de que deseas eliminar esta encomienda?")) {
        return; 
    }

    fetch(`php/editar/eliminarEnc.php?conEnc=${code}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location = "diarios.html";
        } else {
            alert("Error al eliminar: " + data.error);
        }
    })
    .catch(error => console.error("Error al eliminar:", error));
};