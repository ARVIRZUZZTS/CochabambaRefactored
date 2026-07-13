const DESTINOS_TRAMO = ["Santa Cruz", "Cochabamba", "Montero"];

function esTramo(destino) {
    return DESTINOS_TRAMO.includes(destino.trim());
}

function getEstadoPagaText(estadoPaga) {
    switch (estadoPaga.trim()) {
        case "1": return "Cancelado";
        case "2": return "Por Pagar";
        case "3": return "Canc | PXP";
        case "4": return "PXP | Canc";
        default: return "";
    }
}

function getEstadoPagaShort(estadoPaga) {
    switch (estadoPaga.trim()) {
        case "1": return "C";
        case "2": return "PxP";
        case "3": return "C-PxP";
        case "4": return "PxP-C";
        default: return "";
    }
}

function getTxtPagar(estadoPaga, destino) {
    if (esTramo(destino)) {
        return estadoPaga.trim() === "1" ? "GUIA PAGADA EN ORIGEN" : "GUIA PxP EN DESTINO";
    }
    switch (estadoPaga.trim()) {
        case "1": return "GUIA PAGADA EN ORIGEN";
        case "2": return "GUIA PxP EN DESTINO";
        default: return "";
    }
}

function getTxtPP(estadoPaga) {
    return estadoPaga.trim() === "1" ? "Total Pagado" : "Total Por Pagar";
}

function getValorDeclaradoText(valDeclarado) {
    return valDeclarado === "Si" ? "" : "SIN DINERO NI OBJETOS DE VALOR";
}
