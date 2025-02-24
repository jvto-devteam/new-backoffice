<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class KlookService
{
    protected $baseUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('klook.base_url');
        $this->apiKey = config('klook.api_key');
    }

    /**
     * Make a request to the Klook API.
     */
    protected function makeRequest($method, $endpoint, $data = [])
    {
        $url = $this->baseUrl . $endpoint;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
            'Octo-Capabilities' => 'octo/pricing,octo/content',
        ])->$method($url, $data);

        if ($response->failed()) {
            $errorCode = $response->json()['error'] ?? 'UNKNOWN_ERROR';
            $errorMessage = $response->json()['errorMessage'] ?? 'An unknown error occurred.';
            throw new \Exception("Klook API Error ({$errorCode}): {$errorMessage}");
        }

        return $response->json();
    }

    /**
     * Get supplier details.
     */
    public function getSupplier()
    {
        return $this->makeRequest('GET', '/supplier');
    }

    /**
     * Get products.
     */
    public function getProducts()
    {
        return $this->makeRequest('GET', '/products');
    }

    /**
     * Check availability for a product.
     */
    public function checkAvailability($productId, $optionId, $startDate, $endDate)
    {
        return $this->makeRequest('POST', '/availability', [
            'productId' => $productId,
            'optionId' => $optionId,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    /**
     * Create a booking.
     */
    public function createBooking($productId, $optionId, $units)
    {
        return $this->makeRequest('POST', '/bookings', [
            'productId' => $productId,
            'optionId' => $optionId,
            'units' => $units,
        ]);
    }

    public function getProduct($productId)
    {
        return $this->makeRequest('GET', "/products/{$productId}");
    }

    public function getBooking($bookingId)
    {
        return $this->makeRequest('GET', "/bookings/{$bookingId}");
    }

    public function getBookings($filters = [])
    {
        return $this->makeRequest('GET', '/bookings', $filters);
    }

    public function cancelBooking($bookingId)
    {
        return $this->makeRequest('POST', "/bookings/{$bookingId}/cancel");
    }
}
