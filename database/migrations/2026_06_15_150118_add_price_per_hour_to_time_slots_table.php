<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('time_slots', function (Blueprint $table) {
            // Per-slot hourly rate. Null inherits the court's base rate;
            // set to charge a premium (e.g. evening / peak hours).
            $table->decimal('price_per_hour', 8, 2)->nullable()->after('end_time');
        });
    }

    public function down(): void
    {
        Schema::table('time_slots', function (Blueprint $table) {
            $table->dropColumn('price_per_hour');
        });
    }
};
