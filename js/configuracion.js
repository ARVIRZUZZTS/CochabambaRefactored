const zonaL = localStorage.getItem("zona");

document.addEventListener("DOMContentLoaded", function() {
    usuarios();
});
function usuarios() {
    fetch(`php/configuracion/usuarios.php?filtrar=${zonaL}`)
    .then(res => res.json())
    .then(data => {

        if (!data.success) return;

        document.getElementById('titulo').innerHTML = `
            <h2 id="idUs">ID</h2>
            <h2 id="usUS">USUARIO</h2>
            <h2 id="zoUS">ZONA</h2>
            <h2 id="edUS">EDITAR</h2>
        `;

        const contenedor = document.getElementById('data');
        contenedor.innerHTML = "";
        document.getElementById('butDina').innerHTML = `
            <button id="newUsBut" onclick="nuevoUsuario()">Nuevo usuario</button>
        `;

        data.usuarios.forEach(u => {
            contenedor.innerHTML += `
                <div class="fila" data-id="${u.usCod}">
                    <h2 class="idUs">${u.usCod}</h2>
                    <h2 class="usUs">${u.user}</h2>
                    <h2 class="zoUs">${u.zona}</h2>
                    <button onclick="editarUsuario(this)">Editar</button>
                </div>
            `;
        });
    });
}

function flotas() {
    fetch(`php/configuracion/flotas.php`)
    .then(res => res.json())
    .then(data => {

        if (!data.success) return;

        document.getElementById('titulo').innerHTML = `
            <h2 id="plFl">PLACA</h2>
            <h2 id="prFl">PROPIETARIO</h2>
            <h2 id="chFl">CHOFER</h2>
            <h2 id="liFl">LICENCIA</h2>
            <h2 id="edFl">EDITAR</h2>
        `;

        const contenedor = document.getElementById('data');
        contenedor.innerHTML = "";

        document.getElementById('butDina').innerHTML = `
            <button id="newFlBut" onclick="nuevaFlota()">Nueva flota</button>
        `;

        data.flotas.forEach(f => {
            contenedor.innerHTML += `
                <div class="fila" data-id="${f.placa}">
                    <h2 class="plFl">${f.placa}</h2>
                    <h2 class="prFl">${f.propietario}</h2>
                    <h2 class="chFl">${f.chofer}</h2>
                    <h2 class="liFl">${f.licencia}</h2>
                    <button onclick="editarFlota(this)">Editar</button>
                </div>
            `;
        });
    });
}

function zonas() {
    fetch(`php/configuracion/zonas.php`)
    .then(res => res.json())
    .then(data => {

        if (!data.success) return;

        document.getElementById('titulo').innerHTML = `
            <h2 id="noZo">ZONA</h2>
            <h2 id="abZo">ABREV</h2>
            <h2 id="inZo">INFORMACION</h2>
            <h2 id="teZo">TELEFONO</h2>
            <h2 id="edZo">EDITAR</h2>
        `;

        const contenedor = document.getElementById('data');
        contenedor.innerHTML = "";

        document.getElementById('butDina').innerHTML = `
            <button id="newZoBut" onclick="nuevaZona()">Nueva zona</button>
        `;

        data.zonas.forEach(z => {
            contenedor.innerHTML += `
                <div class="fila" data-id="${z.nombreZona}">
                    <h2 class="noZo">${z.nombreZona}</h2>
                    <h2 class="abZo">${z.abrev}</h2>
                    <h2 class="inZo">${z.informacion}</h2>
                    <h2 class="teZo">${z.telefono}</h2>
                    <button onclick="editarZona(this)">Editar</button>
                </div>
            `;
        });
    });
}

function nuevoUsuario() {
    const contenedor = document.getElementById("data");

    const fila = document.createElement("div");
    fila.className = "fila nueva";

    fila.innerHTML = `
        <input class="usUs" placeholder="Usuario"  maxlength="20">
        <input type="password" class="pass" placeholder="Contraseña"  maxlength="300">
        <select class="zoUs" id="destInp"></select>
        <button onclick="guardarNuevoUsuario(this)">Guardar</button>
        <button onclick="cancelarNuevo(this)">Cancelar</button>
    `;

    contenedor.appendChild(fila);
    document.getElementById("newUsBut").disabled = true;

    cargarZonas(null);
}

function cancelarNuevo(btn) {
    btn.closest(".fila").remove();
    document.getElementById("newUsBut").disabled = false;
}

