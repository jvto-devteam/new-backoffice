<?php

namespace Database\Seeders;

use App\Models\FileType;
use Illuminate\Database\Seeder;

class FileTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fileTypes = [
            [
                'extension' => 'pdf',
                'icon_name' => 'FileText',
                'icon_color' => 'text-red-500',
            ],
            [
                'extension' => 'xlsx',
                'icon_name' => 'FileSpreadsheet',
                'icon_color' => 'text-green-600',
            ],
            [
                'extension' => 'docx',
                'icon_name' => 'FileText',
                'icon_color' => 'text-blue-500',
            ],
            [
                'extension' => 'jpg',
                'icon_name' => 'Image',
                'icon_color' => 'text-purple-500',
            ],
            [
                'extension' => 'png',
                'icon_name' => 'Image',
                'icon_color' => 'text-purple-500',
            ],
            [
                'extension' => 'txt',
                'icon_name' => 'File',
                'icon_color' => 'text-gray-500',
            ],
            [
                'extension' => 'csv',
                'icon_name' => 'FileSpreadsheet',
                'icon_color' => 'text-yellow-600',
            ],
            [
                'extension' => 'zip',
                'icon_name' => 'Archive',
                'icon_color' => 'text-amber-600',
            ],
        ];

        foreach ($fileTypes as $fileType) {
            FileType::create($fileType);
        }
    }
}
