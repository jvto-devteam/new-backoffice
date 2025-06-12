import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, Car, AlertTriangle, RefreshCw, Search, Filter, ChevronRight, MapPin, Phone, Mail, DollarSign, Clock, Moon, Sun, X, ChevronDown, Building, Plane, Hotel, CreditCard } from 'lucide-react';
import Main from "@/Layouts/Main";

// Combined and updated booking data
// const bookingData = [
//     {
//         "booking_id": 1053,
//         "id": "KLOOK-1053",
//         "orderChannel": "KLOOK",
//         "guest_id": "1094",
//         "guest": "NASAZLI RAHMAT",
//         "guestDetails": { "id": 1094, "name": "NASAZLI RAHMAT", "phone": "+60164461005", "email": "nashville032010@gmail.com", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "3",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfall & Mount Bromo from Surabaya",
//         "booking_date": "09 Apr 2025",
//         "date": { "start_ymd": "2025-06-01", "end_ymd": "2025-06-04", "start": "01 Jun 25", "end": "04 Jun 25", "days": "Sun - Wed" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:10", "text": "Surabaya Airport Terminal 2 MH871" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "15:00", "text": "Surabaya Hotel Terminal 2" },
//         "itinerary": [
//             { "day": "1", "date": "01 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso", "activity": "Surabaya", "destination": "Surabaya" },
//             { "day": "2", "date": "02 Jun 2025", "itinerary": "Ijen Crater - Papuma Beach Sunset", "activity": "Ijen Crater Hike", "destination": "Mount Ijen" },
//         ],
//         "hotels": [{ "day": "1", "checkIn": "01 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [{ "roomName": "Apartment", "quantity": "1" }], "meals": ["Breakfast", "Dinner"] }],
//         "vehicles": ["Daihatsu Sigra"],
//         "drivers": [{ "id": 73, "name": "Joyo", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/default.jpg" }],
//         "guides": [{ "id": 13, "name": "Rendi", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/rendi.jpg" }],
//         "financial": { "payment": "10320000", "balance": "0", "invoice": { "total": 10320000 }, "expense": { "total": "7590000" }, "profit": 2730000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 881,
//         "id": "TWT-881",
//         "orderChannel": "TWT",
//         "guest_id": "941",
//         "guest": "Liu Po-Yen",
//         "guestDetails": { "id": 941, "name": "Liu Po-Yen", "phone": null, "email": null, "country_id": null, "country": null },
//         "total_pax": "2",
//         "duration": "5D 4N",
//         "package": "5D 4N Package",
//         "booking_date": "17 Aug 2024",
//         "date": { "start_ymd": "2025-06-03", "end_ymd": "2025-06-07", "start": "03 Jun 25", "end": "07 Jun 25", "days": "Tue - Sat" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "17:05", "text": "Surabaya Airport Terminal 2 QZ323" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "10:20", "text": "Surabaya Airport Terminal 2 QZ324" },
//         "itinerary": [{ "day": "1", "date": "03 Jun 2025", "itinerary": "Surabaya Airport - Malang City", "activity": "Surabaya", "destination": "Surabaya" }],
//         "hotels": [{ "day": "1", "checkIn": "03 Jun 2025", "hotelId": 59, "hotel": "THE 1O1 Malang OJ", "rooms": [{ "roomName": "Deluxe Double Room", "quantity": "1" }], "meals": [] }],
//         "vehicles": ["Ertiga"],
//         "drivers": [{ "id": 7, "name": "Fredi", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/fredi.jpg" }],
//         "guides": [{ "id": 46, "name": "Fauzi", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/fauzi.jpg" }],
//         "financial": { "payment": "5000000", "balance": "5882000", "invoice": { "total": 10882000 }, "expense": { "total": "8335500" }, "profit": 2546500 },
//         "paymentHistory": [{ "id": 314, "booking_id": "881", "nominal": "5000000", "paymentMethod": "Debit/Credit Card", "description": "Payment", "date": "21 May 25 19:44" }],
//         "notes": null
//     },
//     {
//         "booking_id": 1152,
//         "id": "KLOOK-1152",
//         "orderChannel": "KLOOK",
//         "guest_id": "1257",
//         "guest": "Elomari Garcia Laila Isabel",
//         "guestDetails": { "id": 1257, "name": "Elomari Garcia Laila Isabel", "phone": "+447950828743", "email": "lailaelomari@live.co.uk", "country_id": 231, "country": "United Kingdom" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfall & Mount Bromo from Surabaya",
//         "booking_date": "23 May 2025",
//         "date": { "start_ymd": "2025-06-04", "end_ymd": "2025-06-07", "start": "04 Jun 25", "end": "07 Jun 25", "days": "Wed - Sat" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Leedon Hotel & Suites Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Leedon Hotel & Suites Surabaya" },
//         "itinerary": [{ "day": "1", "date": "04 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" }],
//         "hotels": [{ "day": "1", "checkIn": "04 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [{ "roomName": "Deluxe Double", "quantity": "1" }], "meals": ["Breakfast", "Dinner"] }],
//         "vehicles": ["Avanza Sub"],
//         "drivers": [{ "id": 58, "name": "Johan", "tags": "JVTO,KLOOK", "photo": "https://example.com/johan.jpg" }],
//         "guides": [{ "id": 56, "name": "Local Ijen", "type": "Ijen", "tags": "TWT,JVTO,KLOOK", "photo": "https://example.com/default.jpg" }],
//         "financial": { "payment": "7500000", "balance": "0", "invoice": { "total": 7500000 }, "expense": { "total": "6625000" }, "profit": 875000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 907,
//         "id": "TWT-907",
//         "orderChannel": "TWT",
//         "guest_id": "961",
//         "guest": "Meng Ming-Yi (Sky)",
//         "guestDetails": { "id": 961, "name": "Meng Ming-Yi (Sky)", "phone": null, "email": null, "country_id": null, "country": null },
//         "total_pax": "14",
//         "duration": "5D 4N",
//         "package": "5D 4N Package",
//         "booking_date": "26 Dec 2024",
//         "date": { "start_ymd": "2025-06-04", "end_ymd": "2025-06-08", "start": "04 Jun 25", "end": "08 Jun 25", "days": "Wed - Sun" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "10:20", "text": "Surabaya Airport Terminal 2 JT645" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "05:30", "text": "Surabaya Airport Terminal 2 CX780" },
//         "itinerary": [{ "day": "1", "date": "04 Jun 2025", "itinerary": "Surabaya Airport - Malang City" }],
//         "hotels": [{ "day": "1", "checkIn": "04 Jun 2025", "hotelId": 59, "hotel": "THE 1O1 Malang OJ", "rooms": [{ "roomName": "Deluxe Double Room", "quantity": "5" }], "meals": [] }],
//         "vehicles": ["Premio"],
//         "drivers": [{ "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://example.com/default.jpg" }],
//         "guides": [{ "id": 4, "name": "Taufik", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/taufik.jpg" }],
//         "financial": { "payment": "0", "balance": "57014000", "invoice": { "total": 57014000 }, "expense": { "total": "51002500" }, "profit": 6011500 },
//         "paymentHistory": [],
//         "notes": "Pre-book 14 horses @ IDR250k/horse (Payable by Sky)"
//     },
//     {
//         "booking_id": 1119,
//         "id": "KLOOK-1119",
//         "orderChannel": "KLOOK",
//         "guest_id": "1149",
//         "guest": "Olivia Ong",
//         "guestDetails": { "id": 1149, "name": "Olivia Ong", "phone": "+6594313182", "email": "foongkeaw@yahoo.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "3",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "05 May 2025",
//         "date": { "start_ymd": "2025-06-05", "end_ymd": "2025-06-07", "start": "05 Jun 25", "end": "07 Jun 25", "days": "Thu - Sat" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Ascott Waterway Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Ascott Waterway Surabaya" },
//         "itinerary": [{ "day": "1", "date": "05 Jun 2025", "itinerary": "Surabaya Hotel - Madakaripura - Bromo Area" }],
//         "hotels": [{ "day": "1", "checkIn": "05 Jun 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [{ "roomName": "Family", "quantity": "1" }], "meals": ["Breakfast"] }],
//         "vehicles": ["Xenia"],
//         "drivers": [{ "id": 1, "name": "Yandi", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/yandi.jpg" }],
//         "guides": [{ "id": 56, "name": "Local Ijen", "type": "Ijen", "tags": "TWT,JVTO,KLOOK", "photo": "https://example.com/default.jpg" }],
//         "financial": { "payment": "7740000", "balance": "0", "invoice": { "total": 7740000 }, "expense": { "total": "6100000" }, "profit": 1640000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1200,
//         "id": "TWT-1200",
//         "orderChannel": "TWT",
//         "guest_id": "1300",
//         "guest": "Michael Chen",
//         "guestDetails": { "id": 1300, "name": "Michael Chen", "phone": "+1-202-555-0191", "email": "m.chen@example.com", "country_id": 232, "country": "United States" },
//         "total_pax": "4",
//         "duration": "5D 4N",
//         "package": "5D4N Ultimate East Java Adventure",
//         "booking_date": "15 May 2025",
//         "date": { "start_ymd": "2025-06-10", "end_ymd": "2025-06-14", "start": "10 Jun 25", "end": "14 Jun 25", "days": "Tue - Sat" },
//         "pickup": { "meeting_point": "Juanda International Airport (SUB)", "pickup_time": "11:30", "text": "Juanda Airport (SUB), flight GA321" },
//         "dropoff": { "drop_point": "Malang Train Station", "drop_time": "14:00", "text": "Malang Kota Baru Train Station" },
//         "itinerary": [{ "day": "1", "date": "10 Jun 2025", "itinerary": "Airport - Tumpak Sewu area" }],
//         "hotels": [{ "day": "1", "checkIn": "10 Jun 2025", "hotelId": 33, "hotel": "Doho Homestay", "rooms": [{ "roomName": "Family", "quantity": "2" }], "meals": ["Breakfast"] }],
//         "vehicles": ["Toyota HiAce"],
//         "drivers": [{ "id": 1, "name": "Yandi", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/yandi.jpg" }],
//         "guides": [{ "id": 13, "name": "Rendi", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/rendi.jpg" }],
//         "financial": { "payment": "12000000", "balance": "8000000", "invoice": { "total": 20000000 }, "expense": { "total": "15500000" }, "profit": 4500000 },
//         "paymentHistory": [],
//         "notes": "Guest requested a vegetarian meal option for all included meals."
//     },
//     {
//         "booking_id": 1201,
//         "id": "KLOOK-1201",
//         "orderChannel": "KLOOK",
//         "guest_id": "1301",
//         "guest": "Sophie Dubois",
//         "guestDetails": { "id": 1301, "name": "Sophie Dubois", "phone": "+33 1 23 45 67 89", "email": "sophie.d@example.com", "country_id": 74, "country": "France" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "4D3N Bromo & Ijen Highlights",
//         "booking_date": "20 May 2025",
//         "date": { "start_ymd": "2025-06-20", "end_ymd": "2025-06-23", "start": "20 Jun 25", "end": "23 Jun 25", "days": "Fri - Mon" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "09:00", "text": "Hotel Majapahit Surabaya" },
//         "dropoff": { "drop_point": "Banyuwangi Port (Ketapang)", "drop_time": "12:00", "text": "Ketapang Ferry Terminal for transport to Bali" },
//         "itinerary": [{ "day": "1", "date": "20 Jun 2025", "itinerary": "Surabaya - Bromo Area" }],
//         "hotels": [{ "day": "1", "checkIn": "20 Jun 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [{ "roomName": "Double", "quantity": "1" }], "meals": ["Breakfast"] }],
//         "vehicles": ["Toyota Innova"],
//         "drivers": [{ "id": 7, "name": "Fredi", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/fredi.jpg" }],
//         "guides": [{ "id": 46, "name": "Fauzi", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/fauzi.jpg" }],
//         "financial": { "payment": "0", "balance": "9500000", "invoice": { "total": 9500000 }, "expense": { "total": "7200000" }, "profit": 2300000 },
//         "paymentHistory": [],
//         "notes": "Honeymoon trip. Please arrange for a small complimentary cake."
//     },
//     {
//         "booking_id": 1202,
//         "id": "TWT-1202",
//         "orderChannel": "TWT",
//         "guest_id": "1302",
//         "guest": "Carlos Rodriguez",
//         "guestDetails": { "id": 1302, "name": "Carlos Rodriguez", "phone": "+34 912 345 678", "email": "carlos.r@example.com", "country_id": 204, "country": "Spain" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "4D3N Bromo & Ijen Photography Tour",
//         "booking_date": "22 May 2025",
//         "date": { "start_ymd": "2025-06-21", "end_ymd": "2025-06-24", "start": "21 Jun 25", "end": "24 Jun 25", "days": "Sat - Tue" },
//         "pickup": { "meeting_point": "Malang Airport (MLG)", "pickup_time": "12:00", "text": "Abdul Rachman Saleh Airport (MLG)" },
//         "dropoff": { "drop_point": "Surabaya Airport (SUB)", "drop_time": "17:00", "text": "Juanda International Airport (SUB)" },
//         "itinerary": [{ "day": "1", "date": "21 Jun 2025", "itinerary": "Malang - Bromo Area" }],
//         "hotels": [{ "day": "1", "checkIn": "21 Jun 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [{ "roomName": "Double", "quantity": "1" }], "meals": ["Breakfast"] }],
//         "vehicles": ["Toyota Innova"],
//         "drivers": [{ "id": 7, "name": "Fredi", "tags": "JVTO,KLOOK,TWT", "photo": "https://example.com/fredi.jpg" }],
//         "guides": [{ "id": 56, "name": "Local Ijen", "type": "Ijen", "tags": "TWT,JVTO,KLOOK", "photo": "https://example.com/default.jpg" }],
//         "financial": { "payment": "9800000", "balance": "0", "invoice": { "total": 9800000 }, "expense": { "total": "7500000" }, "profit": 2300000 },
//         "paymentHistory": [],
//         "notes": "Guest is a professional photographer. Emphasize sunrise and blue fire opportunities."
//     },
//     {
//         "booking_id": 1155,
//         "id": "TWT-1155",
//         "orderChannel": "TWT",
//         "guest_id": "1266",
//         "guest": "Lily Yee",
//         "guestDetails": { "id": 1266, "name": "Lily Yee", "phone": null, "email": null, "country_id": null, "country": null },
//         "total_pax": "4",
//         "duration": "5D 4N",
//         "package": "5D 4N Package",
//         "booking_date": "23 May 2025",
//         "date": { "start_ymd": "2025-06-14", "end_ymd": "2025-06-18", "start": "14 Jun 25", "end": "18 Jun 25", "days": "Sat - Wed" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "10:45", "text": "Surabaya Airport Terminal 2 QZ321" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "14:30", "text": "Surabaya Airport Terminal 2 QZ326" },
//         "itinerary": [ { "day": "1", "date": "14 Jun 2025", "itinerary": "Surabaya Airport - Malang City" } ],
//         "hotels": [ { "day": "1", "checkIn": "14 Jun 2025", "hotelId": 59, "hotel": "THE 1O1 Malang OJ", "rooms": [ { "roomName": "Deluxe Twin Room Only - Weekend", "quantity": "2" } ], "meals": [] } ],
//         "vehicles": [ "Hiace Commuter" ],
//         "drivers": [ { "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 17, "name": "Kiki", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528887_KIKI.JPG" } ],
//         "financial": { "payment": "0", "balance": "18754000", "invoice": { "total": 18754000 }, "expense": { "total": "16295000" }, "profit": 2459000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1186,
//         "id": "KLOOK-1186",
//         "orderChannel": "KLOOK",
//         "guest_id": "1340",
//         "guest": "Aye Chan Maung",
//         "guestDetails": { "id": 1340, "name": "Aye Chan Maung", "phone": "+6583714545", "email": "ayecmaung93@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "4D 3N Package",
//         "booking_date": "10 Jun 2025",
//         "date": { "start_ymd": "2025-06-14", "end_ymd": "2025-06-17", "start": "14 Jun 25", "end": "17 Jun 25", "days": "Sat - Tue" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "08:30", "text": "Surabaya Airport Terminal 2 3K249" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "19:30", "text": "Surabaya Airport Terminal 2 TR267" },
//         "itinerary": [ { "day": "1", "date": "14 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "14 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Ertiga" ],
//         "drivers": [ { "id": 7, "name": "Fredi", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528837_FREDI.JPG" } ],
//         "guides": [ { "id": 46, "name": "Fauzi", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528816_FAUZI.JPG" } ],
//         "financial": { "payment": "0", "balance": "7500000", "invoice": { "total": 7500000 }, "expense": { "total": "6415000" }, "profit": 1085000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1189,
//         "id": "JVTO-1189",
//         "orderChannel": "JVTO",
//         "guest_id": "1336",
//         "guest": "Stella Ong",
//         "guestDetails": { "id": 1336, "name": "Stella Ong", "phone": "+60197704013", "email": "tzexing99@gmail.com", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "East Java Highlights: 4D3N Ijen Crater, Bromo & Madakaripura Adventure",
//         "booking_date": "11 Jun 2025",
//         "date": { "start_ymd": "2025-06-14", "end_ymd": "2025-06-17", "start": "14 Jun 25", "end": "17 Jun 25", "days": "Sat - Tue" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "12:40", "text": "Surabaya Airport Terminal 2 QZ 387" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "07:00", "text": "Surabaya Airport  " },
//         "itinerary": [ { "day": "1", "date": "14 Jun 2025", "itinerary": "Surabaya Airport - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "14 Jun 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Twin", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [ "Avanza Andi" ],
//         "drivers": [ { "id": 1, "name": "Yandi", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528930_YANDI.JPG" } ],
//         "guides": [ { "id": 46, "name": "Fauzi", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528816_FAUZI.JPG" } ],
//         "financial": { "payment": "8800000", "balance": "0", "invoice": { "total": 8800000 }, "expense": { "total": "6357500" }, "profit": -6357500 },
//         "paymentHistory": [ { "id": 341, "booking_id": "1189", "nominal": "8800000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "11 Jun 25 09:03" } ],
//         "notes": "- Anjas ikut ke SBY, nyambung trip Jialing Neo"
//     },
//     {
//         "booking_id": 1192,
//         "id": "KLOOK-1192",
//         "orderChannel": "KLOOK",
//         "guest_id": "1353",
//         "guest": "shakina johari",
//         "guestDetails": { "id": 1353, "name": "shakina johari", "phone": "+6585180744", "email": "shakina.j88@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "11 Jun 2025",
//         "date": { "start_ymd": "2025-06-14", "end_ymd": "2025-06-16", "start": "14 Jun 25", "end": "16 Jun 25", "days": "Sat - Mon" },
//         "pickup": { "meeting_point": "Others", "pickup_time": "11:00", "text": "Whiz Luxe Hotel Spazio Surabaya" },
//         "dropoff": { "drop_point": "Others", "drop_time": "18:00", "text": "JW Marriot Hotel Surabaya" },
//         "itinerary": [ { "day": "1", "date": "14 Jun 2025", "itinerary": "Surabaya Hotel - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "14 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Avanza Sub" ],
//         "drivers": [ { "id": 62, "name": "Yusuf", "tags": "JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1723647328_WhatsApp Image 2024-08-14 at 20.45.38.jpeg" } ],
//         "guides": [ { "id": 68, "name": "Boy", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528760_BOY.JPG" } ],
//         "financial": { "payment": "0", "balance": "6200000", "invoice": { "total": 6200000 }, "expense": { "total": "5315000" }, "profit": 885000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1133,
//         "id": "KLOOK-1133",
//         "orderChannel": "KLOOK",
//         "guest_id": "1168",
//         "guest": "Kusaka Lim Tze Chiang Nicholas",
//         "guestDetails": { "id": 1168, "name": "Kusaka Lim Tze Chiang Nicholas", "phone": "+6594886300", "email": "nicholaskusakalim@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfal & Mount Bromo from Surabaya",
//         "booking_date": "09 May 2025",
//         "date": { "start_ymd": "2025-06-15", "end_ymd": "2025-06-18", "start": "15 Jun 25", "end": "18 Jun 25", "days": "Sun - Wed" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:05", "text": "Surabaya Airport Terminal 2 SQ922" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  DoubleTree by Hilton Surabaya" },
//         "itinerary": [ { "day": "1", "date": "15 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "15 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Avanza Yus" ],
//         "drivers": [ { "id": 28, "name": "Holili", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1698676624_HOLILI PHOTO.png" } ],
//         "guides": [ { "id": 13, "name": "Rendi", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528903_RENDI.JPG" } ],
//         "financial": { "payment": "0", "balance": "7500000", "invoice": { "total": 7500000 }, "expense": { "total": "6565000" }, "profit": 935000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1184,
//         "id": "JVTO-1184",
//         "orderChannel": "JVTO",
//         "guest_id": "1318",
//         "guest": "Marcus Coleridge",
//         "guestDetails": { "id": 1318, "name": "Marcus Coleridge", "phone": "07528873222", "email": "marcus.coleridge@gmail.com", "country_id": 231, "country": "United Kingdom" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "Java Volcano Tour: 3D2N Bromo & Ijen Crater Expedition",
//         "booking_date": "09 Jun 2025",
//         "date": { "start_ymd": "2025-06-16", "end_ymd": "2025-06-18", "start": "16 Jun 25", "end": "18 Jun 25", "days": "Mon - Wed" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Double Tree by Hilton Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "17:00", "text": "Surabaya Hotel  Double Tree by Hilton Surabaya" },
//         "itinerary": [ { "day": "1", "date": "16 Jun 2025", "itinerary": "Surabaya Hotel - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "16 Jun 2025", "hotelId": 34, "hotel": "Riverside Homestay", "rooms": [ { "roomName": "Emerald Double", "quantity": "1" } ], "meals": [ "Breakfast", "Lunch", "Dinner" ] } ],
//         "vehicles": [ "Avanza Sub" ],
//         "drivers": [ { "id": 58, "name": "Johan", "tags": "JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1723551011_IMG-20240813-WA0027.jpg" } ],
//         "guides": [ { "id": 46, "name": "Fauzi", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528816_FAUZI.JPG" } ],
//         "financial": { "payment": "7040000", "balance": "0", "invoice": { "total": 7040000 }, "expense": { "total": "5592500" }, "profit": -5592500 },
//         "paymentHistory": [ { "id": 334, "booking_id": "1184", "nominal": "7040000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "09 Jun 25 14:46" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1187,
//         "id": "KLOOK-1187",
//         "orderChannel": "KLOOK",
//         "guest_id": "1344",
//         "guest": "M Seng Htoi Ra",
//         "guestDetails": { "id": 1344, "name": "M Seng Htoi Ra", "phone": "+6593592232", "email": "msenghtoira@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "4",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "10 Jun 2025",
//         "date": { "start_ymd": "2025-06-16", "end_ymd": "2025-06-18", "start": "16 Jun 25", "end": "18 Jun 25", "days": "Mon - Wed" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:35", "text": "Surabaya Airport Terminal 2 TR296" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Sub City Hotel - JI. Arjuna No 69 Surabaya Indonesia 60251" },
//         "itinerary": [ { "day": "1", "date": "16 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "16 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Apartment", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Hiace Commuter" ],
//         "drivers": [ { "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 4, "name": "Taufik", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528916_TAUFIK.JPG" } ],
//         "financial": { "payment": "0", "balance": "10320000", "invoice": { "total": 10320000 }, "expense": { "total": "8860000" }, "profit": 1460000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1145,
//         "id": "KLOOK-1145",
//         "orderChannel": "KLOOK",
//         "guest_id": "1229",
//         "guest": "Jialing Neo",
//         "guestDetails": { "id": 1229, "name": "Jialing Neo", "phone": "+6591120657", "email": "neo.jialing27@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "4",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "18 May 2025",
//         "date": { "start_ymd": "2025-06-17", "end_ymd": "2025-06-19", "start": "17 Jun 25", "end": "19 Jun 25", "days": "Tue - Thu" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:35", "text": "Surabaya Airport Terminal 2 TR296" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Swiss-Belinn Tunjungan, Surabaya" },
//         "itinerary": [ { "day": "1", "date": "17 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "17 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Apartment", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Hiace Commuter" ],
//         "drivers": [ { "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 3, "name": "Anjas", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528725_ANJAS.JPG" } ],
//         "financial": { "payment": "0", "balance": "10320000", "invoice": { "total": 10320000 }, "expense": { "total": "8860000" }, "profit": 1460000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1150,
//         "id": "JVTO-1150",
//         "orderChannel": "JVTO",
//         "guest_id": "1189",
//         "guest": "Phyo Akri Thaw",
//         "guestDetails": { "id": 1189, "name": "Phyo Akri Thaw", "phone": "+6583427377", "email": "phyoakrithaw@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "Bromo & Ijen Discovery: 3D2N East Java Highlights",
//         "booking_date": "21 May 2025",
//         "date": { "start_ymd": "2025-06-17", "end_ymd": "2025-06-19", "start": "17 Jun 25", "end": "19 Jun 25", "days": "Tue - Thu" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "14:00", "text": "Surabaya Airport Terminal 2 3K247" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Aby Hotel Lumajang" },
//         "itinerary": [ { "day": "1", "date": "17 Jun 2025", "itinerary": "Surabaya Airport - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "17 Jun 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [ "Avanza Andi" ],
//         "drivers": [ { "id": 1, "name": "Yandi", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528930_YANDI.JPG" } ],
//         "guides": [ { "id": 46, "name": "Fauzi", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528816_FAUZI.JPG" } ],
//         "financial": { "payment": "1408000", "balance": "5632000", "invoice": { "total": 7040000 }, "expense": { "total": "5457500" }, "profit": 174500 },
//         "paymentHistory": [ { "id": 311, "booking_id": "1150", "nominal": "1408000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "21 May 25 00:50" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1064,
//         "id": "KLOOK-1064",
//         "orderChannel": "KLOOK",
//         "guest_id": "1106",
//         "guest": "Raihan Bin Yacob",
//         "guestDetails": { "id": 1106, "name": "Raihan Bin Yacob", "phone": "+65696842440", "email": "raihan.yacob@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "13 Apr 2025",
//         "date": { "start_ymd": "2025-06-18", "end_ymd": "2025-06-20", "start": "18 Jun 25", "end": "20 Jun 25", "days": "Wed - Fri" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:35", "text": "Surabaya Airport Terminal 2 TR296" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Hotel Platinum Tunjungan Surabaya " },
//         "itinerary": [ { "day": "1", "date": "18 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "18 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Ertiga" ],
//         "drivers": [ { "id": 7, "name": "Fredi", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528837_FREDI.JPG" } ],
//         "guides": [ { "id": 68, "name": "Boy", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528760_BOY.JPG" } ],
//         "financial": { "payment": "0", "balance": "5900000", "invoice": { "total": 5900000 }, "expense": { "total": "5155000" }, "profit": 745000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1158,
//         "id": "JVTO-1158",
//         "orderChannel": "JVTO",
//         "guest_id": "1179",
//         "guest": "Adrián Martínez Martínez",
//         "guestDetails": { "id": 1179, "name": "Adrián Martínez Martínez", "phone": "+34695580962", "email": "adri2martinez@gmail.com", "country_id": 205, "country": "Spain (España)" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "East Java to Bali Adventure: 3D2N Bromo & Ijen Volcano Journey",
//         "booking_date": "25 May 2025",
//         "date": { "start_ymd": "2025-06-18", "end_ymd": "2025-06-20", "start": "18 Jun 25", "end": "20 Jun 25", "days": "Wed - Fri" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "12:00", "text": "Surabaya Airport Terminal 1 IN193" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "07:00", "text": "Surabaya Hotel  Ubud" },
//         "itinerary": [ { "day": "1", "date": "18 Jun 2025", "itinerary": "Surabaya Airport - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "18 Jun 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [ "Daihatsu Sigra" ],
//         "drivers": [ { "id": 73, "name": "Joyo", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 39, "name": "Gufron", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528674_GUFRO.jpeg" } ],
//         "financial": { "payment": "7840000", "balance": "0", "invoice": { "total": 7740000 }, "expense": { "total": "6059500" }, "profit": 1080500 },
//         "paymentHistory": [ { "id": 319, "booking_id": "1158", "nominal": "2208000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "25 May 25 03:32" }, { "id": 338, "booking_id": "1158", "nominal": "4932000", "paymentMethod": "Debit/Credit Card", "description": "Full Payment", "date": "10 Jun 25 17:10" }, { "id": 339, "booking_id": "1158", "nominal": "700000", "paymentMethod": "Debit/Credit Card", "description": "Payment Add On", "date": "10 Jun 25 17:10" } ],
//         "notes": "Add on transport to Ubud"
//     },
//     {
//         "booking_id": 970,
//         "id": "JVTO-970",
//         "orderChannel": "JVTO",
//         "guest_id": "1020",
//         "guest": "Mr Gui",
//         "guestDetails": { "id": 1020, "name": "Mr Gui", "phone": "+60163697129", "email": "g@gmail.com", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "14",
//         "duration": "0D -1N",
//         "package": "0D -1N Package",
//         "booking_date": "20 Feb 2025",
//         "date": { "start_ymd": "2025-06-18", "end_ymd": "2025-06-17", "start": "18 Jun 25", "end": "17 Jun 25", "days": "Wed - Tue" },
//         "pickup": { "meeting_point": "Others", "pickup_time": "12:35", "text": "Lombok Praya (OD368)" },
//         "dropoff": { "drop_point": "Others", "drop_time": "10:35", "text": "Lombok Praya (OD369)" },
//         "itinerary": [],
//         "hotels": [],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "20947500", "balance": "48877500", "invoice": { "total": 69825000 }, "expense": { "total": "0" }, "profit": 48877500 },
//         "paymentHistory": [ { "id": 214, "booking_id": "970", "nominal": "20947500", "paymentMethod": "Bank Transfer", "description": "Down Payment", "date": "26 Feb 25 13:09" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 997,
//         "id": "KLOOK-997",
//         "orderChannel": "KLOOK",
//         "guest_id": "1053",
//         "guest": "Han Yang Chang",
//         "guestDetails": { "id": 1053, "name": "Han Yang Chang", "phone": "+6591861435", "email": "hanyang.chang@hotmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "4",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "15 Mar 2025",
//         "date": { "start_ymd": "2025-06-21", "end_ymd": "2025-06-23", "start": "21 Jun 25", "end": "23 Jun 25", "days": "Sat - Mon" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "08:25", "text": "Surabaya Airport Terminal 2 3K249" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Grand Swiss-Belhotel Darmo" },
//         "itinerary": [ { "day": "1", "date": "21 Jun 2025", "itinerary": "Surabaya Airport - Madakaripura - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "21 Jun 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Double", "quantity": "2" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [ "Hiace Commuter" ],
//         "drivers": [ { "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 3, "name": "Anjas", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528725_ANJAS.JPG" } ],
//         "financial": { "payment": "0", "balance": "10320000", "invoice": { "total": 10320000 }, "expense": { "total": "8860000" }, "profit": 1460000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1140,
//         "id": "JVTO-1140",
//         "orderChannel": "JVTO",
//         "guest_id": "1206",
//         "guest": "max tan",
//         "guestDetails": { "id": 1206, "name": "max tan", "phone": "+60174799829", "email": "maxccheng@gmail.com", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "Java to Bali Adventure: 4D3N Bromo, Ijen & Tumpak Sewu Highlights",
//         "booking_date": "15 May 2025",
//         "date": { "start_ymd": "2025-06-22", "end_ymd": "2025-06-25", "start": "22 Jun 25", "end": "25 Jun 25", "days": "Sun - Wed" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "10:00", "text": "Surabaya Hotel  Surabaya Suites Hotel, Genteng" },
//         "dropoff": { "drop_point": "Others", "drop_time": "13:00", "text": "Gilimanuk Port at Bali" },
//         "itinerary": [ { "day": "1", "date": "22 Jun 2025", "itinerary": "Surabaya Hotel - Lumajang" } ],
//         "hotels": [ { "day": "1", "checkIn": "22 Jun 2025", "hotelId": 38, "hotel": "Artha Cottage", "rooms": [ { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [ "Ertiga" ],
//         "drivers": [ { "id": 7, "name": "Fredi", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528837_FREDI.JPG" } ],
//         "guides": [ { "id": 4, "name": "Taufik", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528916_TAUFIK.JPG" } ],
//         "financial": { "payment": "1800000", "balance": "7200000", "invoice": { "total": 9000000 }, "expense": { "total": "6747000" }, "profit": 453000 },
//         "paymentHistory": [ { "id": 308, "booking_id": "1140", "nominal": "1800000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "15 May 25 11:43" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1143,
//         "id": "KLOOK-1143",
//         "orderChannel": "KLOOK",
//         "guest_id": "1224",
//         "guest": "Anureet Deb",
//         "guestDetails": { "id": 1224, "name": "Anureet Deb", "phone": "+919962991728", "email": "anureetgaming@gmail.com", "country_id": 100, "country": "India (भारत)" },
//         "total_pax": "1",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "17 May 2025",
//         "date": { "start_ymd": "2025-06-23", "end_ymd": "2025-06-25", "start": "23 Jun 25", "end": "25 Jun 25", "days": "Mon - Wed" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Ikiru to Live Guesthouse" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Cordia Hotel Surabaya Airport" },
//         "itinerary": [ { "day": "1", "date": "23 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "23 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Daihatsu Sigra" ],
//         "drivers": [ { "id": 1, "name": "Yandi", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528930_YANDI.JPG" } ],
//         "guides": [ { "id": 39, "name": "Gufron", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528674_GUFRO.jpeg" } ],
//         "financial": { "payment": "0", "balance": "5310000", "invoice": { "total": 5310000 }, "expense": { "total": "4635000" }, "profit": 675000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1141,
//         "id": "KLOOK-1141",
//         "orderChannel": "KLOOK",
//         "guest_id": "1217",
//         "guest": "PANG LOK YAN",
//         "guestDetails": { "id": 1217, "name": "PANG LOK YAN", "phone": "+85255436476", "email": "olivepang321@gmail.com", "country_id": 97, "country": "Hong Kong (香港)" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "17 May 2025",
//         "date": { "start_ymd": "2025-06-24", "end_ymd": "2025-06-26", "start": "24 Jun 25", "end": "26 Jun 25", "days": "Tue - Thu" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Premier Place Hotel" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Premier Place Hotel" },
//         "itinerary": [ { "day": "1", "date": "24 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "24 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Avanza Yus" ],
//         "drivers": [ { "id": 28, "name": "Holili", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1698676624_HOLILI PHOTO.png" } ],
//         "guides": [ { "id": 3, "name": "Anjas", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528725_ANJAS.JPG" } ],
//         "financial": { "payment": "0", "balance": "5900000", "invoice": { "total": 5900000 }, "expense": { "total": "5455000" }, "profit": 445000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1175,
//         "id": "TWT-1175",
//         "orderChannel": "TWT",
//         "guest_id": "1325",
//         "guest": "Wong Siaw Hooi",
//         "guestDetails": { "id": 1325, "name": "Wong Siaw Hooi", "phone": null, "email": null, "country_id": null, "country": null },
//         "total_pax": "4",
//         "duration": "5D 4N",
//         "package": "5D 4N Package",
//         "booking_date": "07 Jun 2025",
//         "date": { "start_ymd": "2025-06-25", "end_ymd": "2025-06-29", "start": "25 Jun 25", "end": "29 Jun 25", "days": "Wed - Sun" },
//         "pickup": { "meeting_point": "Denpasar Airport", "pickup_time": "10:45", "text": "Denpasar Airport Terminal 2 QZ321" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "04:30", "text": "Surabaya Airport Terminal 2 QZ392" },
//         "itinerary": [ { "day": "1", "date": "25 Jun 2025", "itinerary": "Surabaya Airport - Malang City" } ],
//         "hotels": [ { "day": "1", "checkIn": "25 Jun 2025", "hotelId": 59, "hotel": "THE 1O1 Malang OJ", "rooms": [ { "roomName": "Deluxe Double Room Only - Weekday", "quantity": "2" } ], "meals": [] } ],
//         "vehicles": [ "Hiace Commuter" ],
//         "drivers": [ { "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 13, "name": "Rendi", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528903_RENDI.JPG" } ],
//         "financial": { "payment": "0", "balance": "18634000", "invoice": { "total": 18634000 }, "expense": { "total": "16270000" }, "profit": 2364000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1161,
//         "id": "KLOOK-1161",
//         "orderChannel": "KLOOK",
//         "guest_id": "1279",
//         "guest": "Yang ZiJie",
//         "guestDetails": { "id": 1279, "name": "Yang ZiJie", "phone": "+60146336062", "email": "jordanyang6332@gmail.com", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "6",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfal & Mount Bromo from Surabaya",
//         "booking_date": "27 May 2025",
//         "date": { "start_ymd": "2025-06-26", "end_ymd": "2025-06-29", "start": "26 Jun 25", "end": "29 Jun 25", "days": "Thu - Sun" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "19:20", "text": "Surabaya Airport Terminal 2 QZ325" },
//         "dropoff": { "drop_point": "Others", "drop_time": "15:00", "text": "ketapang " },
//         "itinerary": [ { "day": "1", "date": "26 Jun 2025", "itinerary": "Surabaya Airport - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "26 Jun 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Double", "quantity": "4" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [ "Hiace Commuter" ],
//         "drivers": [ { "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 39, "name": "Gufron", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528674_GUFRO.jpeg" } ],
//         "financial": { "payment": "0", "balance": "19360000", "invoice": { "total": 17760000 }, "expense": { "total": "15390000" }, "profit": 3970000 },
//         "paymentHistory": [],
//         "notes": "Add on tambah 1 kamar / malam. Total 1.600.000 cash.\n\nDrop Ketapang"
//     },
//     {
//         "booking_id": 924,
//         "id": "TWT-924",
//         "orderChannel": "TWT",
//         "guest_id": "979",
//         "guest": "Yeoh Moi Tian",
//         "guestDetails": { "id": 979, "name": "Yeoh Moi Tian", "phone": null, "email": null, "country_id": null, "country": null },
//         "total_pax": "4",
//         "duration": "5D 4N",
//         "package": "5D 4N Package",
//         "booking_date": "14 Jan 2025",
//         "date": { "start_ymd": "2025-06-26", "end_ymd": "2025-06-30", "start": "26 Jun 25", "end": "30 Jun 25", "days": "Thu - Mon" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:10", "text": "Surabaya Airport Terminal 2 MH871" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "08:00", "text": "Surabaya Airport Terminal 2 MH870 (3pax)/ IU362 (1pax)" },
//         "itinerary": [ { "day": "1", "date": "26 Jun 2025", "itinerary": "Surabaya Airport - Malang City" } ],
//         "hotels": [ { "day": "1", "checkIn": "26 Jun 2025", "hotelId": 59, "hotel": "THE 1O1 Malang OJ", "rooms": [ { "roomName": "Deluxe Twin Room Only - Weekday", "quantity": "1" }, { "roomName": "Deluxe Double Room Only - Weekday", "quantity": "1" } ], "meals": [] } ],
//         "vehicles": [ "Hiace Commuter" ],
//         "drivers": [ { "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 17, "name": "Kiki", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528887_KIKI.JPG" } ],
//         "financial": { "payment": "0", "balance": "18554000", "invoice": { "total": 18554000 }, "expense": { "total": "16195000" }, "profit": 2359000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 915,
//         "id": "TWT-915",
//         "orderChannel": "TWT",
//         "guest_id": "968",
//         "guest": "Tong Bee Ling",
//         "guestDetails": { "id": 968, "name": "Tong Bee Ling", "phone": null, "email": null, "country_id": null, "country": null },
//         "total_pax": "4",
//         "duration": "4D 3N",
//         "package": "4D 3N Package",
//         "booking_date": "05 Jan 2025",
//         "date": { "start_ymd": "2025-06-27", "end_ymd": "2025-06-30", "start": "27 Jun 25", "end": "30 Jun 25", "days": "Fri - Mon" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "10:40", "text": "Surabaya Airport Terminal 2 QZ321" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "10:30", "text": "Surabaya Airport Terminal 2 QZ324" },
//         "itinerary": [ { "day": "1", "date": "27 Jun 2025", "itinerary": "Surabaya Airport - Madakaripura - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "27 Jun 2025", "hotelId": 60, "hotel": "Manis Ae Cabin & Resto Bromo", "rooms": [ { "roomName": "Family Cabin", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [ "Hiace Commuter" ],
//         "drivers": [ { "id": 9, "name": "GARAGE", "tags": "TWT,JVTO,KLOOK", "photo": "https://javavolcano-touroperator.com/assets/img/guide/default.jpg" } ],
//         "guides": [ { "id": 4, "name": "Taufik", "type": "Escort", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528916_TAUFIK.JPG" } ],
//         "financial": { "payment": "0", "balance": "14779000", "invoice": { "total": 14779000 }, "expense": { "total": "12610000" }, "profit": 2169000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1190,
//         "id": "KLOOK-1190",
//         "orderChannel": "KLOOK",
//         "guest_id": "1347",
//         "guest": "Jia Yi Goh",
//         "guestDetails": { "id": 1347, "name": "Jia Yi Goh", "phone": "+6597333793", "email": "gooohjiayi@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "11 Jun 2025",
//         "date": { "start_ymd": "2025-06-27", "end_ymd": "2025-06-29", "start": "27 Jun 25", "end": "29 Jun 25", "days": "Fri - Sun" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:05", "text": "Surabaya Airport Terminal 2 SQ922" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  The Alana Surabaya" },
//         "itinerary": [ { "day": "1", "date": "27 Jun 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "27 Jun 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Superior Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [ "Avanza Andi" ],
//         "drivers": [ { "id": 7, "name": "Fredi", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528837_FREDI.JPG" } ],
//         "guides": [ { "id": 68, "name": "Boy", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528760_BOY.JPG" } ],
//         "financial": { "payment": "0", "balance": "6200000", "invoice": { "total": 6200000 }, "expense": { "total": "5040000" }, "profit": 1160000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1179,
//         "id": "JVTO-1179",
//         "orderChannel": "JVTO",
//         "guest_id": "1324",
//         "guest": "Kyal Sin Linn",
//         "guestDetails": { "id": 1324, "name": "Kyal Sin Linn", "phone": "+6586967855", "email": "kyelsynlynnn@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "Volcano & Beach Expedition: 4D3N Ijen, Papuma, Tumpak Sewu & Bromo",
//         "booking_date": "08 Jun 2025",
//         "date": { "start_ymd": "2025-06-28", "end_ymd": "2025-07-01", "start": "28 Jun 25", "end": "01 Jul 25", "days": "Sat - Tue" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Hotel Santika Premiere Gubeng Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "19:35", "text": "Surabaya Airport Terminal 2 Scoot -TR267 (SUB - SIN)" },
//         "itinerary": [ { "day": "1", "date": "28 Jun 2025", "itinerary": "Surabaya Hotel - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "28 Jun 2025", "hotelId": 34, "hotel": "Riverside Homestay", "rooms": [ { "roomName": "Platinum Twin", "quantity": "1" } ], "meals": [ "Breakfast", "Lunch", "Dinner" ] } ],
//         "vehicles": [ "Ertiga" ],
//         "drivers": [ { "id": 1, "name": "Yandi", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528930_YANDI.JPG" } ],
//         "guides": [ { "id": 3, "name": "Anjas", "type": "Ijen", "tags": "JVTO,KLOOK,TWT", "photo": "https://javavolcano-touroperator.com/assets/img/guide/1725528725_ANJAS.JPG" } ],
//         "financial": { "payment": "8550000", "balance": "0", "invoice": { "total": 8550000 }, "expense": { "total": "7087500" }, "profit": -7087500 },
//         "paymentHistory": [ { "id": 332, "booking_id": "1179", "nominal": "8550000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "08 Jun 25 12:36" } ],
//         "notes": "Anjas ikut pulang ke Jember"
//     },
//     {
//         "booking_id": 1134,
//         "id": "KLOOK-1134",
//         "orderChannel": "KLOOK",
//         "guest_id": "1185",
//         "guest": "Man Chun Hei Jeffrey",
//         "guestDetails": { "id": 1185, "name": "Man Chun Hei Jeffrey", "phone": "+85269957390", "email": "manjpeanut@gmail.com", "country_id": 97, "country": "Hong Kong (香港)" },
//         "total_pax": "5",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfal & Mount Bromo from Surabaya",
//         "booking_date": "11 May 2025",
//         "date": { "start_ymd": "2025-07-01", "end_ymd": "2025-07-04", "start": "01 Jul 25", "end": "04 Jul 25", "days": "Tue - Fri" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "14:25", "text": "Surabaya Airport Terminal 1 QG699" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "07:00", "text": "Surabaya Airport  " },
//         "itinerary": [ { "day": "1", "date": "01 Jul 2025", "itinerary": "Surabaya Airport - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "01 Jul 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Family", "quantity": "1" }, { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "16000000", "invoice": { "total": 16000000 }, "expense": { "total": "13225000" }, "profit": 2775000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1191,
//         "id": "KLOOK-1191",
//         "orderChannel": "KLOOK",
//         "guest_id": "1351",
//         "guest": "Chu Jessie",
//         "guestDetails": { "id": 1351, "name": "Chu Jessie", "phone": "+85297741741", "email": "jessieki244@gmail.com", "country_id": 97, "country": "Hong Kong (香港)" },
//         "total_pax": "3",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfal & Mount Bromo from Surabaya",
//         "booking_date": "11 Jun 2025",
//         "date": { "start_ymd": "2025-07-01", "end_ymd": "2025-07-04", "start": "01 Jul 25", "end": "04 Jul 25", "days": "Tue - Fri" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "18:00", "text": "Surabaya Airport Terminal 2 CX779" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "16:00", "text": "Surabaya Hotel  " },
//         "itinerary": [ { "day": "1", "date": "01 Jul 2025", "itinerary": "Surabaya Airport - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "01 Jul 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Twin", "quantity": "1" }, { "roomName": "Extra Bed", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "10320000", "invoice": { "total": 10320000 }, "expense": { "total": "7860000" }, "profit": 2460000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1047,
//         "id": "JVTO-1047",
//         "orderChannel": "JVTO",
//         "guest_id": "1086",
//         "guest": "YIN TAK NG",
//         "guestDetails": { "id": 1086, "name": "YIN TAK NG", "phone": "+85292737870", "email": "ngnicole912@gmail.com", "country_id": 97, "country": "Hong Kong (香港)" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "East Java Highlights: 4D3N Ijen Crater, Bromo & Madakaripura Adventure",
//         "booking_date": "07 Apr 2025",
//         "date": { "start_ymd": "2025-07-02", "end_ymd": "2025-07-05", "start": "02 Jul 25", "end": "05 Jul 25", "days": "Wed - Sat" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "18:00", "text": "Surabaya Airport Terminal 1 IU725 (LBJ-SUB)" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "06:00", "text": "Surabaya Airport Terminal 2 IU725 (LBJ-SUB)" },
//         "itinerary": [ { "day": "1", "date": "02 Jul 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "02 Jul 2025", "hotelId": 34, "hotel": "Riverside Homestay", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Lunch", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "1760000", "balance": "7040000", "invoice": { "total": 8800000 }, "expense": { "total": "6867500" }, "profit": 172500 },
//         "paymentHistory": [ { "id": 264, "booking_id": "1047", "nominal": "1760000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "07 Apr 25 21:18" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1118,
//         "id": "KLOOK-1118",
//         "orderChannel": "KLOOK",
//         "guest_id": "1148",
//         "guest": "Chou YuanLung",
//         "guestDetails": { "id": 1148, "name": "Chou YuanLung", "phone": "+886958622931", "email": "ylchou2016@icloud.com", "country_id": 213, "country": "Taiwan (台灣)" },
//         "total_pax": "10",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfal & Mount Bromo from Surabaya",
//         "booking_date": "05 May 2025",
//         "date": { "start_ymd": "2025-07-02", "end_ymd": "2025-07-05", "start": "02 Jul 25", "end": "05 Jul 25", "days": "Wed - Sat" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Swiss-Belinn Airport Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "17:00", "text": "Surabaya Hotel  Swiss-Belinn Tunjungan, Surabaya" },
//         "itinerary": [ { "day": "1", "date": "02 Jul 2025", "itinerary": "Surabaya Hotel - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "02 Jul 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" }, { "roomName": "Apartment", "quantity": "2" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "25800000", "invoice": { "total": 25800000 }, "expense": { "total": "20125000" }, "profit": 5675000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1151,
//         "id": "JVTO-1151",
//         "orderChannel": "JVTO",
//         "guest_id": "1252",
//         "guest": "Jing Xuan Koh",
//         "guestDetails": { "id": 1252, "name": "Jing Xuan Koh", "phone": "+65 92321485", "email": "jxkoh2022@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "3",
//         "duration": "3D 2N",
//         "package": "Java Volcano Tour: 3D2N Bromo & Ijen Crater Expedition",
//         "booking_date": "23 May 2025",
//         "date": { "start_ymd": "2025-07-03", "end_ymd": "2025-07-05", "start": "03 Jul 25", "end": "05 Jul 25", "days": "Thu - Sat" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:35", "text": "Surabaya Airport Terminal 2 TR296" },
//         "dropoff": { "drop_point": "Others", "drop_time": "18:00", "text": "Surabaya Hotel Bobocabin Pacet, Mojokerto" },
//         "itinerary": [ { "day": "1", "date": "03 Jul 2025", "itinerary": "Surabaya Airport - Madakaripura - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "03 Jul 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Twin", "quantity": "1" }, { "roomName": "Extra Bed", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "9675000", "balance": "0", "invoice": { "total": 9675000 }, "expense": { "total": "6612500" }, "profit": -6612500 },
//         "paymentHistory": [ { "id": 317, "booking_id": "1151", "nominal": "9675000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "23 May 25 07:10" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1156,
//         "id": "JVTO-1156",
//         "orderChannel": "JVTO",
//         "guest_id": "1183",
//         "guest": "Cheng Long Chan",
//         "guestDetails": { "id": 1183, "name": "Cheng Long Chan", "phone": "+85362116507", "email": "ryan.chanchenglong@gmail.com", "country_id": 127, "country": "Macau (澳門)" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "Volcano & Beach Expedition: 4D3N Ijen, Papuma, Tumpak Sewu & Bromo",
//         "booking_date": "24 May 2025",
//         "date": { "start_ymd": "2025-07-03", "end_ymd": "2025-07-06", "start": "03 Jul 25", "end": "06 Jul 25", "days": "Thu - Sun" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "10:00", "text": "Surabaya Hotel  ARTOTEL TS Suites Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "15:00", "text": "Surabaya Hotel  DoubleTree by Hilton Surabaya" },
//         "itinerary": [ { "day": "1", "date": "03 Jul 2025", "itinerary": "Surabaya Hotel - Madakaripura - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "03 Jul 2025", "hotelId": 34, "hotel": "Riverside Homestay", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Lunch", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "2200000", "balance": "7200000", "invoice": { "total": 9400000 }, "expense": { "total": "7275000" }, "profit": -75000 },
//         "paymentHistory": [ { "id": 318, "booking_id": "1156", "nominal": "2200000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "24 May 25 22:17" } ],
//         "notes": "Add on Madakaripura"
//     },
//     {
//         "booking_id": 1164,
//         "id": "KLOOK-1164",
//         "orderChannel": "KLOOK",
//         "guest_id": "1301",
//         "guest": "Muhammad Akmal Ashak",
//         "guestDetails": { "id": 1301, "name": "Muhammad Akmal Ashak", "phone": "+6597470003", "email": "nick_ashak@hotmail.com", "country_id": null, "country": null },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "01 Jun 2025",
//         "date": { "start_ymd": "2025-07-03", "end_ymd": "2025-07-05", "start": "03 Jul 25", "end": "05 Jul 25", "days": "Thu - Sat" },
//         "pickup": { "meeting_point": "Others", "pickup_time": "07:00", "text": "Swiss-Belinn Airport Surabaya" },
//         "dropoff": { "drop_point": "Others", "drop_time": "07:00", "text": "Swiss-Belinn Airport Surabaya" },
//         "itinerary": [ { "day": "1", "date": "03 Jul 2025", "itinerary": "A warm welcome to Surabaya" } ],
//         "hotels": [ { "day": "1", "checkIn": "03 Jul 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "5900000", "invoice": { "total": 5900000 }, "expense": { "total": "5065000" }, "profit": 835000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1001,
//         "id": "JVTO-1001",
//         "orderChannel": "JVTO",
//         "guest_id": "1058",
//         "guest": "Guillermo Garcia Ferrera",
//         "guestDetails": { "id": 1058, "name": "Guillermo Garcia Ferrera", "phone": "+34650335961", "email": "ggarciaferrera@gmail.com", "country_id": 205, "country": "Spain (España)" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "East Java to Bali Adventure: 3D2N Bromo & Ijen Volcano Journey",
//         "booking_date": "17 Mar 2025",
//         "date": { "start_ymd": "2025-07-03", "end_ymd": "2025-07-05", "start": "03 Jul 25", "end": "05 Jul 25", "days": "Thu - Sat" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "10:30", "text": "Surabaya Airport (ID6134)" },
//         "dropoff": { "drop_point": "Others", "drop_time": "07:00", "text": "Bali" },
//         "itinerary": [ { "day": "1", "date": "03 Jul 2025", "itinerary": "From Surabaya to the Mystical Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "03 Jul 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "2258000", "balance": "5632000", "invoice": { "total": 7890000 }, "expense": { "total": "5407500" }, "profit": 224500 },
//         "paymentHistory": [ { "id": 229, "booking_id": "1001", "nominal": "2258000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "17 Mar 25 04:15" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1031,
//         "id": "JVTO-1031",
//         "orderChannel": "JVTO",
//         "guest_id": "1069",
//         "guest": "Tan So yin",
//         "guestDetails": { "id": 1069, "name": "Tan So yin", "phone": "+60125091578", "email": "soyin0508@gmail.com", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "5",
//         "duration": "5D 4N",
//         "package": "Ultimate East Java Experience: 5D4N Ijen Crater, Tumpak Sewu & Bromo",
//         "booking_date": "02 Apr 2025",
//         "date": { "start_ymd": "2025-07-04", "end_ymd": "2025-07-03", "start": "04 Jul 25", "end": "03 Jul 25", "days": "Fri - Thu" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "10:40", "text": "Surabaya Airport Terminal 2 OD350" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "07:00", "text": "Surabaya Airport Terminal 2 " },
//         "itinerary": [],
//         "hotels": [],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "5040000", "balance": "17460000", "invoice": { "total": 22500000 }, "expense": { "total": "12170000" }, "profit": 5290000 },
//         "paymentHistory": [ { "id": 256, "booking_id": "1031", "nominal": "5040000", "paymentMethod": "WISE", "description": "Down Payment", "date": "03 Apr 25 05:56" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1165,
//         "id": "JVTO-1165",
//         "orderChannel": "JVTO",
//         "guest_id": "1304",
//         "guest": "Udit Singhal",
//         "guestDetails": { "id": 1304, "name": "Udit Singhal", "phone": "+91 97849-12800", "email": "uditbsinghal@gmail.com", "country_id": 100, "country": "India (भारत)" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "Bromo & Ijen Discovery: 3D2N East Java Highlights",
//         "booking_date": "01 Jun 2025",
//         "date": { "start_ymd": "2025-07-07", "end_ymd": "2025-07-09", "start": "07 Jul 25", "end": "09 Jul 25", "days": "Mon - Wed" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "17:05", "text": "Surabaya Airport Terminal 1 JT923" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "07:00", "text": "Surabaya Airport  " },
//         "itinerary": [ { "day": "1", "date": "07 Jul 2025", "itinerary": "Surabaya Airport - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "07 Jul 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "7040000", "balance": "0", "invoice": { "total": 7040000 }, "expense": { "total": "5267500" }, "profit": -5267500 },
//         "paymentHistory": [ { "id": 329, "booking_id": "1165", "nominal": "7040000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "01 Jun 25 15:15" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 920,
//         "id": "KLOOK-920",
//         "orderChannel": "KLOOK",
//         "guest_id": "974",
//         "guest": "Daniel Ernst",
//         "guestDetails": { "id": 974, "name": "Daniel Ernst", "phone": "+491707752547", "email": "null", "country_id": 82, "country": "Germany (Deutschland)" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfal & Mount Bromo from Surabaya",
//         "booking_date": "10 Jan 2025",
//         "date": { "start_ymd": "2025-07-10", "end_ymd": "2025-07-13", "start": "10 Jul 25", "end": "13 Jul 25", "days": "Thu - Sun" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:05", "text": "Surabaya Airport Terminal 2 SQ922" },
//         "dropoff": { "drop_point": "Others", "drop_time": "12:00", "text": "Ketapang Harbour" },
//         "itinerary": [ { "day": "1", "date": "10 Jul 2025", "itinerary": "Surabaya Airport - Lumajang" } ],
//         "hotels": [ { "day": "1", "checkIn": "10 Jul 2025", "hotelId": 38, "hotel": "Artha Cottage", "rooms": [ { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "7500000", "invoice": { "total": 7500000 }, "expense": { "total": "6880000" }, "profit": 620000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 986,
//         "id": "JVTO-986",
//         "orderChannel": "JVTO",
//         "guest_id": "1031",
//         "guest": "Tham Kam Peng",
//         "guestDetails": { "id": 1031, "name": "Tham Kam Peng", "phone": "+60162292336", "email": "tkampeng@yahoo.co.uk", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "40",
//         "duration": "5D 4N",
//         "package": "Ultimate East Java Experience: 5D4N Ijen Crater, Tumpak Sewu & Bromo",
//         "booking_date": "05 Mar 2025",
//         "date": { "start_ymd": "2025-07-10", "end_ymd": "2025-07-09", "start": "10 Jul 25", "end": "09 Jul 25", "days": "Thu - Wed" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "07:00", "text": "Surabaya Airport  " },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "07:00", "text": "Surabaya Airport  " },
//         "itinerary": [],
//         "hotels": [],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "23760000", "balance": "113040000", "invoice": { "total": 136800000 }, "expense": { "total": "34750000" }, "profit": 78290000 },
//         "paymentHistory": [ { "id": 219, "booking_id": "986", "nominal": "23760000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "05 Mar 25 12:59" } ],
//         "notes": "- 2 FOC\n- 2 pax vegetarian, egg can ,no garlic and onions"
//     },
//     {
//         "booking_id": 1169,
//         "id": "TWT-1169",
//         "orderChannel": "TWT",
//         "guest_id": "1313",
//         "guest": "Lee Wai Yuen",
//         "guestDetails": { "id": 1313, "name": "Lee Wai Yuen", "phone": null, "email": null, "country_id": null, "country": null },
//         "total_pax": "6",
//         "duration": "5D 4N",
//         "package": "5D 4N Package",
//         "booking_date": "05 Jun 2025",
//         "date": { "start_ymd": "2025-07-12", "end_ymd": "2025-07-16", "start": "12 Jul 25", "end": "16 Jul 25", "days": "Sat - Wed" },
//         "pickup": { "meeting_point": "Others", "pickup_time": "07:00", "text": "Surabaya Airport" },
//         "dropoff": { "drop_point": "Others", "drop_time": "07:00", "text": "Surabaya Airport" },
//         "itinerary": [ { "day": "1", "date": "12 Jul 2025", "itinerary": "Surabaya Airport - Surabaya City" } ],
//         "hotels": [ { "day": "1", "checkIn": "12 Jul 2025", "hotelId": 59, "hotel": "THE 1O1 Malang OJ", "rooms": [ { "roomName": "Deluxe Double Room Only - Weekday", "quantity": "2" }, { "roomName": "Deluxe Twin Room Only - Weekday", "quantity": "1" } ], "meals": [] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "25404000", "invoice": { "total": 25404000 }, "expense": { "total": "0" }, "profit": 25404000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1097,
//         "id": "KLOOK-1097",
//         "orderChannel": "KLOOK",
//         "guest_id": "1141",
//         "guest": "Yvonne Williams",
//         "guestDetails": { "id": 1141, "name": "Yvonne Williams", "phone": "+447914495377", "email": "eeee1289@gmail.com", "country_id": 231, "country": "United Kingdom" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "29 Apr 2025",
//         "date": { "start_ymd": "2025-07-15", "end_ymd": "2025-07-17", "start": "15 Jul 25", "end": "17 Jul 25", "days": "Tue - Thu" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Swiss-Belinn Airport Surabaya" },
//         "dropoff": { "drop_point": "Others", "drop_time": "07:00", "text": "ketapang port" },
//         "itinerary": [ { "day": "1", "date": "15 Jul 2025", "itinerary": "Surabaya Hotel - Madakaripura - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "15 Jul 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "5900000", "invoice": { "total": 5900000 }, "expense": { "total": "5385000" }, "profit": 515000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1166,
//         "id": "JVTO-1166",
//         "orderChannel": "JVTO",
//         "guest_id": "1306",
//         "guest": "Pablo Rodríguez Toledano",
//         "guestDetails": { "id": 1306, "name": "Pablo Rodríguez Toledano", "phone": "+34697737995", "email": "pablo96rt@gmail.com", "country_id": 205, "country": "Spain (España)" },
//         "total_pax": "3",
//         "duration": "3D 2N",
//         "package": "Bromo & Ijen Discovery: 3D2N East Java Highlights",
//         "booking_date": "01 Jun 2025",
//         "date": { "start_ymd": "2025-07-15", "end_ymd": "2025-07-17", "start": "15 Jul 25", "end": "17 Jul 25", "days": "Tue - Thu" },
//         "pickup": { "meeting_point": "Surabaya Train Station", "pickup_time": "16:00", "text": "Surabaya Train Station Gubeng Station " },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "07:00", "text": "Surabaya Airport  " },
//         "itinerary": [ { "day": "1", "date": "15 Jul 2025", "itinerary": "Surabaya City - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "15 Jul 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Family", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "9675000", "balance": "0", "invoice": { "total": 9675000 }, "expense": { "total": "6142500" }, "profit": -6142500 },
//         "paymentHistory": [ { "id": 331, "booking_id": "1166", "nominal": "9675000", "paymentMethod": "WISE", "description": "Full Payment", "date": "06 Jun 25 21:17" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 943,
//         "id": "JVTO-943",
//         "orderChannel": "JVTO",
//         "guest_id": "994",
//         "guest": "\nSans Frontières Group",
//         "guestDetails": { "id": 994, "name": "\nSans Frontières Group", "phone": "+33623094767", "email": "resa@sans-frontieres.fr", "country_id": 76, "country": "France" },
//         "total_pax": "29",
//         "duration": "3D 2N",
//         "package": "East Java to Bali Adventure: 3D2N Bromo & Ijen Volcano Journey",
//         "booking_date": "30 Jan 2025",
//         "date": { "start_ymd": "2025-07-15", "end_ymd": "2025-07-17", "start": "15 Jul 25", "end": "17 Jul 25", "days": "Tue - Thu" },
//         "pickup": { "meeting_point": "Surabaya Train Station", "pickup_time": "10:45", "text": "Surabaya Train Station (Sancaka 84)" },
//         "dropoff": { "drop_point": "Others", "drop_time": "07:00", "text": "Ubud, Bali" },
//         "itinerary": [ { "day": "1", "date": "15 Jul 2025", "itinerary": "Surabaya City - Madakaripura - Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "15 Jul 2025", "hotelId": 2, "hotel": "Whizz Bromo", "rooms": [ { "roomName": "Capsule", "quantity": "27" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "8710000", "balance": "78390000", "invoice": { "total": 87100000 }, "expense": { "total": "0" }, "profit": 78390000 },
//         "paymentHistory": [ { "id": 206, "booking_id": "943", "nominal": "8710000", "paymentMethod": "Bank Transfer", "description": "Down Payment", "date": "04 Feb 25 11:34" } ],
//         "notes": "- Hiace Langsung nyebrang ke Bali, Ubud\n- Include Meals: Mang Engking Gubeng, Bromo Escapes, Grand padis\n- Custom Tshirt"
//     },
//     {
//         "booking_id": 1059,
//         "id": "JVTO-1059",
//         "orderChannel": "JVTO",
//         "guest_id": "1102",
//         "guest": "Geok Ching Yap",
//         "guestDetails": { "id": 1102, "name": "Geok Ching Yap", "phone": "+60166299181", "email": "carmen_byby1@hotmail.com", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "3",
//         "duration": "5D 4N",
//         "package": "Ultimate East Java Experience: 5D4N Ijen Crater, Tumpak Sewu & Bromo",
//         "booking_date": "11 Apr 2025",
//         "date": { "start_ymd": "2025-07-17", "end_ymd": "2025-07-21", "start": "17 Jul 25", "end": "21 Jul 25", "days": "Thu - Mon" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:10", "text": "Surabaya Airport Terminal 2 MH 871" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "12:00", "text": "Surabaya Hotel  Majapahit Hotel Surabaya" },
//         "itinerary": [ { "day": "1", "date": "17 Jul 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "17 Jul 2025", "hotelId": 34, "hotel": "Riverside Homestay", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" }, { "roomName": "Executive Double", "quantity": "1" } ], "meals": [ "Breakfast", "Lunch", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "2000000", "balance": "13400000", "invoice": { "total": 15400000 }, "expense": { "total": "10362500" }, "profit": 3037500 },
//         "paymentHistory": [ { "id": 273, "booking_id": "1059", "nominal": "2000000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "11 Apr 25 17:48" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 930,
//         "id": "JVTO-930",
//         "orderChannel": "JVTO",
//         "guest_id": "982",
//         "guest": "Hui Bin",
//         "guestDetails": { "id": 982, "name": "Hui Bin", "phone": "+601135575135", "email": "huiibin23@gmail.com", "country_id": 131, "country": "Malaysia" },
//         "total_pax": "13",
//         "duration": "5D 4N",
//         "package": "Ultimate East Java Experience: 5D4N Ijen Crater, Tumpak Sewu & Bromo",
//         "booking_date": "17 Jan 2025",
//         "date": { "start_ymd": "2025-07-19", "end_ymd": "2025-07-23", "start": "19 Jul 25", "end": "23 Jul 25", "days": "Sat - Wed" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "09:00", "text": "Surabaya Airport (TR296)" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "09:00", "text": "Surabaya Airport Terminal 2 " },
//         "itinerary": [ { "day": "1", "date": "19 Jul 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "19 Jul 2025", "hotelId": 34, "hotel": "Riverside Homestay", "rooms": [ { "roomName": "Deluxe Twin", "quantity": "3" }, { "roomName": "Deluxe Double", "quantity": "2" }, { "roomName": "Platinum Twin", "quantity": "1" }, { "roomName": "Extra Bed", "quantity": "1" } ], "meals": [ "Breakfast", "Lunch", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "4320000", "balance": "42480000", "invoice": { "total": 46800000 }, "expense": { "total": "22895000" }, "profit": 19585000 },
//         "paymentHistory": [ { "id": 195, "booking_id": "930", "nominal": "3420000", "paymentMethod": "WISE", "description": "Down Payment", "date": "17 Jan 25 20:55" }, { "id": 220, "booking_id": "930", "nominal": "900000", "paymentMethod": "WISE", "description": "Deposit Payment", "date": "08 Mar 25 12:04" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1160,
//         "id": "KLOOK-1160",
//         "orderChannel": "KLOOK",
//         "guest_id": "1278",
//         "guest": "Ma Chi Kit",
//         "guestDetails": { "id": 1278, "name": "Ma Chi Kit", "phone": "+85293536441", "email": "charles1431@hotmail.com", "country_id": 211, "country": "Switzerland (Schweiz)" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "4D3N Ijen Crater, Papuma Beach, Tumpak Sewu Waterfal & Mount Bromo from Surabaya",
//         "booking_date": "26 May 2025",
//         "date": { "start_ymd": "2025-07-20", "end_ymd": "2025-07-23", "start": "20 Jul 25", "end": "23 Jul 25", "days": "Sun - Wed" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Grand Swiss-Belhotel Darmo, Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Doubletree by Hilton Surabaya" },
//         "itinerary": [ { "day": "1", "date": "20 Jul 2025", "itinerary": "Surabaya Airport - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "20 Jul 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "7500000", "invoice": { "total": 7500000 }, "expense": { "total": "6635000" }, "profit": 865000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1010,
//         "id": "JVTO-1010",
//         "orderChannel": "JVTO",
//         "guest_id": "1064",
//         "guest": "Marie-laurence Nicolas",
//         "guestDetails": { "id": 1064, "name": "Marie-laurence Nicolas", "phone": "+15148147139", "email": "marielaurence.n@hotmail.com", "country_id": 38, "country": "Canada" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "East Java to Bali Adventure: 3D2N Bromo & Ijen Volcano Journey",
//         "booking_date": "23 Mar 2025",
//         "date": { "start_ymd": "2025-07-20", "end_ymd": "2025-07-22", "start": "20 Jul 25", "end": "22 Jul 25", "days": "Sun - Tue" },
//         "pickup": { "meeting_point": "Surabaya Airport", "pickup_time": "14:00", "text": "Surabaya Airport (3K247)" },
//         "dropoff": { "drop_point": "Surabaya Airport", "drop_time": "07:00", "text": "Surabaya Airport" },
//         "itinerary": [ { "day": "1", "date": "20 Jul 2025", "itinerary": "From Surabaya to the Mystical Bromo Area" } ],
//         "hotels": [ { "day": "1", "checkIn": "20 Jul 2025", "hotelId": 11, "hotel": "Joglo Kecombrang Bromo", "rooms": [ { "roomName": "Double", "quantity": "1" } ], "meals": [ "Breakfast" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "2208000", "balance": "5632000", "invoice": { "total": 7840000 }, "expense": { "total": "5407500" }, "profit": 224500 },
//         "paymentHistory": [ { "id": 235, "booking_id": "1010", "nominal": "2208000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "23 Mar 25 03:33" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1181,
//         "id": "KLOOK-1181",
//         "orderChannel": "KLOOK",
//         "guest_id": "1327",
//         "guest": "siobhan mckay",
//         "guestDetails": { "id": 1327, "name": "siobhan mckay", "phone": "+85267319478", "email": "siobhanmckay12@outlook.com", "country_id": 97, "country": "Hong Kong (香港)" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "08 Jun 2025",
//         "date": { "start_ymd": "2025-07-24", "end_ymd": "2025-07-26", "start": "24 Jul 25", "end": "26 Jul 25", "days": "Thu - Sat" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Kampi Hotel Tunjungan Surabaya" },
//         "dropoff": { "drop_point": "Others", "drop_time": "18:00", "text": "Surabaya" },
//         "itinerary": [ { "day": "1", "date": "24 Jul 2025", "itinerary": "Surabaya Hotel - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "24 Jul 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "6200000", "invoice": { "total": 6200000 }, "expense": { "total": "5065000" }, "profit": 1135000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1050,
//         "id": "JVTO-1050",
//         "orderChannel": "JVTO",
//         "guest_id": "1088",
//         "guest": "elisa fuligna",
//         "guestDetails": { "id": 1088, "name": "elisa fuligna", "phone": "+393317630462", "email": "eli.fuli29@gmail.com", "country_id": 107, "country": "Italy (Italia)" },
//         "total_pax": "2",
//         "duration": "4D 3N",
//         "package": "East Java to Yogyakarta Expedition: 4D3N Ijen Crater, Bromo & Tumpak Sewu",
//         "booking_date": "08 Apr 2025",
//         "date": { "start_ymd": "2025-07-26", "end_ymd": "2025-07-29", "start": "26 Jul 25", "end": "29 Jul 25", "days": "Sat - Tue" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "12:00", "text": "Surabaya Hotel (Area Parkir Mobil 1A, Ciputra World, mall Jalan Mayjen Sungkono No.87-89 2303, Kecamatan Dukuhpakis, Jawa Timur 60224 (Vie Loft Apartment or Ciputra World Mall))" },
//         "dropoff": { "drop_point": "Others", "drop_time": "07:00", "text": "Yogyakarta" },
//         "itinerary": [ { "day": "1", "date": "26 Jul 2025", "itinerary": "Arrival in Surabaya – From Surabaya to Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "26 Jul 2025", "hotelId": 34, "hotel": "Riverside Homestay", "rooms": [ { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "1800000", "balance": "7200000", "invoice": { "total": 9000000 }, "expense": { "total": "6887500" }, "profit": 312500 },
//         "paymentHistory": [ { "id": 269, "booking_id": "1050", "nominal": "1800000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "08 Apr 25 23:51" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 1051,
//         "id": "KLOOK-1051",
//         "orderChannel": "KLOOK",
//         "guest_id": "1091",
//         "guest": "Lim Guek Kheng",
//         "guestDetails": { "id": 1091, "name": "Lim Guek Kheng", "phone": "+6596237913", "email": "mandylim402@hotmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "5",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "09 Apr 2025",
//         "date": { "start_ymd": "2025-07-26", "end_ymd": "2025-07-28", "start": "26 Jul 25", "end": "28 Jul 25", "days": "Sat - Mon" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Hotel Aria Centra Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Hotel Aria Centra Surabaya" },
//         "itinerary": [ { "day": "1", "date": "26 Jul 2025", "itinerary": "Surabaya Hotel - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "26 Jul 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Apartment", "quantity": "1" }, { "roomName": "Deluxe Double", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "12000000", "invoice": { "total": 12000000 }, "expense": { "total": "10650000" }, "profit": 1350000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 1173,
//         "id": "KLOOK-1173",
//         "orderChannel": "KLOOK",
//         "guest_id": "1321",
//         "guest": "Wai Yan Wong",
//         "guestDetails": { "id": 1321, "name": "Wai Yan Wong", "phone": "+6592258003", "email": "wwongwaiyann@gmail.com", "country_id": 196, "country": "Singapore" },
//         "total_pax": "4",
//         "duration": "3D 2N",
//         "package": "3D2N Mount Bromo, Madakaripura Waterfall & Ijen Crater Tour from Surabaya",
//         "booking_date": "06 Jun 2025",
//         "date": { "start_ymd": "2025-07-26", "end_ymd": "2025-07-28", "start": "26 Jul 25", "end": "28 Jul 25", "days": "Sat - Mon" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "11:00", "text": "Surabaya Hotel  Wyndham Surabaya" },
//         "dropoff": { "drop_point": "Surabaya Hotel", "drop_time": "18:00", "text": "Surabaya Hotel  Hotel Ciputra World Surabaya" },
//         "itinerary": [ { "day": "1", "date": "26 Jul 2025", "itinerary": "Surabaya Hotel - Bondowoso" } ],
//         "hotels": [ { "day": "1", "checkIn": "26 Jul 2025", "hotelId": 1, "hotel": "Baratha Hotel and Resto", "rooms": [ { "roomName": "Apartment", "quantity": "1" } ], "meals": [ "Breakfast", "Dinner" ] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "10320000", "invoice": { "total": 10320000 }, "expense": { "total": "8650000" }, "profit": 1670000 },
//         "paymentHistory": [],
//         "notes": null
//     },
//     {
//         "booking_id": 988,
//         "id": "JVTO-988",
//         "orderChannel": "JVTO",
//         "guest_id": "1039",
//         "guest": "Emma Lippens",
//         "guestDetails": { "id": 1039, "name": "Emma Lippens", "phone": "+32472618412", "email": "emma.lippens@telenet.be", "country_id": 21, "country": "Belgium (België)" },
//         "total_pax": "2",
//         "duration": "3D 2N",
//         "package": "East Java to Bali Adventure: 3D2N Bromo & Ijen Volcano Journey",
//         "booking_date": "06 Mar 2025",
//         "date": { "start_ymd": "2025-07-28", "end_ymd": "2025-07-27", "start": "28 Jul 25", "end": "27 Jul 25", "days": "Mon - Sun" },
//         "pickup": { "meeting_point": "Surabaya Hotel", "pickup_time": "09:00", "text": "Surabaya Hotel  " },
//         "dropoff": { "drop_point": "Others", "drop_time": "10:00", "text": "Ketapang" },
//         "itinerary": [],
//         "hotels": [],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "1408000", "balance": "6432000", "invoice": { "total": 7840000 }, "expense": { "total": "4240000" }, "profit": 2192000 },
//         "paymentHistory": [ { "id": 223, "booking_id": "988", "nominal": "1408000", "paymentMethod": "Debit/Credit Card", "description": "Down Payment", "date": "13 Mar 25 11:34" } ],
//         "notes": null
//     },
//     {
//         "booking_id": 882,
//         "id": "TWT-882",
//         "orderChannel": "TWT",
//         "guest_id": "942",
//         "guest": "Kelly Teoh",
//         "guestDetails": { "id": 942, "name": "Kelly Teoh", "phone": null, "email": null, "country_id": null, "country": null },
//         "total_pax": "2",
//         "duration": "6D 5N",
//         "package": "6D 5N Package",
//         "booking_date": "25 Sep 2024",
//         "date": { "start_ymd": "2025-07-31", "end_ymd": "2025-08-05", "start": "31 Jul 25", "end": "05 Aug 25", "days": "Thu - Tue" },
//         "pickup": { "meeting_point": "", "pickup_time": "09:05", "text": "  " },
//         "dropoff": { "drop_point": "", "drop_time": "13:30", "text": "  " },
//         "itinerary": [ { "day": "1", "date": "31 Jul 2025", "itinerary": "Surabaya Airport - Malang City" } ],
//         "hotels": [ { "day": "1", "checkIn": "31 Jul 2025", "hotelId": 59, "hotel": "THE 1O1 Malang OJ", "rooms": [ { "roomName": "Deluxe Twin Room Only - Weekday", "quantity": "1" } ], "meals": [] } ],
//         "vehicles": [],
//         "drivers": [],
//         "guides": [],
//         "financial": { "payment": "0", "balance": "11362000", "invoice": { "total": 11362000 }, "expense": { "total": "0" }, "profit": 11362000 },
//         "paymentHistory": [],
//         "notes": null
//     }
// ];


