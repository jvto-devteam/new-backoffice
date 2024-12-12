<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OthersActivitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = [
            [
                'name' => 'Driver',
                'unit' => 'person',
                'formula' => null,
                'price' => 250000.00,
            ],
            [
                'name' => 'Transport Allowance',
                'unit' => 'trip',
                'formula' => null,
                'price' => 100000.00,
            ],
            [
                'name' => 'Mineral Water',
                'unit' => 'bottle',
                'formula' => null,
                'price' => 50000.00,
            ],
            [
                'name' => 'T-shirt',
                'unit' => 'piece',
                'formula' => null,
                'price' => 60000.00,
            ],
            [
                'name' => 'Toll & Parking',
                'unit' => 'trip',
                'formula' => null,
                'price' => 200000.00,
            ],
        ];

        DB::table('others_activities')->insert($data);
    }
}
