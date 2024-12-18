<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CrewRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('crew_roles')->insert([
            // The Window Travel Channel
            [
                'crew_role_code' => 'CRW_001',
                'order_channel_id' => 2,
                'role' => 'Driver cum guide',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 313000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'crew_role_code' => 'CRW_002',
                'order_channel_id' => 2,
                'role' => 'Escort Guide (Sr)',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 275000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'crew_role_code' => 'CRW_003',
                'order_channel_id' => 2,
                'role' => 'Escort Guide (Jr)',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 250000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'crew_role_code' => 'CRW_004',
                'order_channel_id' => 2,
                'role' => 'Small car',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 200000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // JVTO Channel
            [
                'crew_role_code' => 'CRW_005',
                'order_channel_id' => 1,
                'role' => 'Driver cum guide',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 313000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'crew_role_code' => 'CRW_006',
                'order_channel_id' => 1,
                'role' => 'Escort Guide',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 250000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'crew_role_code' => 'CRW_007',
                'order_channel_id' => 1,
                'role' => 'Driver + Guide',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 400000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // KLOOK Channel
            [
                'crew_role_code' => 'CRW_008',
                'order_channel_id' => 3,
                'role' => 'Driver cum guide',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 313000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'crew_role_code' => 'CRW_009',
                'order_channel_id' => 3,
                'role' => 'Escort Guide',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 250000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'crew_role_code' => 'CRW_010',
                'order_channel_id' => 3,
                'role' => 'Driver + Guide',
                'unit' => 'Day x Qty',
                'formula' => 'days * qty * rate',
                'rate' => 400000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
