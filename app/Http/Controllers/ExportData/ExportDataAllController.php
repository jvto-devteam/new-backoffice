<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Response;
use ZipStream\ZipStream;
use ZipStream\Option\Archive as ArchiveOptions;

class ExportDataAllController extends Controller
{
    public function all()
    {
        $baseUrl = url('/export-data'); // prefix route kamu
        $endpoints = [
            'hotels/hotels.csv' => $baseUrl . '/hotels/hotels',
            'hotels/room_types.csv' => $baseUrl . '/hotels/room-types',
            'vehicles/vehicle_types.csv' => $baseUrl . '/vehicles/vehicle-types',
            'vehicles/vehicle_units.csv' => $baseUrl . '/vehicles/vehicle-units',
            'crews/crew_roles.csv' => $baseUrl . '/crews/crew-roles',
            'crews/crew_member.csv' => $baseUrl . '/crews/crew-member',
            'crews/crew_member_roles.csv' => $baseUrl . '/crews/crew-member-roles',
            'destinations/destinations.csv' => $baseUrl . '/destinations/destinations',
            'countries/countries.csv' => $baseUrl . '/countries/countries',
            'customers/customers.csv' => $baseUrl . '/customers/customers',
            'packages/package_categories.csv' => $baseUrl . '/packages/package-categories',
            'packages/packages.csv' => $baseUrl . '/packages/packages',
            'packages/package_images.csv' => $baseUrl . '/packages/package-images',
            'packages/package_includes.csv' => $baseUrl . '/packages/package-includes',
            'packages/package_excludes.csv' => $baseUrl . '/packages/package-excludes',
            'packages/package_addons.csv' => $baseUrl . '/packages/package-addons',
            'include-exclude/item_includes.csv' => $baseUrl . '/include-exclude/item-includes',
            'include-exclude/item_excludes.csv' => $baseUrl . '/include-exclude/item-excludes',
            'addons/addons.csv' => $baseUrl . '/addons/addons',
            'price-tiers/price_tiers.csv' => $baseUrl . '/price-tiers/price-tiers',
        ];

        $options = new ArchiveOptions();
        $options->setSendHttpHeaders(true);

        $zip = new ZipStream('export_data_all.zip', $options);

        foreach ($endpoints as $filename => $url) {
            $response = Http::get($url);
            if ($response->ok()) {
                $zip->addFile($filename, $response->body());
            } else {
                $zip->addFile($filename, "Error fetching $url");
            }
        }

        $zip->finish();
        return response()->noContent(); // karena ZipStream langsung stream ke browser
    }
}
