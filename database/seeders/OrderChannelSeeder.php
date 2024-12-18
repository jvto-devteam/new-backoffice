<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('order_channels')->insert([
            [
                'name' => 'JVTO'
            ],
            [
                'name' => 'TWT'
            ],
            [
                'name' => 'KLOOK'
            ],
        ]);

    }
}
