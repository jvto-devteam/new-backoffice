<?php

namespace App\Http\Controllers\ExportData;

use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportCSV
{
    /**
     * Export data ke CSV
     *
     * @param string $fileName Nama file CSV
     * @param array $columns Header kolom
     * @param array|\Illuminate\Support\Collection $data Data untuk di-export
     * @return StreamedResponse
     */
    public static function export(string $fileName, array $columns, $data): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ];

        $callback = function () use ($columns, $data) {
            $handle = fopen('php://output', 'w');

            // Tulis header kolom
            fputcsv($handle, $columns);

            // Tulis data
            foreach ($data as $row) {
                $rowData = [];
                foreach ($columns as $col) {
                    $rowData[] = $row[$col] ?? ''; // isi kosong jika kolom tidak ada
                }
                fputcsv($handle, $rowData);
            }

            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
