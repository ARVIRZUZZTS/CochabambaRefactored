const diaL = localStorage.getItem("dia");
const zonaL = localStorage.getItem("zona");

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("horaInp").value = horaAct();
    document.getElementById("fechaTitle").textContent = "Fecha: " + diaL;
    document.getElementById("origenTitle").textContent = "Origen: " + zonaL;
    cargarFlotas();
    cargarZonas();
});

function fin() {
    var prop = document.getElementById('propInp').value.trim();
    var chof = document.getElementById('chofInp').value.trim();
    var plac = document.getElementById('placInp').value.trim();
    var dest = document.getElementById('destInp').value.trim();
    var hora = document.getElementById('horaInp').value.trim();
    let ayud = document.getElementById('ayudInp') ? document.getElementById('ayudInp').value.trim() : "";

    if (prop === "" || chof === "" || plac === "" || dest === "" || hora === "") {
        document.getElementById("msgVia").innerText = "Todos los campos son obligatorios menos Ayudante.";
        return;
    }

    fetch(`php/bus/viaje.php?prop=${encodeURIComponent(prop.trim())}
            &chof=${encodeURIComponent(chof.trim())}
            &ayud=${encodeURIComponent(ayud.trim())}
            &plac=${encodeURIComponent(plac.trim())}
            &dpto=${encodeURIComponent(dest.trim())}
            &hora=${encodeURIComponent(hora.trim())}
            &dia=${encodeURIComponent(diaL.trim())}
            &org=${encodeURIComponent(zonaL.trim())}`)
    .then(response => response.json()) 
    .then(data => {
        document.getElementById("msgVia").innerText = data.error || "Viaje registrado correctamente.";

        if (!data.error) {
            localStorage.setItem("encDest", dest);
            localStorage.setItem("viajeL", data.viajeCod);
            window.location.href = "encomienda.html";
        }
    })
    .catch(error => console.error("Error:", error));
}
