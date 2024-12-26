import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, MapPin, Calendar, DollarSign, Phone, Mail } from 'lucide-react';

// Hero Section Component
const HeroSection = ({ title, subtitle, imageUrl }) => (
    <div className="relative h-96 mb-8">
        <img
            src={imageUrl || "/api/placeholder/1200/400"}
            alt={title}
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-4">
            <h1 className="text-4xl font-bold mb-2 text-center">{title}</h1>
            <p className="text-xl mb-6">{subtitle}</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">
                Book Now
            </button>
        </div>
    </div>
);

// Overview Section Component
const OverviewSection = ({ overview }) => (
    <section className="mb-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Tour Overview</h2>
        <div className="text-gray-700 space-y-4">
            {overview.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
        </div>
    </section>
);

// Highlights Section Component
const HighlightsSection = ({ duration, startPoint, destinations, startingPrice }) => (
    <section className="bg-gray-50 py-8 px-4 mb-12">
        <h2 className="text-2xl font-bold mb-6">Key Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                    <h3 className="font-semibold">Duration</h3>
                    <p className="text-sm text-gray-600">{duration}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <MapPin className="w-8 h-8 text-blue-600" />
                <div>
                    <h3 className="font-semibold">Start/End Point</h3>
                    <p className="text-sm text-gray-600">{startPoint}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                    <h3 className="font-semibold">Destinations</h3>
                    <p className="text-sm text-gray-600">{destinations}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div>
                    <h3 className="font-semibold">Starting Price</h3>
                    <p className="text-sm text-gray-600">{startingPrice}</p>
                </div>
            </div>
        </div>
    </section>
);

// Itinerary Day Component
const ItineraryDay = ({ day, title, details, schedule }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border rounded-lg mb-4">
            <button
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold">Day {day}: {title}</span>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {isOpen && (
                <div className="px-6 py-4 border-t">
                    <div className="space-y-4">
                        {details.split('#next-stop#').map((section, index) => (
                            <div key={index}>
                                {section.split('\n').map((paragraph, pIndex) => {
                                    if (pIndex === 0) {
                                        return <h4 key={pIndex} className="font-semibold">{paragraph}</h4>;
                                    }
                                    return <p key={pIndex}>{paragraph}</p>;
                                })}
                            </div>
                        ))}
                        {schedule && (
                            <div className="mt-4">
                                <p className="font-semibold">Today's Schedule:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {schedule.map((time, index) => (
                                        <li key={index}>
                                            {Object.entries(time)[0][0]} - {Object.entries(time)[0][1]}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Pricing Section Component
const PricingSection = ({ prices, transportationDetails }) => (
    <section className="bg-gray-50 py-8 px-4 mb-12">
        <h2 className="text-2xl font-bold mb-6">Tour Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Price Per Person</h3>
                <div className="space-y-3">
                    {prices.map((price, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <span>{price.group_size}</span>
                            <span className="font-semibold">
                {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(price.price_per_person)}
              </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Transportation Details</h3>
                <ul className="space-y-2 text-gray-700">
                    {transportationDetails.map((detail, index) => (
                        <li key={index}>• {detail.pax} pax: {detail.name} with {detail.crew_role_name}</li>
                    ))}
                </ul>
            </div>
        </div>
    </section>
);

// Inclusions & Exclusions Component
const InclusionsExclusions = ({ included, excluded }) => (
    <section className="mb-12 px-4">
        <h2 className="text-2xl font-bold mb-6">What's Included & Excluded</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-4 text-green-600">Included</h3>
                <ul className="space-y-2">
                    {included.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4 text-red-600">Not Included</h3>
                <ul className="space-y-2">
                    {excluded.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-red-600 mr-2">✕</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </section>
);

// Main Tour Package Component
const TourPackage = ({ packageData }) => {
    const {
        name,
        duration,
        overview,
        destinations,
        itinerary,
        itinerary_details,
        package_price,
        transportation_and_crew,
        included,
        excluded
    } = packageData;

    return (
        <div className="max-w-6xl mx-auto">
            <HeroSection
                title={name}
                subtitle={`${duration.days} Days of Natural Wonders`}
                imageUrl="/api/placeholder/1200/400"
            />

            <OverviewSection overview={overview} />

            <HighlightsSection
                duration={duration.name}
                startPoint="Surabaya"
                destinations={destinations.map(d => d.name).join(', ')}
                startingPrice={`IDR ${package_price[package_price.length - 1].price_per_person.toLocaleString()}/person`}
            />

            <section className="mb-12 px-4">
                <h2 className="text-2xl font-bold mb-6">Day-by-Day Itinerary</h2>
                {itinerary.map((day, index) => (
                    <ItineraryDay
                        key={index}
                        day={day.day}
                        title={day.title}
                        details={day.details}
                        schedule={itinerary_details[index].time}
                    />
                ))}
            </section>

            <PricingSection
                prices={package_price}
                transportationDetails={transportation_and_crew}
            />

            <InclusionsExclusions
                included={[
                    "4 nights accommodation as per itinerary",
                    "Daily breakfast at hotels",
                    "Private air-conditioned transportation",
                    "Professional English-speaking guide",
                    "Entrance tickets to all mentioned sites",
                    "4WD Jeep for Bromo tour"
                ]}
                excluded={excluded}
            />

            <section className="bg-blue-600 text-white py-12 px-4 rounded-lg mb-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Ready to Explore East Java?</h2>
                    <p className="text-xl mb-6">Book now or contact us for more information</p>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
                        Book Your Adventure
                    </button>
                </div>
                <div className="flex justify-center space-x-8">
                    <div className="flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        <span>+62 812-3456-7890</span>
                    </div>
                    <div className="flex items-center">
                        <Mail className="w-5 h-5 mr-2" />
                        <span>info@javavolcano-touroperator.com</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TourPackage;
