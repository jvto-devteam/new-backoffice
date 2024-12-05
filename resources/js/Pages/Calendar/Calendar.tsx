import React, { useState } from 'react';
import Main from '@/Layouts/Main';
import { router } from '@inertiajs/react';
import { format, parse, addDays, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Plus, Hotel, Car, User, Users, CalendarDays,
    Building2, MapPin, Clock
} from 'lucide-react';

// Card Components from your example
const GlassCard = ({ children, className = '', glow = false }) => (
    <div className={`
    relative backdrop-blur-xl bg-white/40 dark:bg-gray-800/40
    border border-white/20 dark:border-gray-700/20
    rounded-2xl shadow-lg
    ${glow ? 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10 before:animate-pulse before:-z-10' : ''}
    transition-all duration-500 ease-out
    hover:shadow-xl hover:shadow-blue-500/10
    ${className}
  `}>
        {children}
    </div>
);

const CardContent = ({ className, children, ...props }) => (
    <div className={`${className}`} {...props}>
        {children}
    </div>
);

const EventModal = ({ isOpen, onClose, selectedDate = null, eventType = null }) => {
    const [formData, setFormData] = useState({
        type: eventType || 'booking',
        title: '',
        start_date: selectedDate || '',
        end_date: '',
        details: {}
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Add New Event</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Event Type</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="booking">Booking</option>
                                <option value="accommodation">Accommodation</option>
                                <option value="transportation">Transportation</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>

                        {formData.type === 'booking' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Guests</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                        value={formData.details.guests || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            details: { ...formData.details, guests: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Package</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                        value={formData.details.package || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            details: { ...formData.details, package: e.target.value }
                                        })}
                                    >
                                        <option value="">Select Package</option>
                                        <option value="bromo">Bromo Package</option>
                                        <option value="ijen">Ijen Package</option>
                                        <option value="bromo-ijen">Bromo-Ijen Package</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {formData.type === 'accommodation' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hotel</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                        value={formData.details.hotel || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            details: { ...formData.details, hotel: e.target.value }
                                        })}
                                    >
                                        <option value="">Select Hotel</option>
                                        <option value="Grand Padis">Grand Padis</option>
                                        <option value="Baratha">Baratha</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Room Type</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                        value={formData.details.roomType || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            details: { ...formData.details, roomType: e.target.value }
                                        })}
                                    >
                                        <option value="">Select Room Type</option>
                                        <option value="Deluxe Twin">Deluxe Twin</option>
                                        <option value="Deluxe Double">Deluxe Double</option>
                                        <option value="Family">Family</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {formData.type === 'transportation' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Vehicle</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                        value={formData.details.vehicle || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            details: { ...formData.details, vehicle: e.target.value }
                                        })}
                                    >
                                        <option value="">Select Vehicle</option>
                                        <option value="Avanza">Avanza</option>
                                        <option value="Innova">Innova</option>
                                        <option value="Hiace">Hiace</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Driver</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
                                        value={formData.details.driver || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            details: { ...formData.details, driver: e.target.value }
                                        })}
                                    >
                                        <option value="">Select Driver</option>
                                        <option value="Yandi">Yandi</option>
                                        <option value="Fredi">Fredi</option>
                                        <option value="Gean">Gean</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Add this before your Index component
const DUMMY_EVENTS = [
    // Booking Events
    {
        id: 1,
        title: 'Bromo Tour - Annie Ho (4 PAX)',
        start: '2024-12-06',
        end: '2024-12-08',
        extendedProps: {
            type: 'booking',
            details: {
                customer: 'Annie Ho',
                guests: 4,
                package: 'Bromo Tour',
                pickup: 'Surabaya Airport',
                dropoff: 'Bali'
            }
        },
        backgroundColor: '#3b82f6', // blue
        borderColor: '#3b82f6'
    },
    {
        id: 2,
        title: 'Ijen Tour - Rachel Ng (2 PAX)',
        start: '2024-12-10',
        end: '2024-12-13',
        extendedProps: {
            type: 'booking',
            details: {
                customer: 'Rachel Ng',
                guests: 2,
                package: 'Ijen Tour',
                pickup: 'Bali',
                dropoff: 'Surabaya Hotel'
            }
        },
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6'
    },

    // Accommodation Events
    {
        id: 3,
        title: 'Grand Padis - 2 Rooms',
        start: '2024-12-06',
        end: '2024-12-07',
        extendedProps: {
            type: 'accommodation',
            details: {
                hotel: 'Grand Padis',
                rooms: [
                    { type: 'Deluxe Twin', quantity: 1 },
                    { type: 'Family Room', quantity: 1 }
                ],
                guestName: 'Annie Ho Group'
            }
        },
        backgroundColor: '#22c55e', // green
        borderColor: '#22c55e'
    },
    {
        id: 4,
        title: 'Baratha - 1 Room',
        start: '2024-12-10',
        end: '2024-12-11',
        extendedProps: {
            type: 'accommodation',
            details: {
                hotel: 'Baratha',
                rooms: [
                    { type: 'Deluxe Twin', quantity: 1 }
                ],
                guestName: 'Rachel Ng Group'
            }
        },
        backgroundColor: '#22c55e',
        borderColor: '#22c55e'
    },

    // Transportation Events
    {
        id: 5,
        title: 'Airport Transfer - Hiace',
        start: '2024-03-26T08:00:00',
        extendedProps: {
            type: 'transportation',
            details: {
                vehicle: 'Hiace',
                driver: 'Yandi',
                route: 'Surabaya Airport - Bromo',
                group: 'Annie Ho Group'
            }
        },
        backgroundColor: '#f97316', // orange
        borderColor: '#f97316'
    },
    {
        id: 6,
        title: 'Shuttle Airport',
        start: '2024-12-06T12:23:00',
        extendedProps: {
            type: 'transportation',
            details: {
                vehicle: 'Innova',
                driver: 'Fredi',
                route: 'Hotel - Airport',
                group: 'Zhou Group'
            }
        },
        backgroundColor: '#f97316',
        borderColor: '#f97316'
    }
];

const Index = ({ data }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEventType, setSelectedEventType] = useState(null);

    const [events, setEvents] = useState(DUMMY_EVENTS);

    const handleDateSelect = (selectInfo) => {
        setSelectedDate(selectInfo.startStr);
        setModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        // Handle event click
        console.log(clickInfo.event);
    };

    const handleAddEvent = (type) => {
        setSelectedEventType(type);
        setModalOpen(true);
    };

    return (
        <Main>
            <div className="min-h-screen">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar Management</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddEvent('booking')}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                New Booking
                            </button>
                            <button
                                onClick={() => handleAddEvent('accommodation')}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4" />
                                New Accommodation
                            </button>
                            <button
                                onClick={() => handleAddEvent('transportation')}
                                className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                                <Plus className="w-4 h-4" />
                                New Transportation
                            </button>
                        </div>
                    </div>

                    <GlassCard>
                        <CardContent className="p-6">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                selectable={true}
                                select={handleDateSelect}
                                eventClick={handleEventClick}
                                events={events}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth'
                                }}
                                height="auto"
                            />
                        </CardContent>
                    </GlassCard>
                </div>

                <EventModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    selectedDate={selectedDate}
                    eventType={selectedEventType}
                />
            </div>
        </Main>
    );
};

export default Index;
