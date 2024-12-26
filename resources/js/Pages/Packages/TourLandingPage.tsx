import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, MapPin, Calendar, DollarSign, Phone, Mail } from 'lucide-react';

const TourLandingPage = () => {
    const [activeDay, setActiveDay] = useState(null);

    const toggleDay = (day) => {
        setActiveDay(activeDay === day ? null : day);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="relative h-96 mb-8">
                <img
                    src="https://javavolcano-touroperator.com/assets/img/destinations/ijen-bromo-tumpak-sewu-malang-sightseeing-tour-1676526893742/1687320433_IJEN31.webp"
                    alt="Mount Bromo Sunrise Tour"
                    className="w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-4">
                    <h1 className="text-4xl font-bold mb-2 text-center">Ultimate East Java Experience: 5D4N Ijen Crater,
                        Tumpak Sewu & Bromo</h1>
                    <p className="text-xl mb-6">5 Days of Natural Wonders</p>
                    <a href="https://javavolcano-touroperator.com/packages/surabaya/5d4n/8"
                       className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
                       target="_blank">Book Now</a>
                    {/*<button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">*/}
                    {/*    Book Now*/}
                    {/*</button>*/}
                </div>
            </div>

            {/* Overview Section */}
            <section className="mb-12 px-4">
                <h2 className="text-2xl font-bold mb-4">Tour Overview</h2>
                <div className="text-gray-700 space-y-4">
                    <p>
                        Embark on an exciting 5-day journey through East Java's most iconic landscapes. This adventure is perfect for nature enthusiasts and explorers eager to witness breathtaking sights.
                    </p>
                    <p>
                        Begin with a trek to Ijen Crater to witness the rare blue flames and the stunning turquoise crater lake at sunrise. Next, relax at the pristine shores of Papuma Beach, known for its white sands and clear waters. The journey continues to the majestic Tumpak Sewu Waterfall, a multi-tiered waterfall surrounded by lush greenery. Finally, experience the mesmerizing sunrise over Mount Bromo, illuminating the vast caldera and surrounding peaks.
                    </p>
                    <p>
                        Throughout the tour, enjoy comfortable accommodations, private transportation, and the guidance of experienced English-speaking guides. This expedition is designed to provide a seamless and enriching exploration of Java's natural wonders, ensuring an unforgettable experience for all participants.
                    </p>
                </div>
            </section>

            {/* Key Highlights */}
            <section className="bg-gray-50 py-8 px-4 mb-12">
                <h2 className="text-2xl font-bold mb-6">Key Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex items-center space-x-4">
                        <Clock className="w-8 h-8 text-blue-600" />
                        <div>
                            <h3 className="font-semibold">Duration</h3>
                            <p className="text-sm text-gray-600">5 Days 4 Nights</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <MapPin className="w-8 h-8 text-blue-600" />
                        <div>
                            <h3 className="font-semibold">Start/End Point</h3>
                            <p className="text-sm text-gray-600">Surabaya</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <div>
                            <h3 className="font-semibold">Destinations</h3>
                            <p className="text-sm text-gray-600">Ijen, Papuma, Tumpak Sewu, Bromo</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        <div>
                            <h3 className="font-semibold">Starting Price</h3>
                            <p className="text-sm text-gray-600">IDR 3,600,000/person</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Itinerary Section */}
            <section className="mb-12 px-4">
                <h2 className="text-2xl font-bold mb-6">Day-by-Day Itinerary</h2>

                {/* Day 1 */}
                <div className="border rounded-lg mb-4">
                    <button
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                        onClick={() => toggleDay(1)}
                    >
                        <span className="font-semibold">Day 1: Arrival in Surabaya and Journey to Bondowoso</span>
                        {activeDay === 1 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {activeDay === 1 && (
                        <div className="px-6 py-4 border-t">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Arrival and Transfer</h4>
                                    <p>Your exciting Bromo and Ijen adventure begins with a warm welcome at Surabaya Airport. We'll pick you up (best before noon) and start our scenic 5-hour drive to Bondowoso. Along the way, we'll stop at a local restaurant in Probolinggo for lunch at your own expense.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Evening Rest</h4>
                                    <p>After arriving at Grand Padis Hotel in Bondowoso, take some time to relax and settle in. Enjoy a delicious dinner and rest up for the next day's adventure.</p>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Today's Schedule:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>08:00-13:00 - Airport pickup and drive to Bondowoso</li>
                                        <li>12:20 - Lunch stop at Probolinggo (own expense)</li>
                                        <li>17:00 - Check-in at Grand Padis Hotel</li>
                                        <li>19:00 - Dinner at hotel</li>
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Accommodation:</p>
                                    <p>Grand Padis Hotel, Bondowoso</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Day 2 */}
                <div className="border rounded-lg mb-4">
                    <button
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                        onClick={() => toggleDay(2)}
                    >
                        <span className="font-semibold">Day 2: Ijen Crater Adventure and Papuma Beach Sunset</span>
                        {activeDay === 2 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {activeDay === 2 && (
                        <div className="px-6 py-4 border-t">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Ijen Crater Exploration</h4>
                                    <p>Your day starts early at midnight with a drive to Paltuding, the base of Ijen Crater. After about 1.5 hours on the road, you'll begin your 1-1.5 hour trek to the crater rim. Upon reaching the rim, you'll be greeted by the breathtaking sight of the 200-meter deep turquoise sulfuric lake, set against a dramatic volcanic landscape.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Afternoon at Papuma Beach</h4>
                                    <p>After a refreshing coffee break at Malabar Coffee Plantation and check-in at Doho Homestay, we'll head to Papuma Beach for a stunning sunset experience. Watch as the sun paints the sky in vibrant colors over the pristine waters.</p>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Today's Schedule:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>00:00 - Depart to Ijen Crater</li>
                                        <li>02:00 - Begin blue fire/sunrise trek</li>
                                        <li>08:00 - Breakfast at Malabar Coffee Plantation</li>
                                        <li>14:00 - Check-in at Doho Homestay</li>
                                        <li>15:00 - Drive to Papuma Beach</li>
                                        <li>16:00 - Sunset viewing</li>
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Accommodation:</p>
                                    <p>Doho Homestay, Jember</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Day 3 */}
                <div className="border rounded-lg mb-4">
                    <button
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                        onClick={() => toggleDay(3)}
                    >
                        <span className="font-semibold">Day 3: Tumpak Sewu Waterfall and Journey to Bromo</span>
                        {activeDay === 3 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {activeDay === 3 && (
                        <div className="px-6 py-4 border-t">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Tumpak Sewu Waterfall Experience</h4>
                                    <p>Our journey begins early at 4:00 AM as we head to Tumpak Sewu Waterfall, one of the most beautiful waterfalls in Java. Known for its unique half-circle formation, the waterfall consists of multiple mini-waterfalls cascading from a height of around 300 meters.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Journey to Bromo</h4>
                                    <p>After exploring the falls and enjoying lunch, we'll embark on a 4-hour drive to the Bromo area, preparing for tomorrow's sunrise adventure.</p>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Today's Schedule:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>04:00 - Early departure to Tumpak Sewu</li>
                                        <li>07:00 - Waterfall trek and exploration</li>
                                        <li>12:00 - Lunch</li>
                                        <li>13:00 - Drive to Bromo area</li>
                                        <li>16:00 - Check-in at Joglo Kecombrang</li>
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Accommodation:</p>
                                    <p>Joglo Kecombrang, Bromo</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Day 4 */}
                <div className="border rounded-lg mb-4">
                    <button
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                        onClick={() => toggleDay(4)}
                    >
                        <span className="font-semibold">Day 4: Bromo Sunrise Adventure and Return to Surabaya</span>
                        {activeDay === 4 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {activeDay === 4 && (
                        <div className="px-6 py-4 border-t">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Bromo Sunrise Experience</h4>
                                    <p>Starting at 2:00 AM, we'll head out for stargazing and a spectacular sunrise over Mount Bromo. Watch as the first rays of light illuminate the volcanic landscape, revealing Mount Batok, Mount Bromo, and Mount Semeru rising from the sand sea.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Afternoon in Surabaya</h4>
                                    <p>After breakfast and check-out, we'll drive to Surabaya. Enjoy an optional evening stroll in the city center before retiring at Holiday Inn Express.</p>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Today's Schedule:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>02:00 - Depart for sunrise viewpoint</li>
                                        <li>03:30 - Sunrise viewing and crater exploration</li>
                                        <li>09:00 - Breakfast at hotel</li>
                                        <li>12:00 - Depart for Surabaya</li>
                                        <li>15:00 - Check-in at Holiday Inn Express</li>
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Accommodation:</p>
                                    <p>Holiday Inn Express Surabaya Centerpoint</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Day 5 */}
                <div className="border rounded-lg mb-4">
                    <button
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                        onClick={() => toggleDay(5)}
                    >
                        <span className="font-semibold">Day 5: Departure from Surabaya</span>
                        {activeDay === 5 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {activeDay === 5 && (
                        <div className="px-6 py-4 border-t">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Departure Day</h4>
                                    <p>After breakfast at the hotel, you will be transferred to Juanda International Airport for your flight back home, taking with you memories of your amazing adventure in East Java.</p>
                                </div>
                                <div className="mt-4">
                                    <p className="font-semibold">Today's Schedule:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>08:00 - Breakfast at hotel</li>
                                        <li>10:00 - Check-out and airport transfer</li>
                                        <li>12:00 - End of tour</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Pricing & Payment */}
            <section className="bg-gray-50 py-8 px-4 mb-12">
                <h2 className="text-2xl font-bold mb-6">Tour Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Price Per Person</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span>11+ Persons</span>
                                <span className="font-semibold">IDR 3,600,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>8-10 Persons</span>
                                <span className="font-semibold">IDR 3,800,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>6-7 Persons</span>
                                <span className="font-semibold">IDR 4,200,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>4-5 Persons</span>
                                <span className="font-semibold">IDR 4,500,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>3 Persons</span>
                                <span className="font-semibold">IDR 4,800,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>2 Persons</span>
                                <span className="font-semibold">IDR 5,000,000</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold mb-4">Transportation Details</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>• 2-3 pax: Avanza with driver cum guide</li>
                            <li>• 4-9 pax: Hiace with escort guide</li>
                            <li>• 10-11 pax: Hiace + Avanza with escort guide and driver</li>
                        </ul>
                        <div className="mt-6">
                            <h4 className="font-semibold mb-2">Payment Terms</h4>
                            <ul className="space-y-2 text-gray-700">
                                <li>• 10% deposit to secure booking</li>
                                <li>• Full payment upon arrival</li>
                                <li>• Special group rates for 11+ persons</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Inclusions & Exclusions */}
            <section className="mb-12 px-4">
                <h2 className="text-2xl font-bold mb-6">What's Included & Excluded</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-green-600">Included</h3>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                4 nights accommodation as per itinerary
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Daily breakfast at hotels
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Private air-conditioned transportation
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Professional English-speaking guide
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Entrance tickets to all mentioned sites
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                4WD Jeep for Bromo tour
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-red-600">Not Included</h3>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">✕</span>
                                International/Domestic flights
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">✕</span>
                                Indonesian VISA
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">✕</span>
                                Travel insurance
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">✕</span>
                                Horse ride at Mount Bromo
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">✕</span>
                                Personal expenses
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-600 mr-2">✕</span>
                                Tips for guide and driver
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Final CTA & Contact */}
            <section className="bg-blue-600 text-white py-12 px-4 rounded-lg mb-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Ready to Explore East Java?</h2>
                    <p className="text-xl mb-6">Book now or contact us for more information</p>
                    <a href="https://javavolcano-touroperator.com/packages/surabaya/5d4n/8" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100" target="_blank">Book Your Adventure</a>
                    {/*<button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">*/}
                    {/*    Book Your Adventure*/}
                    {/*</button>*/}
                </div>
                <div className="flex justify-center space-x-8">
                    <div className="flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        <span>+62 822-4478-8833</span>
                    </div>
                    <div className="flex items-center">
                        <Mail className="w-5 h-5 mr-2" />
                        <span>hello@javavolcano-touroperator.com</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TourLandingPage;
