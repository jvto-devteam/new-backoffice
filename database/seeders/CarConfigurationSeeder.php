<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CarConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $configurations = [
            // JVTO
            ['car_id' => 1, 'pax' => 2,  'price' => 480000.00, 'crew_jvto_role_id' => 5,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],
            ['car_id' => 1, 'pax' => 3,  'price' => 480000.00, 'crew_jvto_role_id' => 5,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],
            ['car_id' => 5, 'pax' => 4,  'price' => 1100000.00, 'crew_jvto_role_id' => 6,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],
            ['car_id' => 5, 'pax' => 5,  'price' => 1100000.00, 'crew_jvto_role_id' => 6,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],
            ['car_id' => 5, 'pax' => 6,  'price' => 1100000.00, 'crew_jvto_role_id' => 6,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],
            ['car_id' => 5, 'pax' => 7,  'price' => 1100000.00, 'crew_jvto_role_id' => 6,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],
            ['car_id' => 5, 'pax' => 8,  'price' => 1100000.00, 'crew_jvto_role_id' => 6,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],
            ['car_id' => 5, 'pax' => 9,  'price' => 1100000.00, 'crew_jvto_role_id' => 6,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],
            ['car_id' => 5, 'pax' => 10, 'price' => 1100000.00, 'crew_jvto_role_id' => 6,  'crew_twt_role_id' => null, 'crew_klook_role_id' => null],

            // KLOOK
            ['car_id' => 1, 'pax' => 2,  'price' => 480000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 8],
            ['car_id' => 1, 'pax' => 3,  'price' => 480000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 8],
            ['car_id' => 5, 'pax' => 4,  'price' => 1100000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 9],
            ['car_id' => 5, 'pax' => 5,  'price' => 1100000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 9],
            ['car_id' => 5, 'pax' => 6,  'price' => 1100000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 9],
            ['car_id' => 5, 'pax' => 7,  'price' => 1100000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 9],
            ['car_id' => 5, 'pax' => 8,  'price' => 1100000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 9],
            ['car_id' => 5, 'pax' => 9,  'price' => 1100000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 9],
            ['car_id' => 5, 'pax' => 10, 'price' => 1100000.00, 'crew_jvto_role_id' => null, 'crew_twt_role_id' => null, 'crew_klook_role_id' => 9],
        ];

        foreach ($configurations as &$config) {
            $config['created_at'] = now();
            $config['updated_at'] = now();
        }

        DB::table('car_configurations')->insert($configurations);
    }
}
