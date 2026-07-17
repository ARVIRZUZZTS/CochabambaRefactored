<?php
ob_start();
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Conditional;

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

    $spreadsheet->getDefaultStyle()->getFont()->setName('Bahnschrift SemiBold')->setSize(12);

    $sheet->setTitle(substr($viajeCod, 0, 31));

    $sheet->setCellValue('A1', 'Placa: ' . ($viajeData['placa'] ?? 'N/A'));
    $sheet->setCellValue('B1', 'Llegada de: ' . ($destino ?? 'N/A'));
    $sheet->setCellValue('E1', 'Fecha: ' . ($viajeData['fecha'] ?? '/'));
    $sheet->getStyle('A1:H1')->getFont()->setSize(14)->setBold(true);
    $sheet->getRowDimension(1)->setRowHeight(30);
    $sheet->getRowDimension(3)->setRowHeight(25);

    $headers = ['Encomienda', 'Consignatario', 'Teléfono', 'Total (Bs)', 'Estado', 'Fecha Pago', 'Pagado?', 'Saldo'];
    $columna = 'A';
    foreach ($headers as $header) {
        $sheet->setCellValue($columna . '3', $header);
        $columna++;
    }

    $headerStyle = [
        'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];
    $sheet->getStyle('A3:H3')->applyFromArray($headerStyle);

    $fila = 4;
    $filaCheckbox = 4;

    foreach ($encomiendas as $enco) {
        $sheet->setCellValue('A' . $fila, $enco['conEnc']);
        $sheet->setCellValue('B' . $fila, $enco['consignatario']);
        $sheet->setCellValue('C' . $fila, $enco['conTelf'] ?? 'N/A');
        $sheet->setCellValue('D' . $fila, $enco['total']);
        $sheet->getStyle('D' . $fila)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->setCellValue('E' . $fila, 'Por Pagar');
        $sheet->setCellValue('F' . $fila, "=IF(G{$filaCheckbox}=\"☑\",IF(F{$fila}=\"\",NOW(),F{$fila}),\"\")");
        $sheet->getStyle('F' . $fila)->getNumberFormat()->setFormatCode('yyyy-mm-dd hh:mm');

        $validation = $sheet->getCell('G' . $filaCheckbox)->getDataValidation();
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
        $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
        $validation->setAllowBlank(false);
        $validation->setShowInputMessage(true);
        $validation->setShowErrorMessage(true);
        $validation->setShowDropDown(true);
        $validation->setFormula1('"☐,☑"');
        $validation->setPromptTitle('Pagado?');
        $validation->setPrompt('Selecciona ☑ para marcar como pagado');
        $validation->setErrorTitle('Entrada inválida');
        $validation->setError('Selecciona ☐ o ☑');

        $sheet->setCellValue('G' . $filaCheckbox, '☐');
        $sheet->setCellValue('H' . $filaCheckbox, "=IF(G{$filaCheckbox}=\"☑\",0,D{$fila})");
        $sheet->getStyle('H' . $filaCheckbox)->getNumberFormat()->setFormatCode('#,##0.00');

        $fila++;
        $filaCheckbox++;
    }

    $filaTotal = $fila;

    if (count($encomiendas) > 0) {
        $ultimaFila = $fila - 1;
        $rangeG = 'G4:G' . $ultimaFila;

        $condPaid = new Conditional();
        $condPaid->setConditionType(Conditional::CONDITION_CELLIS);
        $condPaid->setOperatorType(Conditional::OPERATOR_EQUAL);
        $condPaid->addCondition('"☑"');
        $condPaid->getStyle()->getFont()->getColor()->setARGB('FF00B050');
        $condPaid->getStyle()->getFont()->setBold(true);

        $condUnpaid = new Conditional();
        $condUnpaid->setConditionType(Conditional::CONDITION_CELLIS);
        $condUnpaid->setOperatorType(Conditional::OPERATOR_EQUAL);
        $condUnpaid->addCondition('"☐"');
        $condUnpaid->getStyle()->getFont()->getColor()->setARGB('FF999999');

        $sheet->getStyle($rangeG)->setConditionalStyles([$condPaid, $condUnpaid]);
        $sheet->setCellValue('A' . $filaTotal, 'TOTALES');
        $sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
        $sheet->setCellValue('D' . $filaTotal, "=SUM(D4:D" . ($fila-1) . ")");
        $sheet->getStyle('D' . $filaTotal)->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->setCellValue('H' . $filaTotal, "=SUM(H4:H" . ($filaCheckbox-1) . ")");
        $sheet->getStyle('H' . $filaTotal)->getNumberFormat()->setFormatCode('#,##0.00');

        $resumenStyle = [
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER]
        ];

        $sheet->setCellValue('J3', 'RESUMEN');
        $sheet->getStyle('J3')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('J3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->setCellValue('J4', 'Total General:');
        $sheet->setCellValue('K4', "=SUM(D4:D{$ultimaFila})");
        $sheet->getStyle('K4')->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->setCellValue('J5', 'Total Pagado:');
        $sheet->setCellValue('K5', "=SUMIF(G4:G{$ultimaFila},\"☑\",D4:D{$ultimaFila})");
        $sheet->getStyle('K5')->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->setCellValue('J6', 'Rezagado:');
        $sheet->setCellValue('K6', "=H{$filaTotal}");
        $sheet->getStyle('K6')->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->getStyle('J3:K6')->applyFromArray($resumenStyle);

        for ($r = 4; $r <= $ultimaFila; $r++) {
            $sheet->getRowDimension($r)->setRowHeight(22);
        }

        foreach (range('A', 'D') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        $sheet->getColumnDimension('E')->setWidth(20);
        $sheet->getColumnDimension('F')->setWidth(20);
        foreach (range('G', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        $sheet->getColumnDimension('J')->setWidth(22);
        $sheet->getColumnDimension('K')->setWidth(15);

        $styleArray = [
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER]
        ];
        $sheet->getStyle('A4:H' . ($fila-1))->applyFromArray($styleArray);

        $sheet->freezePane('A4');
    } else {
        $sheet->setCellValue('A' . $filaTotal, 'NO HAY ENCOMIENDAS PENDIENTES DE PAGO');
        $sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A' . $filaTotal)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->mergeCells('A' . $filaTotal . ':H' . $filaTotal);

        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    $tmpFile = tempnam(sys_get_temp_dir(), 'excel_');
    $writer = new Xlsx($spreadsheet);
    $writer->save($tmpFile);

    $zip = new ZipArchive();
    if ($zip->open($tmpFile) === true) {
        $xml = $zip->getFromName('xl/workbook.xml');
        if ($xml !== false) {
            $replaced = preg_replace('/<calcPr[^>]*\/>/', '<calcPr calcMode="auto" iterate="true" iterateCount="1"/>', $xml, 1, $count);
            if ($count === 0) {
                $replaced = preg_replace('/<\/workbook>/', '<calcPr calcMode="auto" iterate="true" iterateCount="1"/></workbook>', $xml, 1);
            }
            $zip->addFromString('xl/workbook.xml', $replaced);
        }
        $zip->close();
    }

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