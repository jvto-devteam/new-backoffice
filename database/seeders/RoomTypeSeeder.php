<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomTypeSeeder extends Seeder
{
    public function run()
    {
        // Data untuk room types
        $room_types = [
            // Kategori A1 (Ijen)
            ['accommodation_id' => 1, 'room_type' => 'Double/Twin Studio', 'rate_per_night' => 525000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 1, 'room_type' => 'Double/Twin Premiere', 'rate_per_night' => 625000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 1, 'room_type' => 'Triple Family', 'rate_per_night' => 700000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 2, 'room_type' => 'Double/Twin', 'rate_per_night' => 435000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 2, 'room_type' => 'Extra Bed', 'rate_per_night' => 300000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => false],
            ['accommodation_id' => 3, 'room_type' => 'Superior', 'rate_per_night' => 250000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 3, 'room_type' => 'Deluxe', 'rate_per_night' => 275000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 3, 'room_type' => 'Family', 'rate_per_night' => 450000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 3, 'room_type' => 'Apartment', 'rate_per_night' => 450000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],

            // Kategori A2 (Bromo)
            ['accommodation_id' => 4, 'room_type' => 'Deluxe', 'rate_per_night' => 750000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 4, 'room_type' => 'Family', 'rate_per_night' => 950000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 4, 'room_type' => 'Extra Bed', 'rate_per_night' => 300000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => false],
            ['accommodation_id' => 5, 'room_type' => 'Deluxe Twin', 'rate_per_night' => 1250000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 5, 'room_type' => 'Deluxe Double', 'rate_per_night' => 1200000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 5, 'room_type' => 'Deluxe Double Hillview', 'rate_per_night' => 1350000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 5, 'room_type' => 'Extra Bed', 'rate_per_night' => 300000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => false],
            ['accommodation_id' => 6, 'room_type' => 'Single Cabin', 'rate_per_night' => 1220000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => false],
            ['accommodation_id' => 6, 'room_type' => 'Family Cabin', 'rate_per_night' => 1620000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 7, 'room_type' => 'Superior', 'rate_per_night' => 550000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],

            // Kategori A3 (Lumajang/Malang/Jember)
            ['accommodation_id' => 8, 'room_type' => 'Deluxe', 'rate_per_night' => 610000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 8, 'room_type' => 'Extra Bed', 'rate_per_night' => 350000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => false],
            ['accommodation_id' => 9, 'room_type' => 'Without Breakfast', 'rate_per_night' => 600000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => false],
            ['accommodation_id' => 10, 'room_type' => 'Deluxe', 'rate_per_night' => 425000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 11, 'room_type' => 'Deluxe', 'rate_per_night' => 260000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 11, 'room_type' => 'Executive', 'rate_per_night' => 300000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 11, 'room_type' => 'Emerald', 'rate_per_night' => 316000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 11, 'room_type' => 'Platinum', 'rate_per_night' => 380000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 11, 'room_type' => 'Family', 'rate_per_night' => 440000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 12, 'room_type' => 'Cottage incl. dinner', 'rate_per_night' => 450000, 'include_breakfast' => true, 'include_dinner' => false, 'extra_bed_option' => true],
            ['accommodation_id' => 12, 'room_type' => 'Deluxe Twin/Double incl. dinner', 'rate_per_night' => 350000, 'include_breakfast' => true, 'include_dinner' => false, 'extra_bed_option' => true],
            ['accommodation_id' => 13, 'room_type' => 'Deluxe (with breakfast)', 'rate_per_night' => 540000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 13, 'room_type' => 'Deluxe (without breakfast)', 'rate_per_night' => 490000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 13, 'room_type' => 'Superior (with breakfast)', 'rate_per_night' => 440000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 13, 'room_type' => 'Superior (without breakfast)', 'rate_per_night' => 390000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],

            // Kategori A4 (Surabaya)
            ['accommodation_id' => 14, 'room_type' => 'Double/Twin', 'rate_per_night' => 495000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
            ['accommodation_id' => 15, 'room_type' => 'First 9 rooms (2024)', 'rate_per_night' => 680000, 'include_breakfast' => true, 'include_dinner' => true, 'extra_bed_option' => true],
        ];

        // Insert ke database
        DB::table('room_types')->insert($room_types);
    }
}
