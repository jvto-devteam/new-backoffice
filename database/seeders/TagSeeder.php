<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            [
                'name' => 'Urgent',
                'color' => '#EF4444',
                'description' => 'File yang memerlukan perhatian segera',
            ],
            [
                'name' => 'Invoice',
                'color' => '#8B5CF6',
                'description' => 'Dokumen invoice',
            ],
            [
                'name' => 'Schedule',
                'color' => '#10B981',
                'description' => 'Dokumen jadwal',
            ],
            [
                'name' => 'Contract',
                'color' => '#F59E0B',
                'description' => 'Dokumen kontrak',
            ],
            [
                'name' => 'Archived',
                'color' => '#6B7280',
                'description' => 'Dokumen yang telah diarsipkan',
            ],
            [
                'name' => 'Important',
                'color' => '#DC2626',
                'description' => 'Dokumen penting',
            ],
            [
                'name' => 'Draft',
                'color' => '#9CA3AF',
                'description' => 'Dokumen draft',
            ],
            [
                'name' => 'Final',
                'color' => '#047857',
                'description' => 'Dokumen final',
            ],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
