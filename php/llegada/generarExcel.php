<?php
ob_start();
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

try {
    include '../conexion.php';

    $viajeCod = $_GET['viaje'] ?? '';
    $destino = $_GET['destino'] ?? '';

    if (empty($viajeCod)) {
        throw new Exception('Código de viaje no proporcionado');
    }

    $sqlViaje = "SELECT placa, fecha FROM viajebodega WHERE viajeCod = ?";
    $stmtViaje = $conexion->prepare($sqlViaje);
    $stmtViaje->bind_param("s", $viajeCod);
    $stmtViaje->execute();
    $resultViaje = $stmtViaje->get_result();
    $viajeData = $resultViaje->fetch_assoc();

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
        $totalGeneral += $row['total'];
    }

    $stmt->close();
    $conexion->close();

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    $sheet->setTitle(substr($viajeCod, 0, 31));

    $sheet->setCellValue('A1', 'Placa: ' . ($viajeData['placa'] ?? 'N/A'));
    $sheet->setCellValue('C1', 'Fecha: ' . ($viajeData['fecha'] ?? '/'));
    $sheet->setCellValue('E1', 'Llegada de: ' . ($destino ?? 'N/A'));

    $headers = ['Encomienda', 'Consignatario', 'Teléfono', 'Total (Bs)', 'Estado', 'Fecha Pago'];
    $columna = 'A';
    foreach ($headers as $header) {
        $sheet->setCellValue($columna . '3', $header);
        $columna++;
    }

    $headerStyle = [
        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];
    $sheet->getStyle('A3:F3')->applyFromArray($headerStyle);

    $fila = 4;
    $filaCheckbox = 4;

    foreach ($encomiendas as $enco) {
        $sheet->setCellValue('A' . $fila, $enco['conEnc']);
        $sheet->setCellValue('B' . $fila, $enco['consignatario']);
        $sheet->setCellValue('C' . $fila, $enco['conTelf'] ?? 'N/A');
        $sheet->setCellValue('D' . $fila, $enco['total']);
        $sheet->getStyle('D' . $fila)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->setCellValue('E' . $fila, 'Por Pagar');
        $sheet->setCellValue('F' . $fila, '');

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

        $sheet->setCellValue('J' . $filaCheckbox, 'No');
        $sheet->setCellValue('K' . $filaCheckbox, "=IF(J{$filaCheckbox}=\"Si\",0,D{$fila})");
        $sheet->getStyle('K' . $filaCheckbox)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->setCellValue('L' . $filaCheckbox, "=IF(J{$filaCheckbox}=\"Si\",NOW(),\"\")");
        $sheet->getStyle('L' . $filaCheckbox)->getNumberFormat()->setFormatCode('yyyy-mm-dd hh:mm');

        $fila++;
        $filaCheckbox++;
    }

    $filaTotal = $fila;

    if (count($encomiendas) > 0) {
        $sheet->setCellValue('A' . $filaTotal, 'TOTALES');
        $sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
        $sheet->setCellValue('D' . $filaTotal, "=SUM(D4:D" . ($fila-1) . ")");
        $sheet->getStyle('D' . $filaTotal)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->setCellValue('K' . $filaTotal, "=SUM(K4:K" . ($filaCheckbox-1) . ")");
        $sheet->getStyle('K' . $filaTotal)->getNumberFormat()->setFormatCode('#,##0.00');

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

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        foreach (range('J', 'L') as $col) {
            $sheet->getColumnDimension($col)->setWidth(15);
        }

        $styleArray = [
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER]
        ];
        $sheet->getStyle('A4:F' . ($fila-1))->applyFromArray($styleArray);
        $sheet->getStyle('J4:L' . ($filaCheckbox-1))->applyFromArray($styleArray);

        $sheet->freezePane('A4');
    } else {
        $sheet->setCellValue('A' . $filaTotal, 'NO HAY ENCOMIENDAS PENDIENTES DE PAGO');
        $sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A' . $filaTotal)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->mergeCells('A' . $filaTotal . ':F' . $filaTotal);

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    $tmpFile = tempnam(sys_get_temp_dir(), 'excel_');
    $writer = new Xlsx($spreadsheet);
    $writer->save($tmpFile);

    ob_end_clean();
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $viajeCod . '.xlsx"');
    header('Content-Length: ' . filesize($tmpFile));
    header('Cache-Control: max-age=0');

    readfile($tmpFile);
    unlink($tmpFile);
    exit;

} catch (\Throwable $e) {
    while (ob_get_level()) ob_end_clean();
    echo 'Error: ' . $e->getMessage();
    exit;
}
?>