<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_partners', function (Blueprint $table) {
            $table->enum('updated_password', ['0', '1'])->default('0')->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('user_partners', function (Blueprint $table) {
            $table->dropColumn('updated_password');
        });
    }
};