// Helper functions for date parsing
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  // Handle 'YYYY-MM-DD' format
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return new Date(dateStr);
    }
  }
  
  // Handle 'DD Mon YY' format
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const dateParts = dateStr.split(/[\s,]+/);
  if (dateParts.length === 3) {
    const day = parseInt(dateParts[0], 10);
    const monthName = dateParts[1].charAt(0).toUpperCase() + dateParts[1].slice(1).toLowerCase();
    const month = months[monthName];
    let year = parseInt(dateParts[2], 10);
    if(year < 100) year += 2000;
    
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(Date.UTC(year, month, day));
    }
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Calculate booking status based on current date
const getBookingStatus = (booking) => {
  const today = new Date('2025-06-12T00:00:00Z');
  
  const startDate = parseDate(booking.date.start_ymd);
  const endDate = parseDate(booking.date.end_ymd);
  
  if (!startDate || !endDate || startDate > endDate) return 'unknown';

  endDate.setUTCHours(23, 59, 59, 999);
  
  if (endDate < today) return 'completed';
  if (startDate > today) return 'upcoming';
  return 'ongoing';
};

// Check for conflicts between any two bookings
const checkConflicts = (bookings) => {
  const conflicts = [];
  
  for (let i = 0; i < bookings.length; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      const booking1 = bookings[i];
      const booking2 = bookings[j];
      
      const start1 = parseDate(booking1.date.start_ymd);
      const end1 = parseDate(booking1.date.end_ymd);
      const start2 = parseDate(booking2.date.start_ymd);
      const end2 = parseDate(booking2.date.end_ymd);
      
      if (!start1 || !end1 || !start2 || !end2 || start1 > end1 || start2 > end2) continue;

      end1.setUTCHours(23, 59, 59, 999);
      end2.setUTCHours(23, 59, 59, 999);
      
      const overlap = start1 <= end2 && start2 <= end1;
      
      if (overlap) {
        const drivers1 = booking1.drivers || [];
        const drivers2 = booking2.drivers || [];
        for (const driver1 of drivers1) {
          for (const driver2 of drivers2) {
            if (driver1.id === driver2.id && driver1.name !== 'GARAGE') {
              conflicts.push({
                type: 'driver',
                resource: driver1.name,
                resourceId: driver1.id,
                bookings: [booking1.id, booking2.id],
                dates: {
                  booking1: `${booking1.date.start} - ${booking1.date.end}`,
                  booking2: `${booking2.date.start} - ${booking2.date.end}`
                }
              });
            }
          }
        }
        
        const vehicles1 = booking1.vehicles || [];
        const vehicles2 = booking2.vehicles || [];
        for (const vehicle1 of vehicles1) {
          for (const vehicle2 of vehicles2) {
            if (vehicle1 === vehicle2) {
              conflicts.push({
                type: 'vehicle',
                resource: vehicle1,
                bookings: [booking1.id, booking2.id],
                dates: {
                  booking1: `${booking1.date.start} - ${booking1.date.end}`,
                  booking2: `${booking2.date.start} - ${booking2.date.end}`
                }
              });
            }
          }
        }
      }
    }
  }
  
  return conflicts;
};

