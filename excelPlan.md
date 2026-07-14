Solución completa usando PHPSpreadsheet:
1. Primero, instala PHPSpreadsheet (si no lo tienes):
bash
composer require phpspreadsheet/phpspreadsheet
2. Crea el archivo PHP para generar el Excel:
php/llegada/generarExcel.php

php
<?php
require '../../vendor/autoload.php'; // Ajusta la ruta según tu estructura

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

include '../conexion.php';

$viajeCod = $_GET['viaje'] ?? '';

if (empty($viajeCod)) {
    die('Error: Código de viaje no proporcionado');
}

// Obtener datos del viaje
$sqlViaje = "SELECT placa, fecha, destino FROM viaje WHERE viaje = ?";
$stmtViaje = $conexion->prepare($sqlViaje);
$stmtViaje->bind_param("s", $viajeCod);
$stmtViaje->execute();
$resultViaje = $stmtViaje->get_result();
$viajeData = $resultViaje->fetch_assoc();

// Obtener solo encomiendas NO pagadas (estadoPaga != '1')
$sql = "SELECT conEnc, consignatario, conTelf, total, bulto, estadoPaga 
        FROM encomiendabodega 
        WHERE viajeCod = ? AND estadoPaga != '1'";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $viajeCod);
$stmt->execute();
$result = $stmt->get_result();

$encomiendas = [];
$totalGeneral = 0;

while ($row = $result->fetch_assoc()) {
    $encomiendas[] = $row;
    $totalGeneral += floatval($row['total']);
}

$stmt->close();
$conexion->close();

// Crear el Excel
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Título del archivo (nombre = código del viaje)
$sheet->setTitle(substr($viajeCod, 0, 31)); // Excel limita a 31 caracteres

// === ENCABEZADOS ===
$sheet->setCellValue('A1', 'Placa: ' . ($viajeData['placa'] ?? 'N/A'));
$sheet->setCellValue('C1', 'Fecha: ' . ($viajeData['fecha'] ?? date('Y-m-d')));
$sheet->setCellValue('E1', 'Destino: ' . ($viajeData['destino'] ?? 'N/A'));

// Encabezados de columnas (fila 3)
$headers = ['Encomienda', 'Consignatario', 'Teléfono', 'Total (Bs)', 'Estado', 'Fecha Pago'];
$columna = 'A';
foreach ($headers as $header) {
    $sheet->setCellValue($columna . '3', $header);
    $columna++;
}

// Estilo para encabezados
$headerStyle = [
    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']],
    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
];
$sheet->getStyle('A3:F3')->applyFromArray($headerStyle);

// === DATOS ===
$fila = 4;
$filaCheckbox = 4; // Para los checkboxes en la columna J

foreach ($encomiendas as $index => $enco) {
    // A: Encomienda
    $sheet->setCellValue('A' . $fila, $enco['conEnc']);
    
    // B: Consignatario
    $sheet->setCellValue('B' . $fila, $enco['consignatario']);
    
    // C: Teléfono
    $sheet->setCellValue('C' . $fila, $enco['conTelf'] ?? 'N/A');
    
    // D: Total
    $sheet->setCellValue('D' . $fila, floatval($enco['total']));
    $sheet->getStyle('D' . $fila)->getNumberFormat()->setFormatCode('#,##0.00');
    
    // E: Estado (Por Pagar por defecto)
    $sheet->setCellValue('E' . $fila, 'Por Pagar');
    
    // F: Fecha Pago (vacío por ahora)
    $sheet->setCellValue('F' . $fila, '');
    
    // === CHECKBOX en columna J (10) ===
    // Usamos validación de datos para crear un checkbox tipo "Sí/No"
    $validation = $sheet->getCell('J' . $filaCheckbox)->getDataValidation();
    $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
    $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
    $validation->setAllowBlank(false);
    $validation->setShowInputMessage(true);
    $validation->setShowErrorMessage(true);
    $validation->setShowDropDown(true);
    $validation->setFormula1('"No,Si"');
    $validation->setPromptTitle('Estado de Pago');
    $validation->setPrompt('Selecciona Si para marcar como pagado');
    $validation->setErrorTitle('Entrada inválida');
    $validation->setError('Selecciona Si o No');
    
    // Valor por defecto: "No"
    $sheet->setCellValue('J' . $filaCheckbox, 'No');
    
    // === COLUMNA K: Saldo (se actualizará automáticamente) ===
    // Fórmula: Si J=Si entonces 0, sino el total
    $sheet->setCellValue('K' . $filaCheckbox, "=IF(J{$filaCheckbox}=\"Si\",0,D{$fila})");
    $sheet->getStyle('K' . $filaCheckbox)->getNumberFormat()->setFormatCode('#,##0.00');
    
    // === COLUMNA L: Fecha Pago (se actualizará automáticamente) ===
    // Fórmula: Si J=Si entonces fecha actual, sino vacío
    $sheet->setCellValue('L' . $filaCheckbox, "=IF(J{$filaCheckbox}=\"Si\",NOW(),\"\")");
    $sheet->getStyle('L' . $filaCheckbox)->getNumberFormat()->setFormatCode('yyyy-mm-dd hh:mm');
    
    $fila++;
    $filaCheckbox++;
}

