<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsTwtDestinationsOthersActivities extends Migration
{
    public function up()
    {
        Schema::table('destination_activities', function (Blueprint $table) {
            $table->enum('is_twt', ['0', '1'])->default('0')->after('price');
        });

        Schema::table('others_activities', function (Blueprint $table) {
            $table->enum('is_twt', ['0', '1'])->default('0')->after('price');
        });
    }

    public function down()
    {
        Schema::table('destination_activities', function (Blueprint $table) {
            $table->dropColumn('is_twt');
        });

        Schema::table('others_activities', function (Blueprint $table) {
            $table->dropColumn('is_twt');
        });
    }
}
