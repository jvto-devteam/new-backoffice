<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Klook3D2NRoomConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Data for room configurations
        $data = [
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 9, 'group_size' => 1, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 9, 'group_size' => 2, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 43, 'group_size' => 3, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 43, 'group_size' => 4, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 9, 'group_size' => 5, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 43, 'group_size' => 5, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 9, 'group_size' => 6, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 43, 'group_size' => 6, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 43, 'group_size' => 7, 'quantity' => 2],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 43, 'group_size' => 8, 'quantity' => 2],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 9, 'group_size' => 9, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 43, 'group_size' => 9, 'quantity' => 2],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 9, 'group_size' => 10, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 1, 'room_hotel_id' => 43, 'group_size' => 10, 'quantity' => 2],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 1, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 2, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 109, 'group_size' => 3, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 4, 'quantity' => 2],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 5, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 109, 'group_size' => 5, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 6, 'quantity' => 3],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 7, 'quantity' => 2],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 109, 'group_size' => 7, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 8, 'quantity' => 4],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 9, 'quantity' => 3],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 109, 'group_size' => 9, 'quantity' => 1],
            ['package_id' => 82, 'hotel_id' => 11, 'room_hotel_id' => 24, 'group_size' => 10, 'quantity' => 5],
        ];

        // Insert data into the table
        DB::table('room_configurations')->insert($data);
    }
}