function guardarNuevoUsuario(btn) {
    const fila = btn.closest(".fila");

    const user = fila.querySelector(".usUs").value.trim();
    const pass = fila.querySelector(".pass").value.trim();
    const zona = fila.querySelector(".zoUs").value;

    if (!user || !pass || !zona) {
        alert("Completa todos los campos");
        return;
    }

    fetch(`php/configuracion/newUsuario.php?userR=${encodeURIComponent(user)}&passR=${encodeURIComponent(pass)}&opcion=${encodeURIComponent(zona)}`)
    .then(res => res.json())
    .then(data => {
        if (data.status !== "success") {
            alert(data.message);
            return;
        }
        usuarios();
    });
}


function editarUsuario(btn) {
    const fila = btn.closest(".fila");
    fila.dataset.original = fila.innerHTML;

    const usuario = fila.querySelector(".usUs").textContent;
    const zonaActual = fila.querySelector(".zoUs").textContent;

    fila.innerHTML = `
        <h3 class="idUs">${fila.dataset.id}</h3>
        <input class="usUs" value="${usuario}"  maxlength="20">
        <h3 class="zoUs">${zonaActual}</h3>
        <button onclick="guardarUsuario(this)">Guardar</button>
        <button onclick="eliminarUsuario(this)">Eliminar</button>
        <button onclick="cancelarEdicion(this)">Cancelar</button>
    `;
}

function cancelarEdicion(btn) {
    const fila = btn.closest(".fila");
    fila.innerHTML = fila.dataset.original;
}

function guardarUsuario(btn) {
    const fila = btn.closest(".fila");
    console.log(fila);
    const id = fila.dataset.id;
    const usuario = fila.querySelector(".usUs").value.trim();

    if (!usuario) {
        alert("Completa todos los campos");
        return;
    }

    fetch(`php/configuracion/editUser.php?id=${id}&user=${encodeURIComponent(usuario)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
            return;
        }
        usuarios();
    });
}

function editarFlota(btn) {
    const fila = btn.closest(".fila");
    fila.dataset.original = fila.innerHTML;

    const placa = fila.querySelector(".plFl").textContent;
    const propietario = fila.querySelector(".prFl").textContent;
    const chofer = fila.querySelector(".chFl").textContent;
    const licencia = fila.querySelector(".liFl").textContent;

    fila.innerHTML = `
        <input class="plFl" value="${placa}" disabled>
        <input class="prFl" value="${propietario}"  maxlength="100">
        <input class="chFl" value="${chofer}"  maxlength="100">
        <input class="liFl" value="${licencia}"  maxlength="10">
        <button onclick="guardarFlota(this)">Guardar</button>
        <button onclick="eliminarFlota(this)">Eliminar</button>
        <button onclick="cancelarEdicion(this)">Cancelar</button>
    `;

    document.getElementById("newFlBut").disabled = true;
}
function guardarFlota(btn) {
    const fila = btn.closest(".fila");

    const placa = fila.querySelector(".plFl").value.trim();
    const propietario = fila.querySelector(".prFl").value.trim();
    const chofer = fila.querySelector(".chFl").value.trim();
    const licencia = fila.querySelector(".liFl").value.trim();

    if (!propietario || !chofer || !licencia) {
        alert("Completa todos los campos");
        return;
    }

    fetch(`php/configuracion/editFlota.php?placa=${encodeURIComponent(placa)}&propietario=${encodeURIComponent(propietario)}&chofer=${encodeURIComponent(chofer)}&licencia=${encodeURIComponent(licencia)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
            return;
        }
        flotas();
    });
}
function guardarNuevaFlota(btn) {
    const fila = btn.closest(".fila");

    const placa = fila.querySelector(".plFl").value.trim();
    const propietario = fila.querySelector(".prFl").value.trim();
    const chofer = fila.querySelector(".chFl").value.trim();
    const licencia = fila.querySelector(".liFl").value.trim();

    if (!placa || !propietario || !chofer || !licencia) {
        alert("Completa todos los campos");
        return;
    }

    fetch(`php/configuracion/newFlota.php?placa=${encodeURIComponent(placa)}&propietario=${encodeURIComponent(propietario)}&chofer=${encodeURIComponent(chofer)}&licencia=${encodeURIComponent(licencia)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
            return;
        }
        flotas();
    });
}

function eliminarFlota(btn) {
    const fila = btn.closest(".fila");
    const placa = fila.dataset.id;

    if (!confirm("¿Seguro que deseas eliminar esta flota?")) return;

    fetch(`php/configuracion/delFlota.php?placa=${encodeURIComponent(placa)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
            return;
        }
        flotas();
    });
}

