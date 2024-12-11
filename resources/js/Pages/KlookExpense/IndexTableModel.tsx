import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function ExpenseTemplate() {
    const [pax, setPax] = useState(2);
    const [duration, setDuration] = useState('3D 2N');

    const calculateAmount = (rate, quantity) => rate * quantity;

    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);

    const ExpenseRow = ({ title, unit, quantity, rate, indent = false }) => {
        const amount = calculateAmount(rate, quantity);
        return (
            <div className={`grid grid-cols-5 py-2 text-sm ${indent ? 'pl-6' : ''}`}>
                <div className="col-span-2">{title}</div>
                <div>{unit}</div>
                <div className="text-right">{quantity}</div>
                <div className="text-right">{rate ? formatCurrency(rate) : '-'}</div>
                <div className="text-right">{amount ? formatCurrency(amount) : '-'}</div>
            </div>
        );
    };

    const CategoryHeader = ({ title }) => (
        <div className="grid grid-cols-5 py-2 bg-gray-50 font-semibold">
            <div className="col-span-2">{title}</div>
            <div>Unit</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Amount</div>
        </div>
    );

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Header Info */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <select className="w-full p-2 border rounded-lg">
                        <option>3D 2N</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Pax</label>
                    <select
                        className="w-full p-2 border rounded-lg"
                        value={pax}
                        onChange={(e) => setPax(Number(e.target.value))}
                    >
                        <option value={2}>2 Pax</option>
                        <option value={3}>3 Pax</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Crew</label>
                    <input type="text" className="w-full p-2 border rounded-lg" placeholder="Crew" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <input type="text" className="w-full p-2 border rounded-lg" defaultValue="KLOOK" />
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    {/* A Bondowoso Tour */}
                    <CategoryHeader title="A Bondowoso Tour" />
                    <ExpenseRow title="A2 Accommodation" />
                    <ExpenseRow
                        title={`- Baratha Hotel - ${pax === 2 ? 'Deluxe' : 'Apartment'}`}
                        unit="No"
                        quantity={1}
                        rate={pax === 2 ? 275000 : 450000}
                        indent
                    />
                    <ExpenseRow
                        title="- Baratha - Dinner"
                        unit="Pax"
                        quantity={pax}
                        rate={60000}
                        indent
                    />

                    <ExpenseRow title="A3 Activities" />
                    <ExpenseRow
                        title="- Ijen Crater Ticket"
                        unit="Pax"
                        quantity={pax}
                        rate={75000}
                        indent
                    />
                    <ExpenseRow
                        title="- Ijen Local Guide"
                        unit="No"
                        quantity={1}
                        rate={250000}
                        indent
                    />
                    <ExpenseRow
                        title="- Coffee + Indo Mee"
                        unit="Pax"
                        quantity={pax}
                        rate={25000}
                        indent
                    />

                    {/* B Bromo Tour */}
                    <CategoryHeader title="B Bromo Tour" />
                    <ExpenseRow title="B1 Bromo Ticket" />
                    <ExpenseRow
                        title="- Bromo Ticket"
                        unit="Pax"
                        quantity={pax}
                        rate={150000}
                        indent
                    />
                    <ExpenseRow
                        title="- Bromo Jeep"
                        unit="Unit"
                        quantity={1}
                        rate={500000}
                        indent
                    />

                    <ExpenseRow title="B2 Accommodation" />
                    <ExpenseRow
                        title={`- Joglo Kecombrang - ${pax === 2 ? 'Deluxe' : 'Family'}`}
                        unit="No"
                        quantity={1}
                        rate={pax === 2 ? 750000 : 950000}
                        indent
                    />

                    <ExpenseRow title="B3 Madakaripura falls" />
                    <ExpenseRow
                        title="- Motor + Ticket"
                        unit="Pax"
                        quantity={pax}
                        rate={90000}
                        indent
                    />
                    <ExpenseRow
                        title="- Madakaripura Local Guide"
                        unit="No"
                        quantity={1}
                        rate={100000}
                        indent
                    />

                    {/* E Land Transportation */}
                    <CategoryHeader title="E Land Transportation" />
                    <ExpenseRow title="E2 Transportation" />
                    <ExpenseRow
                        title={`- ${pax === 2 ? 'Sigra' : 'Avanza'}`}
                        unit="Day x Qty"
                        quantity={3}
                        rate={pax === 2 ? 200000 : 250000}
                        indent
                    />
                    <ExpenseRow
                        title="- Fuel"
                        unit="Day x Qty"
                        quantity={3}
                        rate={200000}
                        indent
                    />

                    {/* G Others */}
                    <CategoryHeader title="G Others" />
                    <ExpenseRow title="G1" />
                    <ExpenseRow
                        title="- Driver"
                        unit="Day x Qty"
                        quantity={3}
                        rate={250000}
                        indent
                    />
                    <ExpenseRow
                        title="- Transport"
                        unit="Day x Qty"
                        quantity={1}
                        rate={100000}
                        indent
                    />
                    <ExpenseRow
                        title="- Mineral Water"
                        unit="Box"
                        quantity={1}
                        rate={50000}
                        indent
                    />
                    <ExpenseRow
                        title="- Tshirt"
                        unit="Pax"
                        quantity={pax}
                        rate={60000}
                        indent
                    />
                    <ExpenseRow
                        title="- Tol & Parking"
                        unit="Trip"
                        quantity={1}
                        rate={200000}
                        indent
                    />

                    {/* Summary */}
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between font-semibold">
                            <span>INVOICE</span>
                            <span>IDR {formatCurrency(pax === 2 ? 5632000 : 8160000)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span>EXPENSE</span>
                            <span>IDR {formatCurrency(pax === 2 ? 5095000 : 6080000)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-green-600">
                            <span>PROFIT</span>
                            <span>IDR {formatCurrency(pax === 2 ? 537000 : 2080000)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
