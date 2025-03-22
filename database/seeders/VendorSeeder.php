<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vendor;
use App\Models\VendorCategory;

class VendorSeeder extends Seeder
{
    public function run()
    {
        $data = [
            'Accommodation' => ['Baratha Hotel', 'Joglo Kecombrang', 'Riverside'],
            'Activities' => ['Widhi Bromo', 'Ijen Ticket'],
            'Transportation' => ['Garage'],
            'Others' => ['Kubik'],
        ];

        foreach ($data as $categoryName => $vendors) {
            $category = VendorCategory::where('name', $categoryName)->first();
            if ($category) {
                foreach ($vendors as $vendor) {
                    Vendor::create([
                        'vendor_category_id' => $category->id,
                        'name' => $vendor,
                    ]);
                }
            }
        }
    }
}
