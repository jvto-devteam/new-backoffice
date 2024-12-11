<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AccommodationCategory;
use App\Models\Accommodation;
use App\Models\RoomType;

class AccommodationController extends Controller
{
    /**
     * Generate accommodation data based on category.
     *
     * @param string $categoryCode
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Fetch all categories with their accommodations and room types
//        $data = AccommodationCategory::with(['accommodations.roomTypes'])
//            ->get()
//            ->map(function ($category) {
//                return [
//                    'CategoryID' => $category->id,
//                    'CategoryCode' => $category->category_code,
//                    'CategoryName' => $category->category_name,
//                    'Accommodations' => $category->accommodations->map(function ($accommodation) {
//                        // Pastikan roomTypes ada dan tidak kosong
//                        return $accommodation->roomTypes->map(function ($roomType) use ($accommodation) {
//                            return [
//                                'AccommodationID' => $accommodation->id,
//                                'AccommodationName' => $accommodation->accommodation_name,
//                                'RoomType' => $roomType->room_type,
//                                'RatePerNight' => number_format($roomType->rate_per_night, 0, ',', '.')
//                            ];
//                        });
//                    })->flatten(1)
//                ];
//            });
//
//        return response()->json($data);

        return AccommodationCategory::with(['accommodations', 'accommodations.roomTypes'])
            ->get();
    }
}
