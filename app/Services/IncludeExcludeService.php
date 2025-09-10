<?php
// app/Services/IncludeExcludeService.php
namespace App\Services;

class IncludeExcludeService {
    public static function getIncludes(): array {
        return [
            "<b>Private Transport:</b> Air-conditioned private vehicles (MPV for 1-3 guests, Minibus for 4-11 guests) with a dedicated driver. This includes fuel, tolls, and parking fees.",
            "<b>Tour Guides:</b> Experienced English-speaking guides. For 2-3 guests, a driver-guide. For 4+ guests, a separate local guide will be provided at each main destination (Bromo, Ijen, Madakaripura).",
            "<b>Mineral Water:</b> Daily supply.",
            "<b>Complimentary Travel T-Shirt:</b> One custom travel T-shirt per participant, with customizable designs/logos.",
            "<b>Full Assistance:</b> From your arrival to your final drop-off.",
            "<b>Quality Hotel Accommodation:</b> including daily breakfast.",
            "<b>All Entrance Fees & Permits:</b> to attractions",
            "<b>Meals:</b> As mention in the itinerary",
            "<b>Private 4WD Jeep:</b> For the Mount Bromo sunrise tour.",
            "<b>Medical Check-up:</b> Ijen authorities require a doctor's health certificate. This check-up will be conveniently arranged at your hotel in Bondowoso the evening before your trek. You only need your passport",
            "<b>Trekking Equipment:</b> Gas masks and trekking poles for the Ijen Crater hike, and headlamps for the Ijen night hike. Helmets for Madakaripura Waterfall are provided by local management.",
            "<b>Ferry Tickets:</b> From Ketapang Harbour to Bali (public ferry with air-conditioned cabins)."
        ];
    }
    public static function getExcludes(): array {
        return [
            "<b>International/Domestic Air Tickets:</b> To and from your tour's starting and ending points.",
            '<b>Indonesian VISA:</b> (If applicable).',
            '<b>Travel Insurance:</b> Optional but highly recommended for peace of mind, covering trip interruptions, medical emergencies, and lost luggage.',
            '<b>Meals Not Stated in Itinerary:</b> Specific lunches and additional dinners are at your own expense.',
            "<b>Personal Expenses:</b> Such as snacks, souvenirs, beverages, laundry, etc. It is recommended to carry at least IDR 500,000 per person for these.",
            "<b>Tips:</b> For drivers and guides (at your discretion).",
        ];
    }
}
