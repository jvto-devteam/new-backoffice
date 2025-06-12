import React, { useState, useEffect, useMemo } from "react";
import {
    Calendar,
    Users,
    Car,
    AlertTriangle,
    RefreshCw,
    Search,
    Filter,
    ChevronRight,
    MapPin,
    Phone,
    Mail,
    DollarSign,
    Clock,
    Moon,
    Sun,
    X,
    ChevronDown,
    Building,
    Plane,
    Hotel,
    CreditCard,
} from "lucide-react";
import Main from "@/Layouts/Main";
import { Link } from "@inertiajs/react";

// Helper functions for date parsing
const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Handle 'YYYY-MM-DD' format
    if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts.length === 3 && parts[0].length === 4) {
            return new Date(dateStr);
        }
    }

    // Handle 'DD Mon YY' format
    const months = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
    };
    const dateParts = dateStr.split(/[\s,]+/);
    if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const monthName =
            dateParts[1].charAt(0).toUpperCase() +
            dateParts[1].slice(1).toLowerCase();
        const month = months[monthName];
        let year = parseInt(dateParts[2], 10);
        if (year < 100) year += 2000;

        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(Date.UTC(year, month, day));
        }
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
};

// Calculate booking status based on current date
const getBookingStatus = (booking) => {
    const today = new Date("2025-06-12T00:00:00Z");

    const startDate = parseDate(booking.date.start_ymd);
    const endDate = parseDate(booking.date.end_ymd);

    if (!startDate || !endDate || startDate > endDate) return "unknown";

    endDate.setUTCHours(23, 59, 59, 999);

    if (endDate < today) return "completed";
    if (startDate > today) return "upcoming";
    return "ongoing";
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

            if (
                !start1 ||
                !end1 ||
                !start2 ||
                !end2 ||
                start1 > end1 ||
                start2 > end2
            )
                continue;

            end1.setUTCHours(23, 59, 59, 999);
            end2.setUTCHours(23, 59, 59, 999);

            const overlap = start1 <= end2 && start2 <= end1;

            if (overlap) {
                const drivers1 = booking1.drivers || [];
                const drivers2 = booking2.drivers || [];
                for (const driver1 of drivers1) {
                    for (const driver2 of drivers2) {
                        if (
                            driver1.id === driver2.id &&
                            driver1.name !== "GARAGE"
                        ) {
                            conflicts.push({
                                type: "driver",
                                resource: driver1.name,
                                resourceId: driver1.id,
                                bookings: [booking1.id, booking2.id],
                                dates: {
                                    booking1: `${booking1.date.start} - ${booking1.date.end}`,
                                    booking2: `${booking2.date.start} - ${booking2.date.end}`,
                                },
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
                                type: "vehicle",
                                resource: vehicle1,
                                bookings: [booking1.id, booking2.id],
                                dates: {
                                    booking1: `${booking1.date.start} - ${booking1.date.end}`,
                                    booking2: `${booking2.date.start} - ${booking2.date.end}`,
                                },
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
    if (amount === null || amount === undefined) return "N/A";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numAmount);
};

// --- Sub-Components ---

const TourCard = ({ booking, conflicts, onClick }) => {
    const status = getBookingStatus(booking);
    const bookingConflicts = conflicts.filter((c) =>
        c.bookings.includes(booking.id),
    );
    const hasConflict = bookingConflicts.length > 0;

    const statusColors = {
        upcoming:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700",
        ongoing:
            "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700",
        completed:
            "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 border-gray-200 dark:border-gray-600",
        unknown:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
    };

    return (
        <div
            onClick={onClick}
            className="bg-white mt-4 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 relative overflow-hidden"
        >
            {booking.financial.paymentMethod && (
                <div className="absolute top-0 right-0 w-16 h-16">
                    <div
                        className={`absolute transform rotate-45 ${booking.financial.paymentMethod == "cash" && "bg-green-500"} ${booking.financial.paymentMethod == "cc" && "bg-amber-500"} ${booking.financial.paymentMethod == "wise" && "bg-blue-500"} ${booking.financial.paymentMethod == "edc" && "bg-red-500"} text-white text-xs font-bold py-1 right-[-20px] top-[12px] w-[84px] text-center shadow-sm`}
                    >
                        {booking.financial.paymentMethod.toUpperCase()}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-8">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
                            {booking.id}
                        </h3>
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.unknown}`}
                        >
                            {status.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {booking.guest}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 text-sm mt-1">
                        <Users className="w-4 h-4" />
                        {booking.total_pax} pax
                    </p>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        {booking.date.start} - {booking.date.end} (
                        {booking.duration})
                    </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        {booking.drivers.map((d, i) => (
                            <span key={i}>
                                {d.name}
                                {booking.drivers.length != i + 1 && ", "}
                            </span>
                        ))}
                        {booking.drivers.length != 0 && ", "}
                        {booking.guides.map((d, i) => (
                            <span key={i}>
                                {d.name}
                                {d.type == "Ijen" && " (IJEN)"}
                                {booking.guides.length != i + 1 && ", "}
                            </span>
                        ))}
                    </span>
                </div>

                {booking.vehicles && booking.vehicles.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Car className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                            {booking.vehicles.join(", ")}
                        </span>
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
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Informasi Tamu
            </h4>
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
    const [activeTab, setActiveTab] = useState("itinerary");

    if (!booking) return null;

    const tabs = [
        { id: "itinerary", label: "Itinerary", icon: MapPin },
        { id: "transport", label: "Transport & Kru", icon: Car },
        { id: "accommodation", label: "Akomodasi", icon: Building },
        { id: "finance", label: "Finansial", icon: DollarSign },
        { id: "notes", label: "Catatan", icon: Clock },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 z-[1000] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold mb-2">
                                {booking.id}: {booking.guest}
                            </h2>
                            <p className="text-blue-100 text-sm sm:text-base">
                                {booking.total_pax} Pax | {booking.date.start} -{" "}
                                {booking.date.end}
                            </p>
                            {booking.package && (
                                <p className="text-blue-100 text-xs sm:text-sm mt-1">
                                    {booking.package}
                                </p>
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
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500"
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
                    {activeTab === "itinerary" && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                                        <Plane className="w-5 h-5" />
                                        <h4 className="font-semibold">
                                            Penjemputan
                                        </h4>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {booking.pickup?.text}
                                    </p>
                                    {booking.pickup?.pickup_time && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Waktu: {booking.pickup.pickup_time}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/40 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-800 dark:text-red-300 mb-2">
                                        <Plane className="w-5 h-5 transform rotate-90" />
                                        <h4 className="font-semibold">
                                            Pengantaran
                                        </h4>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {booking.dropoff?.text}
                                    </p>
                                    {booking.dropoff?.drop_time && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Waktu: {booking.dropoff.drop_time}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                                    Itinerary Harian
                                </h4>
                                {booking.itinerary?.map((day, index) => (
                                    <div
                                        key={index}
                                        className="border-l-4 border-blue-500 pl-4 py-2"
                                    >
                                        <h4 className="font-semibold text-base mb-1 text-gray-900 dark:text-gray-100">
                                            Hari {day.day} ({day.date})
                                        </h4>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {day.itinerary}
                                        </p>
                                        {day.activity && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Aktivitas: {day.activity}
                                            </p>
                                        )}
                                        {day.destination && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Destinasi: {day.destination}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {booking.guestDetails &&
                                booking.orderChannel != "TWT" && (
                                    <GuestInfo
                                        guestDetails={booking.guestDetails}
                                    />
                                )}
                        </div>
                    )}

                    {activeTab === "transport" && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                                    Driver
                                </h4>
                                {booking.drivers &&
                                booking.drivers.length > 0 ? (
                                    <div className="grid gap-3">
                                        {booking.drivers.map(
                                            (driver, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center gap-4"
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={driver.photo}
                                                            alt={driver.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display =
                                                                    "none";
                                                                e.target.nextSibling.style.display =
                                                                    "flex";
                                                            }}
                                                        />
                                                        <div className="hidden items-center justify-center w-full h-full">
                                                            <Users className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {driver.name}
                                                        </p>
                                                        {driver.tags && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Tags:{" "}
                                                                {driver.tags}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Tidak ada driver yang ditugaskan
                                    </p>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                                    Guide
                                </h4>
                                {booking.guides && booking.guides.length > 0 ? (
                                    <div className="grid gap-3">
                                        {booking.guides.map((guide, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center gap-4"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={guide.photo}
                                                        alt={guide.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display =
                                                                "none";
                                                            e.target.nextSibling.style.display =
                                                                "flex";
                                                        }}
                                                    />
                                                    <div className="hidden items-center justify-center w-full h-full">
                                                        <Users className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {guide.name}
                                                        {guide.type == "Ijen" &&
                                                            " (IJEN)"}
                                                    </p>
                                                    {guide.tags && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Tags: {guide.tags}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Tidak ada guide yang ditugaskan
                                    </p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                                    Kendaraan
                                </h4>
                                {booking.vehicles &&
                                booking.vehicles.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {booking.vehicles.map(
                                            (vehicle, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                                                >
                                                    {vehicle}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Tidak ada kendaraan yang ditugaskan
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "accommodation" && (
                        <div className="space-y-4 animate-fade-in">
                            {booking.hotels && booking.hotels.length > 0 ? (
                                booking.hotels.map((hotel, index) => (
                                    <div
                                        key={index}
                                        className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:bg-gray-700/30 transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                                    <Hotel className="w-4 h-4" />
                                                    {hotel.hotel}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Check-in: {hotel.checkIn}
                                                </p>
                                            </div>
                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm">
                                                Hari {hotel.day}
                                            </span>
                                        </div>

                                        {hotel.rooms &&
                                            hotel.rooms.length > 0 && (
                                                <div className="mt-3 space-y-1">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Kamar:
                                                    </p>
                                                    {hotel.rooms.map(
                                                        (room, roomIndex) => (
                                                            <p
                                                                key={roomIndex}
                                                                className="text-sm text-gray-600 dark:text-gray-400 ml-4"
                                                            >
                                                                •{" "}
                                                                {room.roomName}{" "}
                                                                ×{" "}
                                                                {room.quantity}
                                                            </p>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tidak ada detail akomodasi
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === "finance" && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div
                                    onClick={() => {
                                        booking.financial.invoice.invoiceLink.map(
                                            (inv) => {
                                                window.open(inv, "_blank");
                                            },
                                        );
                                    }}
                                    className="bg-blue-50 cursor-pointer hover:shadow dark:hover:bg-blue-800/40 dark:bg-blue-900/40 rounded-lg p-4"
                                >
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Total Invoice
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(
                                            booking.financial.invoice.total,
                                        )}
                                    </p>
                                </div>
                                <Link
                                    href={booking.financial.expense.expenseLink}
                                    className="bg-green-50 hover:shadow dark:hover:bg-green-800/40 dark:bg-green-900/40 rounded-lg p-4"
                                >
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Total Expense
                                    </p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(
                                            booking.financial.expense?.total,
                                        )}
                                    </p>
                                </Link>
                                <div className="bg-orange-50 dark:bg-orange-900/40 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Total Expense Crew
                                    </p>
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {formatCurrency(
                                            booking.financial.expense
                                                ?.crew_expense,
                                        )}
                                    </p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/40 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Total Hutang
                                    </p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(
                                            booking.financial.expense
                                                ?.debt_expense,
                                        )}
                                    </p>
                                </div>
                                {/* <div className={`rounded-lg p-4 ${parseFloat(booking.financial.profit) >= 0 ? 'bg-green-50 dark:bg-green-900/40' : 'bg-red-50 dark:bg-red-900/40'}`}>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profit</p>
                        <p className={`text-2xl font-bold ${parseFloat(booking.financial.profit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(booking.financial.profit)}
                        </p>
                    </div> */}
                            </div>
                            {booking.orderChannel == "JVTO" && (
                                <div className="space-y-3 border-t dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Payment Method
                                        </span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                                            {booking.financial.paymentMethod?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Pembayaran Diterima
                                        </span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                                            {formatCurrency(
                                                booking.financial.payment,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Sisa Tagihan
                                        </span>
                                        <span
                                            className={`font-semibold text-lg ${parseFloat(booking.financial.balance) > 0 ? "text-red-600" : "text-green-600"}`}
                                        >
                                            {formatCurrency(
                                                booking.financial.balance,
                                            )}
                                            {booking.financial.balance == 0 &&
                                                " (Lunas)"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {booking.paymentHistory &&
                                booking.paymentHistory.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                                            Riwayat Pembayaran
                                        </h4>
                                        <div className="space-y-2">
                                            {booking.paymentHistory.map(
                                                (payment, idx) => (
                                                    <a
                                                        className="block"
                                                        key={idx}
                                                        href={payment.reference}
                                                        target="_blank"
                                                    >
                                                        <div className="bg-gray-50 hover:shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600/50 dark:bg-gray-700/50 rounded p-3 text-sm">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                                                        {
                                                                            payment.description
                                                                        }
                                                                    </p>
                                                                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                                        {
                                                                            payment.date
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                                        {formatCurrency(
                                                                            payment.nominal,
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {
                                                                            payment.paymentMethod
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}

                    {activeTab === "notes" && (
                        <div className="animate-fade-in">
                            <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                                Catatan
                            </h4>
                            {booking.notes ? (
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                                    {booking.notes}
                                </p>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tidak ada catatan
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App = ({ bookingData, month }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterChannel, setFilterChannel] = useState("all");
    const [filterDriver, setFilterDriver] = useState("all");
    const [filterDateRange, setFilterDateRange] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [collapsedColumns, setCollapsedColumns] = useState({
    'Berlangsung': true,
    'Akan Datang': true, 
    'Selesai': true
    });

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            // Use a Map to ensure unique bookings by ID, giving precedence to the newer data
            const bookingMap = new Map();
            bookingData.forEach((booking) => {
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
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    const conflicts = useMemo(() => checkConflicts(bookings), [bookings]);

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                if (
                    !booking.guest.toLowerCase().includes(searchLower) &&
                    !booking.id.toLowerCase().includes(searchLower)
                ) {
                    return false;
                }
            }

            if (
                filterChannel !== "all" &&
                booking.orderChannel !== filterChannel
            ) {
                return false;
            }

            if (filterDriver !== "all") {
                const hasDriver = booking.drivers?.some(
                    (d) => d.name === filterDriver,
                );
                if (!hasDriver) return false;
            }

            if (filterDateRange !== "all") {
                const startDate = parseDate(booking.date.start_ymd);
                if (!startDate) return false;

                const today = new Date("2025-06-12T00:00:00Z");

                switch (filterDateRange) {
                    case "this-week":
                        const weekStart = new Date(today);
                        weekStart.setUTCDate(
                            today.getUTCDate() -
                                today.getUTCDay() +
                                (today.getUTCDay() === 0 ? -6 : 1),
                        );
                        const weekEnd = new Date(weekStart);
                        weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
                        if (startDate < weekStart || startDate > weekEnd)
                            return false;
                        break;
                    case "this-month":
                        if (
                            startDate.getUTCMonth() !== today.getUTCMonth() ||
                            startDate.getUTCFullYear() !==
                                today.getUTCFullYear()
                        )
                            return false;
                        break;
                    case "next-month":
                        const nextMonthDate = new Date(
                            Date.UTC(
                                today.getUTCFullYear(),
                                today.getUTCMonth() + 1,
                                1,
                            ),
                        );
                        if (
                            startDate.getUTCMonth() !==
                                nextMonthDate.getUTCMonth() ||
                            startDate.getUTCFullYear() !==
                                nextMonthDate.getUTCFullYear()
                        )
                            return false;
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
            completed: [],
        };

        filteredBookings.forEach((booking) => {
            const status = getBookingStatus(booking);
            if (groups[status]) {
                groups[status].push(booking);
            }
        });

        Object.keys(groups).forEach((status) => {
            groups[status].sort((a, b) => {
                const dateA = parseDate(a.date.start_ymd) || 0;
                const dateB = parseDate(b.date.start_ymd) || 0;
                if (status === "completed") {
                    return dateB - dateA;
                }
                return dateA - dateB;
            });
        });

        return groups;
    }, [filteredBookings]);
    // TAMBAH FUNGSI INI
    const toggleColumnCollapse = (columnTitle) => {
        setCollapsedColumns((prev) => ({
            ...prev,
            [columnTitle]: !prev[columnTitle],
        }));
    };
    const allDrivers = useMemo(() => {
        const drivers = new Set();
        bookings.forEach((booking) => {
            booking.drivers?.forEach((d) => {
                if (d.name !== "GARAGE") {
                    drivers.add(d.name);
                }
            });
        });
        return Array.from(drivers).sort();
    }, [bookings]);

    const allChannels = useMemo(() => {
        const channels = new Set();
        bookings.forEach((booking) => {
            if (booking.orderChannel) channels.add(booking.orderChannel);
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
        {
            title: "Berlangsung",
            data: groupedBookings.ongoing,
            color: "text-green-500",
        },
        {
            title: "Akan Datang",
            data: groupedBookings.upcoming,
            color: "text-blue-500",
        },
        {
            title: "Selesai",
            data: groupedBookings.completed,
            color: "text-gray-500",
        },
    ];

    const filterYear = month.split("-")[0];
    const filterMonth = month.split("-")[1];

    return (
        <Main>
            <div
                className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans`}
            >
                <style>{`
            .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-slide-down { animation: slideDown 0.3s ease-out; }
            @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

                <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-20 border-b border-gray-200 dark:border-gray-700">
                    <div className="container mx-auto px-2 sm:px-4 py-3 flex justify-between items-center">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                            Dashboard Operasional Tur
                        </h1>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Muat Ulang Data"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Ganti Mode Gelap/Terang"
                            >
                                {darkMode ? (
                                    <Sun className="w-5 h-5 text-yellow-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-700" />
                                )}
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
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm sm:text-base"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors w-full md:w-auto"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                                />
                            </button>
                        </div>
                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
                                <select
                                    value={filterChannel}
                                    onChange={(e) =>
                                        setFilterChannel(e.target.value)
                                    }
                                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="all">Semua Channel</option>
                                    {allChannels.map((ch) => (
                                        <option key={ch} value={ch}>
                                            {ch}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filterDriver}
                                    onChange={(e) =>
                                        setFilterDriver(e.target.value)
                                    }
                                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="all">Semua Driver</option>
                                    {allDrivers.map((dr) => (
                                        <option key={dr} value={dr}>
                                            {dr}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    onChange={(e) => {
                                        window.location =
                                            "/booking-overview/kanban?month=" +
                                            filterYear +
                                            "-" +
                                            e.target.value;
                                    }}
                                    value={filterMonth}
                                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
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
                            {bookingColumns.map((col) => (
                                <div
                                    key={col.title}
                                    className="bg-gray-100 dark:bg-gray-800/50 p-3 sm:p-4 rounded-xl"
                                >
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() =>
                                            toggleColumnCollapse(col.title)
                                        }
                                    >
                                        <h2
                                            className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${col.color}`}
                                        >
                                            {col.title}
                                            <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-0.5">
                                                {col.data.length}
                                            </span>
                                        </h2>
                                        <ChevronDown
                                            className={`w-5 h-5 transition-transform ${collapsedColumns[col.title] ? "rotate-180" : ""} ${col.color}`}
                                        />
                                    </div>
                                    <div
                                        className={`transition-all duration-300 overflow-hidden ${collapsedColumns[col.title] ? "max-h-0" : "max-h-[10000px]"}`}
                                    >
                                        {col.data.length > 0 ? (
                                            <div className="space-y-4">
                                                {col.data.map((booking) => (
                                                    <TourCard
                                                        key={booking.id}
                                                        booking={booking}
                                                        conflicts={conflicts}
                                                        onClick={() =>
                                                            handleCardClick(
                                                                booking,
                                                            )
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Tidak ada booking{" "}
                                                    {col.title.toLowerCase()}{" "}
                                                    ditemukan.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                {selectedBooking && (
                    <DetailView
                        booking={selectedBooking}
                        onClose={handleCloseDetail}
                    />
                )}
            </div>
        </Main>
    );
};

export default App;
