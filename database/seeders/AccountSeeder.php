<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Account;
use Illuminate\Support\Facades\Hash;

class AccountSeeder extends Seeder
{
    public function run()
    {
        Account::create([
            'name' => 'JVTO',
            'email' => 'jvto@new-backoffice.javavolcano-touroperator.com',
            'password' => Hash::make('bismillahsukses'),
        ]);
    }
}