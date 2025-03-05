<?php

namespace Database\Seeders;

use App\Models\Folder;
use App\Models\FolderType;
use Illuminate\Database\Seeder;

class FolderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat folder root
        $root = Folder::create([
            'name' => 'root',
            'path' => '/',
            'is_system_folder' => true,
        ]);

        // Buat folder utama
        $orderChannels = Folder::create([
            'name' => 'order_channels',
            'parent_id' => $root->id,
            'folder_type_id' => FolderType::where('name', 'default')->first()->id,
            'path' => '/',
            'is_system_folder' => true,
        ]);

        $reports = Folder::create([
            'name' => 'reports',
            'parent_id' => $root->id,
            'folder_type_id' => FolderType::where('name', 'default')->first()->id,
            'path' => '/',
            'is_system_folder' => true,
        ]);

        $sharedResources = Folder::create([
            'name' => 'shared_resources',
            'parent_id' => $root->id,
            'folder_type_id' => FolderType::where('name', 'default')->first()->id,
            'path' => '/',
            'is_system_folder' => true,
        ]);

        // Folder untuk order channels
        $channels = ['JVTO', 'Klook', 'TWT'];
        foreach ($channels as $channel) {
            $channelFolder = Folder::create([
                'name' => $channel,
                'parent_id' => $orderChannels->id,
                'folder_type_id' => FolderType::where('name', 'default')->first()->id,
                'path' => '/' . $orderChannels->name . '/',
                'is_system_folder' => true,
            ]);

            // Subfolder untuk setiap channel
            $subfolders = ['bookings', 'schedules', 'invoices', 'expenses', 'crew_vehicle_assignments'];
            foreach ($subfolders as $subfolder) {
                Folder::create([
                    'name' => $subfolder,
                    'parent_id' => $channelFolder->id,
                    'folder_type_id' => FolderType::where('name', $subfolder)->first()->id,
                    'path' => '/' . $orderChannels->name . '/' . $channelFolder->name . '/',
                    'is_system_folder' => true,
                ]);
            }
        }

        // Folder untuk reports
        $reportFolders = ['financial_reports', 'customer_statistics'];
        foreach ($reportFolders as $folder) {
            Folder::create([
                'name' => $folder,
                'parent_id' => $reports->id,
                'folder_type_id' => FolderType::where('name', $folder)->first()->id,
                'path' => '/' . $reports->name . '/',
                'is_system_folder' => true,
            ]);
        }

        // Folder untuk shared resources
        $resourceFolders = ['accommodations', 'destinations', 'activities', 'assets'];
        foreach ($resourceFolders as $folder) {
            Folder::create([
                'name' => $folder,
                'parent_id' => $sharedResources->id,
                'folder_type_id' => FolderType::where('name', $folder)->first()->id,
                'path' => '/' . $sharedResources->name . '/',
                'is_system_folder' => true,
            ]);
        }
    }
}
