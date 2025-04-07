<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NoteCategory;

class NoteCategorySeeder extends Seeder
{
    public function run()
    {
        NoteCategory::insert([
            ['id' => 1, 'name' => 'General',     'color' => '#3B82F6'],
            ['id' => 2, 'name' => 'Important',   'color' => '#EF4444'],
            ['id' => 3, 'name' => 'Follow-up',   'color' => '#FBBF24'],
            ['id' => 4, 'name' => 'Completed',   'color' => '#10B981'],
            ['id' => 5, 'name' => 'In Progress', 'color' => '#F97316'],
            ['id' => 6, 'name' => 'Special',     'color' => '#8B5CF6'],
        ]);
    }
}
