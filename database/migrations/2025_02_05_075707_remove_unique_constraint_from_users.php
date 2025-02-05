<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_unique'); // Ganti dengan nama unik index yang sesuai
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->unique('email'); // Untuk rollback jika diperlukan
        });
    }
};

