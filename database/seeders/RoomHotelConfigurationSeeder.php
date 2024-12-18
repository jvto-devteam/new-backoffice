<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomHotelConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('room_hotel_configurations')->insert([
            [
                'hotel_id' => 10,
                'room_id' => 1,
                'pax' => 2,
                'qty' => 10
            ],
        ]);
        // Grand Padis = 10
        // Baratha Hotel = 1
        // Luminor Hotel = 32

        // Joglo Kecombrang = 11
        // Whizz Bromo = 2

        // Doho Homestay = 33
        // Whiz Prime = 13
        // Artha Cottage = 38

        // Holiday Inn = 6
        // Hotel 88 = 16
    }
}