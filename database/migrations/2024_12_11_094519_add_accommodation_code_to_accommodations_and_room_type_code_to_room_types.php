<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAccommodationCodeToAccommodationsAndRoomTypeCodeToRoomTypes extends Migration
{
    /**
     * Jalankan migrasi.
     *
     * @return void
     */
    public function up()
    {
        // Menambahkan kolom accommodation_code ke tabel accommodations
        Schema::table('accommodations', function (Blueprint $table) {
            $table->string('accommodation_code')->nullable()->after('accommodation_id'); // Setelah kolom id
        });

        // Menambahkan kolom room_type_code ke tabel room_types
        Schema::table('room_types', function (Blueprint $table) {
            $table->string('room_type_code')->nullable()->after('room_type_id'); // Setelah kolom id
        });
    }

    /**
     * Membatalkan migrasi.
     *
     * @return void
     */
    public function down()
    {
        // Menghapus kolom accommodation_code dari tabel accommodations
        Schema::table('accommodations', function (Blueprint $table) {
            $table->dropColumn('accommodation_code');
        });

        // Menghapus kolom room_type_code dari tabel room_types
        Schema::table('room_types', function (Blueprint $table) {
            $table->dropColumn('room_type_code');
        });
    }
}
