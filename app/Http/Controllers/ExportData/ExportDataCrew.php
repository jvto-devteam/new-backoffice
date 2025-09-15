<?php

namespace App\Http\Controllers\ExportData;

use App\Http\Controllers\Controller;
use App\Models\CarConfiguration;
use App\Models\CrewRole;
use App\Models\GuideDriver;
use Illuminate\Http\Request;

class ExportDataCrew extends Controller
{
    function crewRoles()
    {
        $role = CrewRole::with('orderChannel')->orderBy('id', 'asc');

        if (request()->limit) {
            $role = $role->limit(request()->limit);
        }
        $role = $role
            ->get()->map(function ($query) {
                return [
                    'id' => $query->id,
                    'name' => $query->role,
                    'rate_per_day' => (int)$query->rate,
                    'rate_twt_per_day' => (int)$query->rate_twt,
                    'order_channel_id' => $query->order_channel_id,
                    'created_at' => $query->created_at,
                    'updated_at' => $query->updated_at,
                    'deleted_at' => $query->deleted_at,
                ];
            });
        $columns = ['id', 'name', 'rate_per_day', 'rate_twt_per_day', 'order_channel_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('crew_roles.csv', $columns, $role);
    }
    function crewMember()
    {
        $crew = GuideDriver::orderBy('id', 'asc');

        if (request()->limit) {
            $crew = $crew->limit(request()->limit);
        }
        $crew = $crew
            ->get()->map(function ($query) {
                return [
                    'id' => $query->id,
                    'name' => $query->name,
                    'email' => $query->email,
                    'type' => $query->is_driver == '1' ? 'driver' : 'guide',
                    'tags' => $query->tags,
                    'phone' => $query->phone,
                    'photo_url' => $query->photo ? '/img/crews/' . $query->photo : '/img/crews/default.jpg',
                    'created_at' => $query->created_at,
                    'updated_at' => $query->updated_at,
                    'deleted_at' => $query->deleted_at,
                ];
            });
        $columns = ['id', 'name', 'email', 'type', 'phone', 'photo_url', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('crew_members.csv', $columns, $crew);
    }
    function crewMemberRoles()
    {
        $crews = [
            ["id" => 1, "name" => "Yandi", "crew_roles" => [1, 5, 8]],
            ["id" => 3, "name" => "Anjas", "crew_roles" => [2, 3, 6, 9]],
            ["id" => 4, "name" => "Taufik", "crew_roles" => [2, 3, 6, 9]],
            ["id" => 7, "name" => "Fredi", "crew_roles" => [1, 5, 8]],
            ["id" => 9, "name" => "GARAGE", "crew_roles" => []],
            ["id" => 13, "name" => "Rendi", "crew_roles" => [3, 6, 9]],
            ["id" => 17, "name" => "Kiki", "crew_roles" => [2, 3, 6, 9]],
            ["id" => 28, "name" => "Holili", "crew_roles" => [11, 12]],
            ["id" => 39, "name" => "Gufron", "crew_roles" => [3, 6, 9]],
            ["id" => 46, "name" => "Fauzi", "crew_roles" => [3, 6, 9]],
            ["id" => 56, "name" => "Local Ijen", "crew_roles" => []],
            ["id" => 58, "name" => "Johan", "crew_roles" => [13, 14]],
            ["id" => 62, "name" => "Yusuf", "crew_roles" => [13, 14]],
            ["id" => 63, "name" => "Maman", "crew_roles" => [13, 14]],
            ["id" => 64, "name" => "Adim", "crew_roles" => [13, 14]],
            ["id" => 66, "name" => "Angga", "crew_roles" => [13, 14]],
            ["id" => 68, "name" => "Boy", "crew_roles" => [3, 6, 9]],
            ["id" => 72, "name" => "Dika", "crew_roles" => [13, 14]],
            ["id" => 73, "name" => "Joyo", "crew_roles" => [11, 12]],
            ["id" => 75, "name" => "Didin", "crew_roles" => [11, 12]],
            ["id" => 76, "name" => "Saichul", "crew_roles" => [13, 14]],
            ["id" => 77, "name" => "Prasojo", "crew_roles" => [13, 14]],
            ["id" => 78, "name" => "Dodo", "crew_roles" => [13, 14]],
        ];
        $crew_role_pivot = [];
        $id = 1;

        foreach ($crews as $crew) {
            foreach ($crew['crew_roles'] as $role) {
                $crew_role_pivot[] = [
                    "id" => $id++,
                    "crew_member_id" => $crew['id'],
                    "crew_role_id" => $role,
                    "created_at" => null,
                    "updated_at" => null,
                    "deleted_at" => null,
                ];
            }
        }

        $columns = ['id', 'crew_member_id', 'crew_role_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('crew_member_roles.csv', $columns, $crew_role_pivot);
    }
    function transportCrewRules()
    {
        $vehicleTypes = [
            'MPV' => 1,
            'Innova' => 2,
            'Hiace' => 3,
            'Hiace Premio' => 4,
            'Medium Bus' => 5,
            'Mini Bus (Elf)' => 6,
        ];
        $carConfigunations = CarConfiguration::orderBy('id', 'asc');
        if (request()->limit) {
            $carConfigunations = $carConfigunations->limit(request()->limit);
        }
        $carConfigunations = $carConfigunations
            ->get()->map(function ($data) use ($vehicleTypes) {
                return [
                    'id' => $data->id,
                    'pax' => $data->pax,
                    'vehicle_type_id' => $vehicleTypes[$data->car->car_name] ?? $data->car->car_name,
                    'crew_role_id' => $data->crew_jvto_role_id ?? $data->crew_klook_role_id,
                    'order_channel_id' => $data->crew_jvto_role_id ? 1 : 3,
                    'created_at' => $data->created_at,
                    'updated_at' => $data->updated_at,
                    'deleted_at' => null
                ];
            })->toArray();
        $appendConfigs = [];
        $id = 24;
        for ($i = 1; $i <= 10; $i++) {
            $id++;
            if ($i <= 2) {
                // 1-2 pax MPV, Crew Role 1
                $vehicleTypeId = $vehicleTypes['MPV'];
                $crewRoleId = 1;
            } elseif ($i == 3) {
                // 3 pax Innova, Crew Role 1
                $vehicleTypeId = $vehicleTypes['Innova'];
                $crewRoleId = 1;
            } elseif ($i >= 4 && $i <= 7) {
                // 4-7 pax Hiace, Crew Role 2
                $vehicleTypeId = $vehicleTypes['Hiace'];
                $crewRoleId = 2;
            } elseif ($i >= 8 && $i <= 9) {
                // 8-10 pax Hiace Premio, Crew Role 2
                $vehicleTypeId = $vehicleTypes['Hiace Premio'];
                $crewRoleId = 2;
            } else {
                // pax 10 MPV, Crew Role 4
                $vehicleTypeId = $vehicleTypes['MPV'];
                $crewRoleId = 4;
            }

            $appendConfigs[] = [
                'id' => $id,
                'pax' => $i,
                'vehicle_type_id' => $vehicleTypeId,
                'crew_role_id' => $crewRoleId,
                'order_channel_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
                'deleted_at' => null,
            ];
        }

        $carConfigunations = array_merge($carConfigunations, $appendConfigs);
        $columns = ['id', 'pax', 'vehicle_type_id', 'crew_role_id', 'order_channel_id', 'created_at', 'updated_at', 'deleted_at'];
        return ExportCSV::export('transport_crew_rules.csv', $columns, $carConfigunations);
    }
}
