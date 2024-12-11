import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ExpenseCalculator = () => {
    const [pax, setPax] = useState(2);
    const [duration] = useState('3D 2N');

    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);

    const ExpenseRow = ({ title, unit, quantity, rate }) => {
        const amount = rate * quantity;
        return (
            <div className="grid grid-cols-4 gap-4 py-2 text-sm border-b border-gray-100 last:border-0">
                <div>{title}</div>
                <div className="text-right text-gray-600">{unit}</div>
                <div className="text-right text-gray-600">{quantity}</div>
                <div className="text-right font-medium">
                    {rate ? `IDR ${formatCurrency(amount)}` : '-'}
                </div>
            </div>
        );
    };

    const CategoryCard = ({ title, items, totalAmount }) => (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <ExpenseRow key={idx} {...item} />
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                    <span className="font-semibold">Total {title}</span>
                    <span className="font-semibold text-blue-600">
            IDR {formatCurrency(totalAmount)}
          </span>
                </div>
            </CardContent>
        </Card>
    );

    // Calculate category totals based on pax
    const accommodationTotal = pax === 2
        ? (275000 + (60000 * pax) + 750000)
        : (450000 + (60000 * pax) + 950000);

    const activitiesTotal = (75000 * pax) + 250000 + (25000 * pax) +
        (150000 * pax) + 500000 + (90000 * pax) + 100000;

    const transportationTotal = pax === 2
        ? (200000 * 3) + (200000 * 3)
        : (250000 * 3) + (200000 * 3);

    const othersTotal = (250000 * 3) + 100000 + 50000 + (60000 * pax) + 200000;

    const expenseTotal = accommodationTotal + activitiesTotal + transportationTotal + othersTotal;
    const invoiceTotal = pax === 2 ? 5632000 : 8160000;
    const profitTotal = invoiceTotal - expenseTotal;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Duration</label>
                    <select className="w-full p-2 border rounded-lg bg-white shadow-sm">
                        <option>{duration}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Pax</label>
                    <select
                        className="w-full p-2 border rounded-lg bg-white shadow-sm"
                        value={pax}
                        onChange={(e) => setPax(Number(e.target.value))}
                    >
                        <option value={2}>2 Pax</option>
                        <option value={3}>3 Pax</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Crew</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-lg bg-white shadow-sm"
                        placeholder="Enter crew name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-lg bg-white shadow-sm"
                        defaultValue="KLOOK"
                    />
                </div>
            </div>

            <CategoryCard
                title="Accommodation"
                items={[
                    {
                        title: `Baratha Hotel - ${pax === 2 ? 'Deluxe' : 'Apartment'}`,
                        unit: 'Night',
                        quantity: 1,
                        rate: pax === 2 ? 275000 : 450000
                    },
                    {
                        title: `Joglo Kecombrang - ${pax === 2 ? 'Deluxe' : 'Family'}`,
                        unit: 'Night',
                        quantity: 1,
                        rate: pax === 2 ? 750000 : 950000
                    }
                ]}
                totalAmount={accommodationTotal}
            />

            <CategoryCard
                title="Activities"
                items={[
                    {
                        title: 'Ijen Crater Ticket',
                        unit: 'Pax',
                        quantity: pax,
                        rate: 75000
                    },
                    {
                        title: 'Ijen Local Guide',
                        unit: 'Trip',
                        quantity: 1,
                        rate: 250000
                    },
                    {
                        title: 'Coffee + Indo Mee',
                        unit: 'Pax',
                        quantity: pax,
                        rate: 25000
                    },
                    {
                        title: 'Bromo Ticket',
                        unit: 'Pax',
                        quantity: pax,
                        rate: 150000
                    },
                    {
                        title: 'Bromo Jeep',
                        unit: 'Unit',
                        quantity: 1,
                        rate: 500000
                    },
                    {
                        title: 'Motor + Ticket',
                        unit: 'Pax',
                        quantity: pax,
                        rate: 90000
                    },
                    {
                        title: 'Madakaripura Local Guide',
                        unit: 'Trip',
                        quantity: 1,
                        rate: 100000
                    }
                ]}
                totalAmount={activitiesTotal}
            />

            <CategoryCard
                title="Transportation"
                items={[
                    {
                        title: `${pax === 2 ? 'Sigra' : 'Avanza'}`,
                        unit: 'Day',
                        quantity: 3,
                        rate: pax === 2 ? 200000 : 250000
                    },
                    {
                        title: 'Fuel',
                        unit: 'Day',
                        quantity: 3,
                        rate: 200000
                    }
                ]}
                totalAmount={transportationTotal}
            />

            <CategoryCard
                title="Others"
                items={[
                    {
                        title: 'Driver',
                        unit: 'Day',
                        quantity: 3,
                        rate: 250000
                    },
                    {
                        title: 'Transport',
                        unit: 'Trip',
                        quantity: 1,
                        rate: 100000
                    },
                    {
                        title: 'Mineral Water',
                        unit: 'Box',
                        quantity: 1,
                        rate: 50000
                    },
                    {
                        title: 'T-shirt',
                        unit: 'Pax',
                        quantity: pax,
                        rate: 60000
                    },
                    {
                        title: 'Toll & Parking',
                        unit: 'Trip',
                        quantity: 1,
                        rate: 200000
                    }
                ]}
                totalAmount={othersTotal}
            />

            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between text-lg">
                            <span className="font-semibold">Total Invoice</span>
                            <span className="font-bold">IDR {formatCurrency(invoiceTotal)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span className="font-semibold">Total Expense</span>
                            <span className="font-bold">IDR {formatCurrency(expenseTotal)}</span>
                        </div>
                        <div className="flex justify-between text-lg pt-4 border-t">
                            <span className="font-semibold">Net Profit</span>
                            <span className={`font-bold ${profitTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                IDR {formatCurrency(profitTotal)}
              </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpenseCalculator;
