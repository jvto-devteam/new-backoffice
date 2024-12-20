<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsDefaultColumnsToDestinationActivitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('destination_activities', function (Blueprint $table) {
            $table->enum('is_default_jvto', ['0', '1'])->default('0')->after('price');
            $table->enum('is_default_klook', ['0', '1'])->default('0')->after('is_default_jvto');
            $table->enum('is_default_twt', ['0', '1'])->default('0')->after('is_default_klook');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('destination_activities', function (Blueprint $table) {
            $table->dropColumn(['is_default_jvto', 'is_default_klook', 'is_default_twt']);
        });
    }
}
