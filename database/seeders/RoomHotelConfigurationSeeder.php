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
        // Grand Padis = 10
        DB::table('room_hotel_configurations')->insert([
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 1,
                'qty' => 1
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 2,
                'qty' => 1
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 10,
                'room_id' => 19, //extra bed
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 4,
                'qty' => 2
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 5,
                'qty' => 2
            ],
            [
                'hotel_id' => 10,
                'room_id' => 19, //extra bed
                'pax' => 5,
                'qty' => 1
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 6,
                'qty' => 3
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 7,
                'qty' => 3
            ],
            [
                'hotel_id' => 10,
                'room_id' => 19, //extra bed
                'pax' => 7,
                'qty' => 1
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 8,
                'qty' => 4
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 9,
                'qty' => 4
            ],
            [
                'hotel_id' => 10,
                'room_id' => 19, //extra bed
                'pax' => 9,
                'qty' => 1
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 10,
                'qty' => 5
            ],
            [
                'hotel_id' => 10,
                'room_id' => 158, //twin
                'pax' => 11,
                'qty' => 5
            ],
            [
                'hotel_id' => 10,
                'room_id' => 19, //extra bed
                'pax' => 11,
                'qty' => 1
            ],
        ]);
        //Holiday Inn
        DB::table('room_hotel_configurations')->insert([
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 1,
                'qty' => 1
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 2,
                'qty' => 1
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 6,
                'room_id' => 102, //extra bed
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 4,
                'qty' => 2
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 5,
                'qty' => 2
            ],
            [
                'hotel_id' => 6,
                'room_id' => 102, //extra bed
                'pax' => 5,
                'qty' => 1
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 6,
                'qty' => 3
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 7,
                'qty' => 3
            ],
            [
                'hotel_id' => 6,
                'room_id' => 102, //extra bed
                'pax' => 7,
                'qty' => 1
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 8,
                'qty' => 4
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 9,
                'qty' => 4
            ],
            [
                'hotel_id' => 6,
                'room_id' => 102, //extra bed
                'pax' => 9,
                'qty' => 1
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 10,
                'qty' => 5
            ],
            [
                'hotel_id' => 6,
                'room_id' => 5, //twin
                'pax' => 11,
                'qty' => 5
            ],
            [
                'hotel_id' => 6,
                'room_id' => 102, //extra bed
                'pax' => 11,
                'qty' => 1
            ],
        ]);

        //Luminor
        DB::table('room_hotel_configurations')->insert([
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 1,
                'qty' => 1
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 2,
                'qty' => 1
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 32,
                'room_id' => 186, //extra bed
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 4,
                'qty' => 2
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 5,
                'qty' => 2
            ],
            [
                'hotel_id' => 32,
                'room_id' => 186, //extra bed
                'pax' => 5,
                'qty' => 1
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 6,
                'qty' => 3
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 7,
                'qty' => 3
            ],
            [
                'hotel_id' => 32,
                'room_id' => 186, //extra bed
                'pax' => 7,
                'qty' => 1
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 8,
                'qty' => 4
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 9,
                'qty' => 4
            ],
            [
                'hotel_id' => 32,
                'room_id' => 186, //extra bed
                'pax' => 9,
                'qty' => 1
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 10,
                'qty' => 5
            ],
            [
                'hotel_id' => 32,
                'room_id' => 185, //twin
                'pax' => 11,
                'qty' => 5
            ],
            [
                'hotel_id' => 32,
                'room_id' => 186, //extra bed
                'pax' => 11,
                'qty' => 1
            ],
        ]);

        //Artha Cottage
        DB::table('room_hotel_configurations')->insert([
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 1,
                'qty' => 1
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 2,
                'qty' => 1
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 38,
                'room_id' => 187, //extra bed
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 4,
                'qty' => 2
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 5,
                'qty' => 2
            ],
            [
                'hotel_id' => 38,
                'room_id' => 187, //extra bed
                'pax' => 5,
                'qty' => 1
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 6,
                'qty' => 3
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 7,
                'qty' => 3
            ],
            [
                'hotel_id' => 38,
                'room_id' => 187, //extra bed
                'pax' => 7,
                'qty' => 1
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 8,
                'qty' => 4
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 9,
                'qty' => 4
            ],
            [
                'hotel_id' => 38,
                'room_id' => 187, //extra bed
                'pax' => 9,
                'qty' => 1
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 10,
                'qty' => 5
            ],
            [
                'hotel_id' => 38,
                'room_id' => 77, //twin
                'pax' => 11,
                'qty' => 5
            ],
            [
                'hotel_id' => 38,
                'room_id' => 187, //extra bed
                'pax' => 11,
                'qty' => 1
            ],
        ]);

        //Whiz Prime
        DB::table('room_hotel_configurations')->insert([
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 1,
                'qty' => 1
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 2,
                'qty' => 1
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 13,
                'room_id' => 125, //extra bed
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 4,
                'qty' => 2
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 5,
                'qty' => 2
            ],
            [
                'hotel_id' => 13,
                'room_id' => 125, //extra bed
                'pax' => 5,
                'qty' => 1
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 6,
                'qty' => 3
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 7,
                'qty' => 3
            ],
            [
                'hotel_id' => 13,
                'room_id' => 125, //extra bed
                'pax' => 7,
                'qty' => 1
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 8,
                'qty' => 4
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 9,
                'qty' => 4
            ],
            [
                'hotel_id' => 13,
                'room_id' => 125, //extra bed
                'pax' => 9,
                'qty' => 1
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 10,
                'qty' => 5
            ],
            [
                'hotel_id' => 13,
                'room_id' => 171, //twin
                'pax' => 11,
                'qty' => 5
            ],
            [
                'hotel_id' => 13,
                'room_id' => 125, //extra bed
                'pax' => 11,
                'qty' => 1
            ],
        ]);

        //Hotel 88
        DB::table('room_hotel_configurations')->insert([
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 1,
                'qty' => 1
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 2,
                'qty' => 1
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 16,
                'room_id' => 125, //extra bed
                'pax' => 3,
                'qty' => 1
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 4,
                'qty' => 2
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 5,
                'qty' => 2
            ],
            [
                'hotel_id' => 16,
                'room_id' => 125, //extra bed
                'pax' => 5,
                'qty' => 1
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 6,
                'qty' => 3
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 7,
                'qty' => 3
            ],
            [
                'hotel_id' => 16,
                'room_id' => 125, //extra bed
                'pax' => 7,
                'qty' => 1
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 8,
                'qty' => 4
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 9,
                'qty' => 4
            ],
            [
                'hotel_id' => 16,
                'room_id' => 125, //extra bed
                'pax' => 9,
                'qty' => 1
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 10,
                'qty' => 5
            ],
            [
                'hotel_id' => 16,
                'room_id' => 188, //twin
                'pax' => 11,
                'qty' => 5
            ],
            [
                'hotel_id' => 16,
                'room_id' => 125, //extra bed
                'pax' => 11,
                'qty' => 1
            ],
        ]);

        // Grand Padis = 10 (done)
        // Baratha Hotel = 1
        // Luminor Hotel = 32 (done)

        // Joglo Kecombrang = 11
        // Whizz Bromo = 2

        // Doho Homestay = 33
        // Whiz Prime = 13 (done)
        // Artha Cottage = 38 (done)

        // Holiday Inn = 6 (done)
        // Hotel 88 = 16 (done)
    }
}