<?php

namespace Database\Seeders;

use App\Models\FolderType;
use Illuminate\Database\Seeder;

class FolderTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $folderTypes = [
            [
                'name' => 'default',
                'icon_name' => 'Folder',
                'icon_color' => 'text-amber-500',
            ],
            [
                'name' => 'bookings',
                'icon_name' => 'FileText',
                'icon_color' => 'text-blue-500',
            ],
            [
                'name' => 'schedules',
                'icon_name' => 'Calendar',
                'icon_color' => 'text-green-500',
            ],
            [
                'name' => 'invoices',
                'icon_name' => 'DollarSign',
                'icon_color' => 'text-red-500',
            ],
            [
                'name' => 'expenses',
                'icon_name' => 'DollarSign',
                'icon_color' => 'text-orange-500',
            ],
            [
                'name' => 'crew_vehicle_assignments',
                'icon_name' => 'Truck',
                'icon_color' => 'text-purple-500',
            ],
            [
                'name' => 'financial_reports',
                'icon_name' => 'BarChart2',
                'icon_color' => 'text-indigo-500',
            ],
            [
                'name' => 'customer_statistics',
                'icon_name' => 'Users',
                'icon_color' => 'text-pink-500',
            ],
            [
                'name' => 'accommodations',
                'icon_name' => 'Building',
                'icon_color' => 'text-yellow-500',
            ],
            [
                'name' => 'destinations',
                'icon_name' => 'Map',
                'icon_color' => 'text-cyan-500',
            ],
            [
                'name' => 'activities',
                'icon_name' => 'Activity',
                'icon_color' => 'text-lime-500',
            ],
            [
                'name' => 'assets',
                'icon_name' => 'Image',
                'icon_color' => 'text-fuchsia-500',
            ],
        ];

        foreach ($folderTypes as $folderType) {
            FolderType::create($folderType);
        }
    }
}
