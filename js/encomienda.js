const viajeL = localStorage.getItem("viajeL");
const zona = localStorage.getItem("zona");
const dia = localStorage.getItem("dia");
const encDest = localStorage.getItem("encDest");

document.addEventListener('DOMContentLoaded', function() {
    cargarDestinos();
    document.getElementById('titleViaje').innerText = `N° Viaje: ${viajeL}`;
});

function cargarDestinos() {
    fetch(`php/encomienda/getDestinos.php?filtrar=${encodeURIComponent(zona)}`)
    .then(response => response.json())
    .then(data => {
        const destinoSelect = document.getElementById('dest');
        destinoSelect.innerHTML = '';

        data.forEach(destino => {
            destinoSelect.innerHTML += `
                <option value="${destino.nombreZona}">
                    ${destino.nombreZona} (${destino.abrev})
                </option>
            `;
        });
        if (encDest !== '-') {
            destinoSelect.value = encDest.trim();
            destinoSelect.disabled = true;
        }
        cambiarCampos();
        destinoSelect.addEventListener('change', cambiarCampos);
    })
    .catch(error => console.error("Error:", error));
}

function cambiarCampos() {
    const dest = document.getElementById('dest').value; 
    const estado = document.getElementById('xpp');
    var recio = document.getElementById('recio');
    recio.innerHTML = ``;
    estado.innerHTML = ``;
    if (dest === "Cochabamba" || dest === "Santa Cruz" || dest == "Montero") {
        recio.innerHTML = `
            <input type="number" id="tot" class="precio" maxlength="10" placeholder="TOTAL">
        `;
        
        estado.innerHTML = `
            <label><input type="radio" name="opc" value="XP" checked> Por Pagar</label>
            <label><input type="radio" name="opc" value="P"> Cancelado</label>
        `;
    } else {
        recio.innerHTML = `
            <input type="number" id="prTr" class="precio tramos" maxlength="10" placeholder="1° Tramo">
            <input type="number" id="sgTr" class="precio tramos" maxlength="10" placeholder="2° Tramo">
        `;
        
        estado.innerHTML = `
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
        `;
    }
}

function back() {
    if (viajeL === "-") {
        window.location = "diarios.html";
    } else {
        window.location = "informacion.html";
    }
}

function fin() {    
    var rem = document.getElementById('rem').value.trim();
    var remT = document.getElementById('remT').value.trim();
    var con = document.getElementById('con').value.trim();
    var conT = document.getElementById('conT').value.trim();
    var tot = "";
    var bul = document.getElementById('bul').value.trim();
    var dest = document.getElementById('dest').value.trim();
    const chk = document.getElementById('valorDeclarado');
    console.log("checked:", chk.checked);

    var val = document.getElementById('valorDeclarado').checked ? "Si" : "No";
    var opc = "";
    if (dest === "Cochabamba" || dest === "Santa Cruz" || dest === "Montero") {
        tot = document.getElementById('tot').value.trim();
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

    if (rem === "" || con === "" || bul === "" || val === "" || opc === "") {
        document.getElementById("msgEnc").innerText = "Por favor, complete todos los campos obligatorios (contenido puede estar vacio).";
        return;
    }

    var url = `php/encomienda/encomienda.php?code=${encodeURIComponent(viajeL)}
        &rem=${encodeURIComponent(rem)}
        &remT=${encodeURIComponent(remT)}
        &con=${encodeURIComponent(con)}
        &conT=${encodeURIComponent(conT)}
        &bul=${encodeURIComponent(bul)}
        &dia=${encodeURIComponent(dia)}
        &zona=${encodeURIComponent(zona)}
        &dest=${encodeURIComponent(dest)}
        &val=${encodeURIComponent(val)}
        &opc=${encodeURIComponent(opc)}`;
        
    if (tot !== "") {
        url += `&tot=${encodeURIComponent(tot)}`;
    } else {
        var pri = document.getElementById('prTr').value.trim();
        var seg = document.getElementById('sgTr').value.trim();
        url += `&pri=${encodeURIComponent(pri)}&seg=${encodeURIComponent(seg)}`;
    }

    fetch(url)
    .then(response => response.json())
    .then(data => {
        document.getElementById("msgEnc").innerText = data.error || "Encomienda registrada correctamente.";
    
        if (viajeL === "-") {
            window.location = "diarios.html";
        } else {
            window.location = "informacion.html";
        }
    })
    .catch(error => console.error("Error:", error));
}
