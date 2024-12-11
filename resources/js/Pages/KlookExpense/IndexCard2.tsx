import React, { useState } from 'react';
import {
    Users, CreditCard, Calculator, TrendingUp, TrendingDown,
    Building2, Car, Coffee, Mountain, DollarSign,
    ChevronDown, Package, Wallet, FileSpreadsheet, Tag, List
} from 'lucide-react';

// UI Components (simplified for brevity)
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
        {children}
    </div>
);

export default function ExpenseCalculator() {
    const [pax, setPax] = useState(2);
    const [packageType, setPackageType] = useState('KLOOK_3D2N');
    const [selectedHotels, setSelectedHotels] = useState({
        bondowoso: 'deluxe',
        bromo: 'deluxe'
    });
    const [selectedVehicle, setSelectedVehicle] = useState('sigra');

    // Rates definition (similar to previous version)
    const rates = {
        hotels: {
            bondowoso: {
                deluxe: {
                    name: 'Baratha Hotel - Deluxe',
                    rate: 275000,
                    details: [
                        { item: 'Room', unit: 'Night', quantity: 2, rate: 275000 }
                    ]
                },
                apartment: {
                    name: 'Baratha Hotel - Apartment',
                    rate: 450000,
                    details: [
                        { item: 'Room', unit: 'Night', quantity: 2, rate: 450000 }
                    ]
                }
            },
            bromo: {
                deluxe: {
                    name: 'Joglo Kecombrang - Deluxe',
                    rate: 750000,
                    details: [
                        { item: 'Room', unit: 'Night', quantity: 1, rate: 750000 }
                    ]
                },
                family: {
                    name: 'Joglo Kecombrang - Family',
                    rate: 950000,
                    details: [
                        { item: 'Room', unit: 'Night', quantity: 1, rate: 950000 }
                    ]
                }
            }
        },
        activities: {
            ijen: {
                name: 'Ijen Package',
                details: [
                    { item: 'Ticket', unit: 'Person', quantity: 'pax', rate: 75000 },
                    { item: 'Guide', unit: 'Group', quantity: 1, rate: 250000 },
                    { item: 'Meal', unit: 'Person', quantity: 'pax', rate: 25000 }
                ]
            },
            bromo: {
                name: 'Bromo Package',
                details: [
                    { item: 'Ticket', unit: 'Person', quantity: 'pax', rate: 150000 },
                    { item: 'Jeep', unit: 'Group', quantity: 1, rate: 500000 }
                ]
            },
            madakaripura: {
                name: 'Madakaripura Package',
                details: [
                    { item: 'Ticket', unit: 'Person', quantity: 'pax', rate: 90000 },
                    { item: 'Guide', unit: 'Group', quantity: 1, rate: 100000 }
                ]
            }
        },
        vehicles: {
            sigra: {
                name: 'Sigra',
                rate: 200000,
                details: [
                    { item: 'Vehicle Rental', unit: 'Day', quantity: 3, rate: 200000 }
                ]
            },
            avanza: {
                name: 'Toyota Avanza',
                rate: 250000,
                details: [
                    { item: 'Vehicle Rental', unit: 'Day', quantity: 3, rate: 250000 }
                ]
            }
        },
        misc: {
            details: [
                { item: 'Driver Fee', unit: 'Day', quantity: 3, rate: 250000 },
                { item: 'Transport Allowance', unit: 'Trip', quantity: 1, rate: 100000 },
                { item: 'Mineral Water', unit: 'Bottle', quantity: 1, rate: 50000 },
                { item: 'T-shirt', unit: 'Person', quantity: 'pax', rate: 60000 }
            ]
        },
        packageRates: {
            'KLOOK_3D2N': {
                2: 5632000,
                3: 8160000
            }
        }
    };

    const calculateTotals = () => {
        const bondowosoHotelCost = rates.hotels.bondowoso[selectedHotels.bondowoso].rate;
        const bromoHotelCost = rates.hotels.bromo[selectedHotels.bromo].rate;
        const accommodation = bondowosoHotelCost + bromoHotelCost;

        const ijenCost = (rates.activities.ijen.ticket * pax) + rates.activities.ijen.guide + (rates.activities.ijen.meal * pax);
        const bromoCost = (rates.activities.bromo.ticket * pax) + rates.activities.bromo.jeep;
        const madakaripuraCost = (rates.activities.madakaripura.ticket * pax) + rates.activities.madakaripura.guide;
        const activities = ijenCost + bromoCost + madakaripuraCost;

        const transport = rates.vehicles[selectedVehicle].rate * 3;

        const misc = (rates.other.driver.rate * 3) + rates.other.transport.rate + rates.other.water.rate + (rates.other.tshirt.rate * pax);

        const grandTotal = accommodation + activities + transport + misc;
        const invoice = packageRates[packageType][pax] || 0;
        const revenue = invoice - grandTotal;

        return {
            accommodation,
            activities,
            transport,
            misc,
            grandTotal,
            invoice,
            revenue,
            ijen: ijenCost,
            bromo: bromoCost,
            madakaripura: madakaripuraCost
        };
    };


    const totals = calculateTotals();
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);

    // New Detailed Item Breakdown Component
    const DetailedItemBreakdown = ({ title, items, total, icon: Icon }) => (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-500" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="border-b pb-2">
                    <div className="grid grid-cols-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div>Item</div>
                        <div className="text-center">Unit</div>
                        <div className="text-center">Quantity</div>
                        <div className="text-right">Rate</div>
                    </div>
                </div>
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-4 items-center py-2 border-b last:border-b-0"
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-center text-sm">{item.unit}</div>
                        <div className="text-center text-sm">{item.quantity}</div>
                        <div className="text-right text-sm font-semibold">
                            IDR {formatCurrency(item.rate)}
                        </div>
                    </div>
                ))}
                <div className="pt-2 mt-2 border-t flex justify-between items-center">
                    <span className="text-sm font-semibold">Total {title}</span>
                    <span className="text-lg font-bold">IDR {formatCurrency(total)}</span>
                </div>
            </CardContent>
        </Card>
    );

    // Prepare item breakdowns
    const accommodationItems = [
        {
            name: rates.hotels.bondowoso[selectedHotels.bondowoso].name,
            unit: 'Night',
            quantity: 2,
            rate: rates.hotels.bondowoso[selectedHotels.bondowoso].rate
        },
        {
            name: rates.hotels.bromo[selectedHotels.bromo].name,
            unit: 'Night',
            quantity: 1,
            rate: rates.hotels.bromo[selectedHotels.bromo].rate
        }
    ];

    const activitiesItems = [
        {
            name: 'Ijen Ticket',
            unit: 'Person',
            quantity: pax,
            rate: rates.activities.ijen.ticket
        },
        {
            name: 'Ijen Guide',
            unit: 'Trip',
            quantity: 1,
            rate: rates.activities.ijen.guide
        },
        {
            name: 'Ijen Meal',
            unit: 'Person',
            quantity: pax,
            rate: rates.activities.ijen.meal
        },
        {
            name: 'Bromo Ticket',
            unit: 'Person',
            quantity: pax,
            rate: rates.activities.bromo.ticket
        },
        {
            name: 'Bromo Jeep',
            unit: 'Trip',
            quantity: 1,
            rate: rates.activities.bromo.jeep
        },
        {
            name: 'Madakaripura Ticket',
            unit: 'Person',
            quantity: pax,
            rate: rates.activities.madakaripura.ticket
        },
        {
            name: 'Madakaripura Guide',
            unit: 'Trip',
            quantity: 1,
            rate: rates.activities.madakaripura.guide
        }
    ];

    const transportItems = [
        {
            name: rates.vehicles[selectedVehicle].name,
            unit: 'Day',
            quantity: 3,
            rate: rates.vehicles[selectedVehicle].rate
        }
    ];

    const miscItems = [
        {
            name: 'Driver',
            unit: 'Day',
            quantity: 3,
            rate: rates.other.driver.rate
        },
        {
            name: 'Transport Allowance',
            unit: 'Trip',
            quantity: 1,
            rate: rates.other.transport.rate
        },
        {
            name: 'Mineral Water',
            unit: 'Package',
            quantity: 1,
            rate: rates.other.water.rate
        },
        {
            name: 'T-shirt',
            unit: 'Person',
            quantity: pax,
            rate: rates.other.tshirt.rate
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <div className="p-4">
                        <h4 className="text-gray-500">Total Expenses</h4>
                        <p className="text-2xl font-bold">IDR {new Intl.NumberFormat('id-ID').format(totals.grandTotal)}</p>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <h4 className="text-gray-500">Invoice Amount</h4>
                        <p className="text-2xl font-bold">IDR {new Intl.NumberFormat('id-ID').format(totals.invoice)}</p>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <h4 className="text-gray-500">Revenue</h4>
                        <p className="text-2xl font-bold text-green-600">
                            IDR {new Intl.NumberFormat('id-ID').format(totals.revenue)}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Pax Selection */}
            <div className="mb-6">
                <label className="block mb-2">Number of Pax</label>
                <select
                    value={pax}
                    onChange={(e) => setPax(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                >
                    {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                        <option key={num} value={num}>{num} Pax</option>
                    ))}
                </select>
            </div>

            {/* Detailed Expense Cards */}
            <DetailedExpenseCard
                title="Accommodation"
                items={[
                    ...rates.hotels.bondowoso[selectedHotels.bondowoso].details,
                    ...rates.hotels.bromo[selectedHotels.bromo].details
                ]}
                pax={pax}
            />

            <DetailedExpenseCard
                title="Activities"
                items={[
                    ...rates.activities.ijen.details,
                    ...rates.activities.bromo.details,
                    ...rates.activities.madakaripura.details
                ]}
                pax={pax}
            />

            <DetailedExpenseCard
                title="Transportation"
                items={rates.vehicles[selectedVehicle].details}
                pax={pax}
            />

            <DetailedExpenseCard
                title="Miscellaneous"
                items={rates.misc.details}
                pax={pax}
            />
        </div>
    );
}