// Format currency to IDR
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numAmount);
};

// --- Sub-Components ---

const TourCard = ({ booking, conflicts, onClick }) => {
  const status = getBookingStatus(booking);
  const bookingConflicts = conflicts.filter(c => c.bookings.includes(booking.id));
  const hasConflict = bookingConflicts.length > 0;
  
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    unknown: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
  };
  
  return (
    <div  
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 relative overflow-hidden"
    >
      {booking.financial.paymentMethod && (
        <div className="absolute top-0 right-0 w-16 h-16">
          <div className={`absolute transform rotate-45 ${booking.financial.paymentMethod == 'cash' && 'bg-green-500'} ${booking.financial.paymentMethod == 'cc' && 'bg-amber-500'} ${booking.financial.paymentMethod == 'wise' && 'bg-blue-500'} ${booking.financial.paymentMethod == 'edc' && 'bg-red-500'} text-white text-xs font-bold py-1 right-[-20px] top-[12px] w-[84px] text-center shadow-sm`}>
            {booking.financial.paymentMethod.toUpperCase()}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-8">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">{booking.id}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.unknown}`}>
              {status.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 font-medium">{booking.guest}</p>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 text-sm mt-1">
            <Users className="w-4 h-4" />
            {booking.total_pax} pax
          </p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{booking.date.start} - {booking.date.end} ({booking.duration})</span>
        </div>
        
        {booking.drivers && booking.drivers.length > 0 && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{booking.drivers.map(d => d.name).join(', ')}</span>
          </div>
        )}
        
        {booking.vehicles && booking.vehicles.length > 0 && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Car className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{booking.vehicles.join(', ')}</span>
          </div>
        )}
        
        {booking.package && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-2">
            {booking.package}
          </div>
        )}
      </div>
      
      {/* {hasConflict && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            {bookingConflicts.slice(0, 2).map((conflict, idx) => (
              <div key={idx} className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{conflict.type}: {conflict.resource}</span>
              </div>
            ))}
            {bookingConflicts.length > 2 && (
              <div className="text-xs text-amber-600 dark:text-amber-400">
                +{bookingConflicts.length - 2} more conflicts
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
};

const GuestInfo = ({ guestDetails }) => {
  if (!guestDetails) return null;
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Informasi Tamu</h4>
      {guestDetails.phone && (
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>{guestDetails.phone}</span>
        </div>
      )}
      {guestDetails.email && (
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="truncate">{guestDetails.email}</span>
        </div>
      )}
      {guestDetails.country && (
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>{guestDetails.country}</span>
        </div>
      )}
    </div>
  );
};

const DetailView = ({ booking, onClose }) => {
  const [activeTab, setActiveTab] = useState('itinerary');
  
  if (!booking) return null;

  const tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: MapPin },
    { id: 'transport', label: 'Transport & Kru', icon: Car },
    { id: 'accommodation', label: 'Akomodasi', icon: Building },
    { id: 'finance', label: 'Finansial', icon: DollarSign },
    { id: 'notes', label: 'Catatan', icon: Clock }
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 z-[1000] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{booking.id}: {booking.guest}</h2>
              <p className="text-blue-100 text-sm sm:text-base">{booking.total_pax} Pax | {booking.date.start} - {booking.date.end}</p>
              {booking.package && (
                <p className="text-blue-100 text-xs sm:text-sm mt-1">{booking.package}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors -mr-2 -mt-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {activeTab === 'itinerary' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                    <Plane className="w-5 h-5" />
                    <h4 className="font-semibold">Penjemputan</h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{booking.pickup?.text}</p>
                  {booking.pickup?.pickup_time && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Waktu: {booking.pickup.pickup_time}</p>
                  )}
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300 mb-2">
                    <Plane className="w-5 h-5 transform rotate-90" />
                    <h4 className="font-semibold">Pengantaran</h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{booking.dropoff?.text}</p>
                  {booking.dropoff?.drop_time && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Waktu: {booking.dropoff.drop_time}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Itinerary Harian</h4>
                {booking.itinerary?.map((day, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold text-base mb-1 text-gray-900 dark:text-gray-100">Hari {day.day} ({day.date})</h4>
                    <p className="text-gray-700 dark:text-gray-300">{day.itinerary}</p>
                    {day.activity && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aktivitas: {day.activity}</p>
                    )}
                    {day.destination && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Destinasi: {day.destination}</p>
                    )}
                  </div>
                ))}
              </div>
              
              {booking.guestDetails && <GuestInfo guestDetails={booking.guestDetails} />}
            </div>
          )}
          
          {activeTab === 'transport' && (
             <div className="space-y-6 animate-fade-in">
               <div>
                 <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Driver</h4>
                 {booking.drivers && booking.drivers.length > 0 ? (
                   <div className="grid gap-3">
                     {booking.drivers.map((driver, index) => (
                       <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                           <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display='flex'; }} />
                           <div className="hidden items-center justify-center w-full h-full"><Users className="w-6 h-6 text-gray-500 dark:text-gray-400" /></div>
                         </div>
                         <div>
                           <p className="font-medium text-gray-900 dark:text-gray-100">{driver.name}</p>
                           {driver.tags && (
                             <p className="text-sm text-gray-500 dark:text-gray-400">Tags: {driver.tags}</p>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-gray-500 dark:text-gray-400">Tidak ada driver yang ditugaskan</p>
                 )}
               </div>
              
               <div>
                 <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Kendaraan</h4>
                 {booking.vehicles && booking.vehicles.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {booking.vehicles.map((vehicle, index) => (
                       <span key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                         {vehicle}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-gray-500 dark:text-gray-400">Tidak ada kendaraan yang ditugaskan</p>
                 )}
               </div>
             </div>
          )}
          
          {activeTab === 'accommodation' && (
            <div className="space-y-4 animate-fade-in">
              {booking.hotels && booking.hotels.length > 0 ? (
                booking.hotels.map((hotel, index) => (
                  <div key={index} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:bg-gray-700/30 transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Hotel className="w-4 h-4" />
                          {hotel.hotel}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Check-in: {hotel.checkIn}</p>
                      </div>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm">
                        Hari {hotel.day}
                      </span>
                    </div>
                    
                    {hotel.rooms && hotel.rooms.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Kamar:</p>
                        {hotel.rooms.map((room, roomIndex) => (
                          <p key={roomIndex} className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                            • {room.roomName} × {room.quantity}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Tidak ada detail akomodasi</p>
              )}
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Invoice</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(booking.financial.invoice.total)}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Pengeluaran</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(booking.financial.expense?.total)}
                        </p>
                    </div>
                    <div className={`rounded-lg p-4 ${parseFloat(booking.financial.profit) >= 0 ? 'bg-green-50 dark:bg-green-900/40' : 'bg-red-50 dark:bg-red-900/40'}`}>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profit</p>
                        <p className={`text-2xl font-bold ${parseFloat(booking.financial.profit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(booking.financial.profit)}
                        </p>
                    </div>
                </div>
              
              <div className="space-y-3 border-t dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Pembayaran Diterima</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(booking.financial.payment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Sisa Tagihan</span>
                  <span className={`font-semibold text-lg ${parseFloat(booking.financial.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(booking.financial.balance)}
                  </span>
                </div>
              </div>
              
              {booking.paymentHistory && booking.paymentHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Riwayat Pembayaran</h4>
                  <div className="space-y-2">
                    {booking.paymentHistory.map((payment, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{payment.description}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">{payment.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(payment.nominal)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{payment.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'notes' && (
            <div className="animate-fade-in">
              <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Catatan</h4>
              {booking.notes ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">{booking.notes}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Tidak ada catatan</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---

const App = ({bookingData,month}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterDriver, setFilterDriver] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
        // Use a Map to ensure unique bookings by ID, giving precedence to the newer data
        const bookingMap = new Map();
        bookingData.forEach(booking => {
            // Some data may be missing 'financial.expense', provide a fallback.
            if (!booking.financial.expense) {
                booking.financial.expense = { total: 0 };
            }
            bookingMap.set(booking.booking_id, booking);
        });
        setBookings(Array.from(bookingMap.values()));
        setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  const conflicts = useMemo(() => checkConflicts(bookings), [bookings]);
  
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!booking.guest.toLowerCase().includes(searchLower) && 
            !booking.id.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      if (filterChannel !== 'all' && booking.orderChannel !== filterChannel) {
        return false;
      }
      
      if (filterDriver !== 'all') {
        const hasDriver = booking.drivers?.some(d => d.name === filterDriver);
        if (!hasDriver) return false;
      }
      
      if (filterDateRange !== 'all') {
        const startDate = parseDate(booking.date.start_ymd);
        if(!startDate) return false;

        const today = new Date('2025-06-12T00:00:00Z');
        
        switch (filterDateRange) {
          case 'this-week':
            const weekStart = new Date(today);
            weekStart.setUTCDate(today.getUTCDate() - today.getUTCDay() + (today.getUTCDay() === 0 ? -6 : 1));
            const weekEnd = new Date(weekStart);
            weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
            if (startDate < weekStart || startDate > weekEnd) return false;
            break;
          case 'this-month':
            if (startDate.getUTCMonth() !== today.getUTCMonth() || 
                startDate.getUTCFullYear() !== today.getUTCFullYear()) return false;
            break;
          case 'next-month':
            const nextMonthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
            if (startDate.getUTCMonth() !== nextMonthDate.getUTCMonth() || 
                startDate.getUTCFullYear() !== nextMonthDate.getUTCFullYear()) return false;
            break;
        }
      }
      
      return true;
    });
  }, [bookings, searchTerm, filterChannel, filterDriver, filterDateRange]);
  
  const groupedBookings = useMemo(() => {
    const groups = {
      ongoing: [],
      upcoming: [],
      completed: []
    };
    
    filteredBookings.forEach(booking => {
      const status = getBookingStatus(booking);
      if (groups[status]) {
        groups[status].push(booking);
      }
    });
    
    Object.keys(groups).forEach(status => {
      groups[status].sort((a, b) => {
        const dateA = parseDate(a.date.start_ymd) || 0;
        const dateB = parseDate(b.date.start_ymd) || 0;
        if (status === 'completed') {
            return dateB - dateA;
        }
        return dateA - dateB;
      });
    });
    
    return groups;
  }, [filteredBookings]);
  
  const allDrivers = useMemo(() => {
    const drivers = new Set();
    bookings.forEach(booking => {
      booking.drivers?.forEach(d => {
        if (d.name !== 'GARAGE') {
          drivers.add(d.name);
        }
      });
    });
    return Array.from(drivers).sort();
  }, [bookings]);

  const allChannels = useMemo(() => {
    const channels = new Set();
    bookings.forEach(booking => {
        if(booking.orderChannel) channels.add(booking.orderChannel)
    });
    return Array.from(channels).sort();
  }, [bookings]);

  const handleCardClick = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetail = () => {
    setSelectedBooking(null);
  };

  const bookingColumns = [
      { title: 'Berlangsung', data: groupedBookings.ongoing, color: 'text-green-500' },
      { title: 'Akan Datang', data: groupedBookings.upcoming, color: 'text-blue-500' },
      { title: 'Selesai', data: groupedBookings.completed, color: 'text-gray-500' },
  ];

  const filterYear = month.split('-')[0]
  const filterMonth = month.split('-')[1]
  
  return (
    <Main>
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans`}>
            <style>{`
            .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-slide-down { animation: slideDown 0.3s ease-out; }
            @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            
            <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-20 border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-2 sm:px-4 py-3 flex justify-between items-center">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">Dashboard Operasional Tur</h1>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={() => window.location.reload()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Muat Ulang Data">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Ganti Mode Gelap/Terang">
                            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-2 sm:p-4">
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Cari ID Booking atau Nama Tamu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm sm:text-base"
                        />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors w-full md:w-auto">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
                        <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="all">Semua Channel</option>
                            {allChannels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                        </select>
                        <select value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="all">Semua Driver</option>
                            {allDrivers.map(dr => <option key={dr} value={dr}>{dr}</option>)}
                        </select>
                        <select onChange={(e) => {
                            window.location = '/booking-overview/kanban?month='+filterYear+'-'+e.target.value
                        }} value={filterMonth} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option disabled>Pilih Bulan</option>
                            <option value="01">Januari</option>
                            <option value="02">Februari</option>
                            <option value="03">Maret</option>
                            <option value="04">April</option>
                            <option value="05">Mei</option>
                            <option value="06">Juni</option>
                            <option value="07">Juli</option>
                            <option value="08">Agustus</option>
                            <option value="09">September</option>
                            <option value="10">Oktober</option>
                            <option value="11">November</option>
                            <option value="12">Desember</option>
                        </select>
                        {/* <select value={filterDateRange} onChange={(e) => setFilterDateRange(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="all">Semua Tanggal</option>
                            <option value="this-week">Minggu Ini</option>
                            <option value="this-month">Bulan Ini</option>
                            <option value="next-month">Bulan Depan</option>
                        </select> */}
                    </div>
                )}
                </div>

                {loading ? (
                    <div className="text-center py-10">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500" />
                    <p className="mt-2 text-lg">Memuat Booking...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {bookingColumns.map(col => (
                            <div key={col.title} className="bg-gray-100 dark:bg-gray-800/50 p-3 sm:p-4 rounded-xl">
                                <h2 className={`text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 ${col.color}`}>
                                    {col.title}
                                    <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-0.5">{col.data.length}</span>
                                </h2>
                                {col.data.length > 0 ? (
                                    <div className="space-y-4">
                                        {col.data.map(booking => (
                                            <TourCard 
                                                key={booking.id} 
                                                booking={booking} 
                                                conflicts={conflicts} 
                                                onClick={() => handleCardClick(booking)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                        <p className="text-gray-500 dark:text-gray-400">Tidak ada booking {col.title.toLowerCase()} ditemukan.</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
            {selectedBooking && <DetailView booking={selectedBooking} onClose={handleCloseDetail} />}
        </div>
    </Main>
  );
};

export default App;
