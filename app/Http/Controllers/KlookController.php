<?php

namespace App\Http\Controllers;

use App\Services\KlookService;
use Illuminate\Http\Request;

class KlookController extends Controller
{
    protected $klookService;

    public function __construct(KlookService $klookService)
    {
        $this->klookService = $klookService;
    }

    /**
     * Fetch supplier details.
     */
    public function getSupplier()
    {
        try {
            $supplier = $this->klookService->getSupplier();
            return response()->json($supplier);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'API_ERROR',
                'errorMessage' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Fetch products.
     */
    public function getProducts()
    {
        $products = $this->klookService->getProducts();
        return response()->json($products);
    }

    /**
     * Check availability for a product.
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'productId' => 'required|string',
            'optionId' => 'required|string',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after_or_equal:startDate',
        ]);

        $availability = $this->klookService->checkAvailability(
            $request->productId,
            $request->optionId,
            $request->startDate,
            $request->endDate
        );

        return response()->json($availability);
    }

    /**
     * Create a booking.
     */
    public function createBooking(Request $request)
    {
        $request->validate([
            'productId' => 'required|string',
            'optionId' => 'required|string',
            'units' => 'required|array',
            'units.*.unitId' => 'required|string',
            'units.*.quantity' => 'required|integer|min:1',
        ]);

        $booking = $this->klookService->createBooking(
            $request->productId,
            $request->optionId,
            $request->units
        );

        return response()->json($booking);
    }

    public function getProduct(Request $request, $productId)
    {
        $product = $this->klookService->getProduct($productId);
        return response()->json($product);
    }

    public function getBooking(Request $request, $bookingId)
    {
        $booking = $this->klookService->getBooking($bookingId);
        return response()->json($booking);
    }

    public function getBookings(Request $request)
    {
        $filters = $request->all(); // Pass query parameters as filters
        $bookings = $this->klookService->getBookings($filters);
        return response()->json($bookings);
    }

    public function cancelBooking(Request $request, $bookingId)
    {
        $response = $this->klookService->cancelBooking($bookingId);
        return response()->json($response);
    }
}
