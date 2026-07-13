function printDiv(aux) {
    document.getElementById('ticket').classList.add('print-visible');
    const boletin = document.getElementById('boletin');
    if (boletin) boletin.classList.remove('print-visible');
    const resumen = document.getElementById('resumen');
    if (resumen) resumen.classList.remove('print-visible');
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
    const ticket = document.getElementById('ticket');
    if (ticket) ticket.classList.remove('print-visible');
    const boletin = document.getElementById('boletin');
    if (boletin) boletin.classList.remove('print-visible');
    print();
    document.getElementById('resumen').classList.remove('print-visible');
}
