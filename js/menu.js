const zona = localStorage.getItem("zona");
var dia = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

localStorage.setItem("dia", dia);

function showOp(event) {
    event.stopPropagation();
    document.getElementById("modalOpciones").style.display = "flex";
}
function closeModal() {
    document.getElementById("modalOpciones").style.display = "none";
}
window.addEventListener("click", function(event) {
    const modal = document.getElementById("modalOpciones");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

function goAddBus() {
    window.location = "bus.html";
}
document.addEventListener('DOMContentLoaded', () => {
    flatpickr("#fecha", {
        inline: true,
        dateFormat: "d-m-Y",
        locale: "es",
        defaultDate: dia,
        onChange: function (selectedDates, dateStr) {
            dia = dateStr;
            localStorage.setItem("dia",dia);
            console.log("Fecha seleccionada: " + dia);
            obtenerViajes(dia);
        }
    });

    obtenerViajes(dia);
    document.getElementById("titleEncomiendas").textContent = "BUSES de " + zona;
});

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