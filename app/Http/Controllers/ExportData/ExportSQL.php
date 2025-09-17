<?php

namespace App\Http\Controllers\ExportData;

use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportSQL
{
    public static function export(string $tableName, array $columns, $data): StreamedResponse
    {
        $tableName = str_replace(".csv", "", $tableName);
        $headers = [
            'Content-Type' => 'application/sql',
            'Content-Disposition' => "attachment; filename=\"{$tableName}.sql\"",
        ];

        $callback = function () use ($tableName, $columns, $data) {
            $handle = fopen('php://output', 'w');

            fwrite($handle, "-- SQL Export for table {$tableName}\n");
            fwrite($handle, "-- Generated at " . now() . "\n\n");
            // Truncate dulu
            fwrite($handle, "TRUNCATE TABLE {$tableName} RESTART IDENTITY CASCADE;\n\n");

            $lastId = 0;

            foreach ($data as $row) {
                $values = [];
                foreach ($columns as $col) {
                    $val = $row[$col] ?? null;

                    if (is_null($val)) {
                        $values[] = "NULL";
                    } elseif (is_bool($val)) {
                        $values[] = $val ? 'true' : 'false';
                    } elseif (is_numeric($val)) {
                        $values[] = $val;
                    } else {
                        $values[] = "'" . str_replace("'", "''", $val) . "'";
                    }
                }

                $columnsStr = implode(", ", $columns);
                $valuesStr = implode(", ", $values);

                $sql = "INSERT INTO {$tableName} ({$columnsStr}) OVERRIDING SYSTEM VALUE VALUES ({$valuesStr});\n";
                fwrite($handle, $sql);

                // track last ID kalau ada kolom "id"
                if (isset($row['id'])) {
                    $lastId = max($lastId, (int) $row['id']);
                }
            }

            // tambahkan set sequence
            if ($lastId > 0) {
                fwrite($handle, "\n-- Set sequence untuk PostgreSQL\n");
                fwrite($handle, "SELECT setval('{$tableName}_id_seq', {$lastId}, true);\n");
            }

            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
