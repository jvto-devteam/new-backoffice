<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccommodationSeeder extends Seeder
{
    public function run()
    {
        // Menambahkan data ke tabel accommodations
        $accommodations = [
            // Kategori A1 (Ijen)
            ['category_id' => 1, 'accommodation_name' => 'Astons Banyuwangi'],
            ['category_id' => 1, 'accommodation_name' => 'Grand Padis'],
            ['category_id' => 1, 'accommodation_name' => 'Baratha'],

            // Kategori A2 (Bromo)
            ['category_id' => 2, 'accommodation_name' => 'Joglo Kecombrang'],
            ['category_id' => 2, 'accommodation_name' => 'Bromo Terrace'],
            ['category_id' => 2, 'accommodation_name' => 'Manis Ae Bromo'],
            ['category_id' => 2, 'accommodation_name' => 'Whiz Bromo'],

            // Kategori A3 (Lumajang/Malang/Jember)
            ['category_id' => 3, 'accommodation_name' => 'Atria Malang'],
            ['category_id' => 3, 'accommodation_name' => '101 Malang'],
            ['category_id' => 3, 'accommodation_name' => 'Artha Cottage'],
            ['category_id' => 3, 'accommodation_name' => 'Doho Homestay'],
            ['category_id' => 3, 'accommodation_name' => 'Yanto'],
            ['category_id' => 3, 'accommodation_name' => 'Whiz Prime Malang'],

            // Kategori A4 (Surabaya)
            ['category_id' => 4, 'accommodation_name' => 'Holiday Inn'],
            ['category_id' => 4, 'accommodation_name' => 'Harris'],
        ];

        foreach ($accommodations as $accommodation) {
            DB::table('accommodations')->insert([
                'category_id' => $accommodation['category_id'],
                'accommodation_name' => $accommodation['accommodation_name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
