<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VendorCategory;

class VendorCategorySeeder extends Seeder
{
    public function run()
    {
        $categories = ['Accommodation', 'Activities', 'Transportation', 'Others'];

        foreach ($categories as $category) {
            VendorCategory::create(['name' => $category]);
        }
    }
}
