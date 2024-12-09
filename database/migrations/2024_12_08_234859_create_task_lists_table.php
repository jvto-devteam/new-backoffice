<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTaskListsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('task_lists', function (Blueprint $table) {
            $table->id(); // Auto-increment primary key
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade'); // Foreign key to tasks table
            $table->text('list_text'); // Text for each list item
            $table->boolean('is_completed')->default(false); // Completion status
            $table->timestamps(); // Includes created_at and updated_at columns
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('task_lists');
    }
}
