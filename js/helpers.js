function horaAct() {
    let ahora = new Date();
    let horas = ahora.getHours().toString().padStart(2, "0");
    let min = ahora.getMinutes().toString().padStart(2, "0");
    return `${horas}:${min}`;
}

function showToast(mensaje, esError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.style.backgroundColor = esError ? "#d9534f" : "#4CAF50";
    toast.className = "show";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

function back(url) {
    window.location = url;
}
