<?php

namespace Database\Factories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'booking_code'        => strtoupper($this->faker->bothify('???######')),
            'invoice_code_origin' => null,
            'total_pax'           => $this->faker->numberBetween(1, 10),
            'dp'                  => 0,
            'dp_no_idr'           => 0,
            'grand_total'         => $this->faker->numberBetween(500000, 10000000),
            'total_expense_debt_paid' => 0,
        ];
    }
}