// === TOTALES (fila después de los datos) ===
$filaTotal = $fila;
$sheet->setCellValue('A' . $filaTotal, 'TOTALES');
$sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);

// Suma de totales
$sheet->setCellValue('D' . $filaTotal, "=SUM(D4:D" . ($fila-1) . ")");
$sheet->getStyle('D' . $filaTotal)->getNumberFormat()->setFormatCode('#,##0.00');

// Suma de saldos (columna K)
$sheet->setCellValue('K' . $filaTotal, "=SUM(K4:K" . ($filaCheckbox-1) . ")");
$sheet->getStyle('K' . $filaTotal)->getNumberFormat()->setFormatCode('#,##0.00');

// === RESULTADO FINAL (fila de resumen) ===
$filaResumen = $filaTotal + 2;
$sheet->setCellValue('A' . $filaResumen, 'RESUMEN');
$sheet->getStyle('A' . $filaResumen)->getFont()->setBold(true)->setSize(14);

$sheet->setCellValue('A' . ($filaResumen + 1), 'Total Encomiendas:');
$sheet->setCellValue('B' . ($filaResumen + 1), count($encomiendas));

$sheet->setCellValue('A' . ($filaResumen + 2), 'Total General:');
$sheet->setCellValue('B' . ($filaResumen + 2), $totalGeneral);
$sheet->getStyle('B' . ($filaResumen + 2))->getNumberFormat()->setFormatCode('#,##0.00');

$sheet->setCellValue('A' . ($filaResumen + 3), 'Saldo Pendiente:');
$sheet->setCellValue('B' . ($filaResumen + 3), "=K{$filaTotal}");
$sheet->getStyle('B' . ($filaResumen + 3))->getNumberFormat()->setFormatCode('#,##0.00');

// === AJUSTAR ANCHOS DE COLUMNAS ===
foreach (range('A', 'F') as $col) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
}
foreach (range('J', 'L') as $col) {
    $sheet->getColumnDimension($col)->setWidth(15);
}

// === ESTILO PARA DATOS ===
$styleArray = [
    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
    'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER]
];
$sheet->getStyle('A4:F' . ($fila-1))->applyFromArray($styleArray);
$sheet->getStyle('J4:L' . ($filaCheckbox-1))->applyFromArray($styleArray);

// === CONGELAR PANELES ===
$sheet->freezePane('A4');

// === GENERAR ARCHIVO ===
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $viajeCod . '_por_pagar.xlsx"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
?>
3. Actualiza tu función goExcel() en llegada.js:
javascript
function goExcel() {
    // Mostrar indicador de carga
    showToast("Generando Excel...", false);
    
    // Crear un link para descargar el Excel
    const link = document.createElement('a');
    link.href = `php/llegada/generarExcel.php?viaje=${encodeURIComponent(viaje)}`;
    link.target = '_blank';
    link.download = `${viaje}_por_pagar.xlsx`;
    
    // Simular clic para descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Excel generado exitosamente", false);
}