function eliminarUsuario(btn) {
    const fila = btn.closest(".fila");
    const id = fila.dataset.id;

    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    fetch(`php/configuracion/delUser.php?id=${id}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
            return;
        }
        usuarios();
    });
}

function cancelarEdicion(btn) {
    const fila = btn.closest(".fila");
    fila.innerHTML = fila.dataset.original;

    const newFl = document.getElementById("newFlBut");
    if (newFl) newFl.disabled = false;

    const newZo = document.getElementById("newZoBut");
    if (newZo) newZo.disabled = false;
}
function nuevaFlota() {
    const contenedor = document.getElementById("data");

    const fila = document.createElement("div");
    fila.className = "fila nueva";

    fila.innerHTML = `
        <input class="plFl" placeholder="Placa"  maxlength="10">
        <input class="prFl" placeholder="Propietario"  maxlength="100">
        <input class="chFl" placeholder="Chofer"  maxlength="100">
        <input class="liFl" placeholder="Licencia"  maxlength="10">
        <button onclick="guardarNuevaFlota(this)">Guardar</button>
        <button onclick="cancelarNuevo(this)">Cancelar</button>
    `;

    document.getElementById("newFlBut").disabled = true;
    contenedor.appendChild(fila);
}
function cancelarNuevo(btn) {
    btn.closest(".fila").remove();

    const newFl = document.getElementById("newFlBut");
    if (newFl) newFl.disabled = false;

    const newZo = document.getElementById("newZoBut");
    if (newZo) newZo.disabled = false;
}
function editarZona(btn) {
    const fila = btn.closest(".fila");
    fila.dataset.original = fila.innerHTML;

    const nombre = fila.querySelector(".noZo").textContent;
    const abrev = fila.querySelector(".abZo").textContent;
    const info = fila.querySelector(".inZo").textContent;
    const tel = fila.querySelector(".teZo").textContent;

    fila.innerHTML = `
        <input class="noZo" value="${nombre}" disabled>
        <input class="abZo" value="${abrev}" disabled>
        <textarea class="inZo">${info}</textarea>
        <input class="teZo" value="${tel}">
        <button onclick="guardarZona(this)">Guardar</button>
        <button onclick="eliminarZona(this)">Eliminar</button>
        <button onclick="cancelarEdicion(this)">Cancelar</button>
    `;

    document.getElementById("newZoBut").disabled = true;
}
function guardarZona(btn) {
    const fila = btn.closest(".fila");

    const nombre = fila.querySelector(".noZo").value.trim();
    const info = fila.querySelector(".inZo").value.trim();
    const tel = fila.querySelector(".teZo").value.trim();

    if (!info || !tel) {
        alert("Completa todos los campos");
        return;
    }

    fetch(`php/configuracion/editZona.php?zona=${encodeURIComponent(nombre)}&info=${encodeURIComponent(info)}&telefono=${encodeURIComponent(tel)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
            return;
        }
        zonas();
    });
}

function nuevaZona() {
    const contenedor = document.getElementById("data");

    const fila = document.createElement("div");
    fila.className = "fila nueva";

    fila.innerHTML = `
        <input class="noZo" placeholder="Nombre zona" maxlength="50">
        <input class="abZo" placeholder="Abreviación" maxlength="3">
        <textarea class="inZo" placeholder="Información"></textarea>
        <input type="number" class="teZo" placeholder="Teléfono">
        <button onclick="guardarNuevaZona(this)">Guardar</button>
        <button onclick="cancelarNuevo(this)">Cancelar</button>
    `;

    document.getElementById("newZoBut").disabled = true;
    contenedor.appendChild(fila);
}
function guardarNuevaZona(btn) {
    const fila = btn.closest(".fila");

    const nombre = fila.querySelector(".noZo").value.trim();
    const abrev = fila.querySelector(".abZo").value.trim();
    const info = fila.querySelector(".inZo").value.trim();
    const tel = fila.querySelector(".teZo").value.trim();

    if (!nombre || !abrev || !info || !tel) {
        alert("Completa todos los campos");
        return;
    }

    fetch(`php/configuracion/newZona.php?zona=${encodeURIComponent(nombre)}&abrev=${encodeURIComponent(abrev)}&info=${encodeURIComponent(info)}&telefono=${encodeURIComponent(tel)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
            return;
        }
        zonas();
    });
}
function eliminarZona(btn) {
    const fila = btn.closest(".fila");
    const zona = fila.dataset.id;

    if (!confirm("¿Seguro que deseas eliminar esta zona?")) return;

    fetch(`php/configuracion/delZona.php?zona=${encodeURIComponent(zona)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
            return;
        }
        zonas();
    });
}

function cargarZonas(zonaSeleccionada) {
    fetch(`php/configuracion/zonasS.php?filtrar=${zonaL}`)
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById("destInp");
        select.innerHTML = "";

        data.forEach(z => {
            const option = document.createElement("option");
            option.value = z.nombreZona;
            option.textContent = `${z.nombreZona} (${z.abrev})`;

            if (z.nombreZona === zonaSeleccionada) {
                option.selected = true;
            }

            select.appendChild(option);
        });
    });
}



function back() {
    window.location.href = "menu.html";
}