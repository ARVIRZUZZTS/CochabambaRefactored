const VIAJES_PENDIENTES_KEY = "viajesPendientes";

function obtenerPendientes() {
    try {
        return JSON.parse(localStorage.getItem(VIAJES_PENDIENTES_KEY)) || [];
    } catch {
        return [];
    }
}

function guardarPendientes(lista) {
    localStorage.setItem(VIAJES_PENDIENTES_KEY, JSON.stringify(lista));
}

function agregarViajePendiente(viajeCod) {
    const pendientes = obtenerPendientes();
    if (!pendientes.includes(viajeCod)) {
        pendientes.push(viajeCod);
        guardarPendientes(pendientes);
    }
}

function quitarViajePendiente(viajeCod) {
    const pendientes = obtenerPendientes().filter(cod => cod !== viajeCod);
    guardarPendientes(pendientes);
}

function showToast(mensaje, esError = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.className = "show";
    if (esError) {
        toast.style.background = "#f44336";
    } else {
        toast.style.background = "#4CAF50";
    }
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 5000);
}

function procesarViajesPendientes() {
    const pendientes = obtenerPendientes();
    if (pendientes.length === 0) return;

    const viajeCod = pendientes[0];

    fetch(`php/informacion/viajeSB.php?viaje=${encodeURIComponent(viajeCod)}`)
        .then(response => {
            if (!response.ok) throw new Error("Error en viajeSB");
            return response.json();
        })
        .then(() => {
            return fetch(`php/informacion/estadoImp.php?viaje=${encodeURIComponent(viajeCod)}`)
            .then(response => {
                if (!response.ok) throw new Error("Error estadoImp");
                return response.text();
            });
        })
        .then(() => {
            quitarViajePendiente(viajeCod);
            fetch(`php/informacion/viajeAll.php?viaje=${encodeURIComponent(viajeCod)}`)
                .then(r => r.json())
                .then(data => {
                    const v = data.viaje;
                    showToast(`Se subió correctamente el viaje de ${v.placa} con destino a ${v.destino}`);
                })
                .catch(() => {
                    showToast(`Viaje ${viajeCod} subido correctamente`);
                });
        })
        .catch(error => {
            console.error(`Fallo al subir viaje pendiente ${viajeCod}:`, error);
            showToast("Se reintentará subir el viaje luego", true);
        });
}
