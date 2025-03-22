<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('others_activities', function (Blueprint $table) {
            $table->foreignId('vendor_id')->nullable()->after('other_activity_code')->constrained('vendors');
        });
    }

    public function down()
    {
        Schema::table('others_activities', function (Blueprint $table) {
            $table->dropForeign(['vendor_id']);
            $table->dropColumn('vendor_id');
        });
    }
};
