<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBookOthersActivitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('book_others_activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('others_activity_id');
            $table->integer('qty');
            $table->decimal('price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->enum('status_paid', ['paid', 'unpaid'])->nullable();
            $table->dateTime('paid_date')->nullable();
            $table->enum('is_debt', ['0', '1'])->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('others_activity_id')
                  ->references('id')->on('others_activities')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('book_others_activities');
    }
}
