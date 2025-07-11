import Main from "@/Layouts/Main";
import { router } from "@inertiajs/react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { format, addDays } from "date-fns";
import { Link } from "@inertiajs/react";
import Swal, { Toast } from "@/utils/swal";
import {
    ChevronDown,
    ChevronRight,
    Calendar,
    Plane,
    CreditCard,
    Info,
    Hotel, // Ditambahkan
    Train, // Ditambahkan
    MapPin, // Ditambahkan
    AlertCircle,
    Clock,
    Ticket,
    MoreVertical,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/********************************************************************************************
 * This version showcases how you can blend the original booking dashboard layout
 * with a style reminiscent of the Microsoft Rewards page, including:
 * - A gradient header with summary info.
 * - A "hero" or "banner" section at the top.
 * - Card-like elements for the daily set or tasks.
 *
 * Tailwind CSS classes are used extensively for styling.
 * Adjust colors and layout classes to refine the look.
 ********************************************************************************************/

// A custom date range picker component
function DateRangePicker({ startDate, endDate, onChange }) {
    return (
        <div className="flex space-x-2 items-center">
            <input
                type="date"
                className="border p-1 rounded"
                value={startDate}
                onChange={(e) => onChange(e.target.value, endDate)}
            />
            <span>-</span>
            <input
                type="date"
                className="border p-1 rounded"
                value={endDate}
                onChange={(e) => onChange(startDate, e.target.value)}
            />
        </div>
    );
}
const DateRangeSelector = ({ startDate, endDate, onChange }) => {
    // Helper function to format dates for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
                Date Range
            </label>
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onChange(e.target.value, endDate)}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <span className="text-gray-500">—</span>

                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onChange(startDate, e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="text-xs text-gray-500">
                Selected: {formatDate(startDate)} - {formatDate(endDate)}
            </div>
        </div>
    );
};

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}
const getDateBasedColor = (dateString, allBookings) => {
    // Hitung berapa kali tanggal ini muncul
    const dateCount = allBookings.filter(b => b.date.start_ymd === dateString).length;
    
    // Jika tanggal hanya muncul sekali (tidak duplikat), return putih
    if (dateCount === 1) return 'bg-white';
    
    // Untuk tanggal yang duplikat, ambil semua tanggal yang memiliki duplikat
    const duplicatedDates = [...new Set(allBookings
        .filter(b => allBookings.filter(bb => bb.date.start_ymd === b.date.start_ymd).length > 1)
        .map(b => b.date.start_ymd)
    )].sort();
    
    // Daftar warna background yang akan digunakan secara bergilir untuk tanggal duplikat
    const colors = [
        'bg-red-200',
        'bg-green-200', 
        'bg-blue-200',
        'bg-yellow-200',
        'bg-cyan-200',
        'bg-orange-200',
        'bg-indigo-200',
        'bg-pink-200',
        'bg-teal-200',
        'bg-purple-200',
    ];
    
    // Cari index tanggal ini dalam array tanggal duplikat
    const dateIndex = duplicatedDates.indexOf(dateString);
    
    // Jika tidak ditemukan, return putih
    if (dateIndex === -1) return 'bg-white';
    
    // Return warna berdasarkan index (bergilir jika lebih dari 10 tanggal duplikat)
    return colors[dateIndex % colors.length];
};

// Let's create a Note component with edit capabilities
const EditableNote = ({ note, bookingId, onNoteUpdate, noteCategories }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [noteText, setNoteText] = useState(note.text || "");
    const [selectedCategory, setSelectedCategory] = useState(
        note.categoryId || 1,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const noteRef = useRef(null);

    // Close the popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (noteRef.current && !noteRef.current.contains(event.target)) {
                setIsEditing(false);
            }
        };

        if (isEditing) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditing]);

    const handleSubmit = () => {
        setIsSubmitting(true);

        // Prepare data for submission
        const noteData = {
            booking_id: bookingId,
            note: noteText,
            category_id: selectedCategory,
        };

        // Use Inertia to submit the data
        router.post("/update-booking-note", noteData, {
            onSuccess: () => {
                setIsSubmitting(false);
                setIsEditing(false);

                // Notify parent component about the update
                onNoteUpdate({
                    text: noteText,
                    categoryId: selectedCategory,
                    categoryColor: noteCategories.find(
                        (cat) => cat.id === selectedCategory,
                    )?.color,
                });

                // Show success toast
                Toast.fire({
                    icon: "success",
                    title: "Note updated successfully",
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);

                Swal.fire({
                    title: "Error!",
                    text: errors.error || "Failed to update note",
                    icon: "error",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#d33",
                });
            },
            preserveScroll: true,
        });
    };

    // Find the current category color
    const categoryColor =
        noteCategories.find((cat) => cat.id === selectedCategory)?.color ||
        "#3B82F6";

    return (
        <div
            className="relative w-full h-full"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            ref={noteRef}
        >
            {/* Note display */}
            <div
                className="text-xs text-gray-600 py-1 px-2 rounded-md w-full h-full pr-10"
                style={{
                    borderLeft: `3px solid ${note.categoryColor || categoryColor}`,
                    backgroundColor: isHovering
                        ? "rgba(243, 244, 246, 0.5)"
                        : "transparent",
                }}
            >
                {note.text || "-"}

                {/* Edit button that shows on hover */}
                {isHovering && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Edit popup */}
            {isEditing && (
                <div className="absolute z-50 top-0 right-0 bg-white border border-gray-200 shadow-lg rounded-md p-3 w-64">
                    <h4 className="text-sm font-medium mb-2">Edit Note</h4>

                    {/* Category color selection */}
                    <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">
                            Category
                        </label>
                        <div className="flex space-x-2">
                            {noteCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="relative group"
                                >
                                    <div
                                        className={`w-6 h-6 rounded-full cursor-pointer ${selectedCategory === category.id ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                                        style={{
                                            backgroundColor: category.color,
                                        }}
                                        onClick={() =>
                                            setSelectedCategory(category.id)
                                        }
                                    ></div>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block">
                                        <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                            {category.name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Note text input */}
                    <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">
                            Note
                        </label>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-md p-2 h-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter note..."
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
const BookingRow = ({
    isCompleted = false,
    startNumb,
    booking,
    index,
    handleMoreVerticalClick,
    updateBookingNote,
    noteCategories,
    viewColumns,
    allBookings
}) => {
    const [hoveredCrew, setHoveredCrew] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

    const [noteData, setNoteData] = useState({
        text: booking.notes || "",
        categoryId: booking.noteCategoryId || 1,
        categoryColor: booking.noteCategoryColor || "#3B82F6",
    });
    const dateBasedBgColor = getDateBasedColor(booking.date.start_ymd, allBookings);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                openDropdownId &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpenDropdownId(null);
            }
        };

        if (openDropdownId) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [openDropdownId]);

    const handleNoteUpdate = (updatedNote) => {
        setNoteData(updatedNote);

        // Update the parent component's state if needed
        if (updateBookingNote) {
            updateBookingNote(booking.id, updatedNote);
        }
    };

    return (
        <tr
            className={`border-b ${isCompleted ? "bg-green-50" : ""} ${parseInt(booking.total_pax) >= 18 ? "bg-gradient-to-r from-pink-50 via-transparent to-transparent" : ""}`}
        >
            {/* Row Index */}
            <td className={`py-3 px-2 align-top font-bold relative ${dateBasedBgColor}`}>
                {parseInt(booking.total_pax) >= 18 ? (
                    <div className="relative">
                        <div className="absolute -left-1 -top-1 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-30"></div>
                                <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                                    {startNumb}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    startNumb
                )}
            </td>
            {/* Date Column */}
            <td className="py-3 px-4 align-top whitespace-nowrap">
                <div className="text-blue-600 font-bold">
                    {format(booking.date.start, "dd MMM")} -{" "}
                    {format(booking.date.end, "dd MMM")}
                </div>
                <div className="text-gray-800 font-bold">
                    {booking.date.days}
                </div>
                <div className="text-gray-800 mt-5">
                    <span className="text-gray-600 text-xs mr-1 block">
                        Booking Date:
                    </span>
                    <span className="text-xs font-bold tracking-wide">
                        {format(booking.booking_date, "dd MMM yyyy")}
                    </span>
                </div>
            </td>
            {/* Guest & Package */}
            <td className="py-3 px-4 align-top space-y-1">
                <div>
                    <Link href={`bookings/edit-booking/${booking.booking_id}`}>
                        <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full 
                            ${
                                booking.orderChannel === "JVTO"
                                    ? "bg-blue-100 text-blue-800"
                                    : booking.orderChannel === "TWT"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : booking.orderChannel === "KLOOK"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {booking.id}
                        </span>
                    </Link>
                </div>
                {booking.orderChannel != "TWT" ? (
                    <div className="font-medium underline">
                        <a
                            target="_blank"
                            href={`/client-management/details/${booking.guest_id}`}
                        >
                            {booking.guest}
                        </a>
                    </div>
                ) : (
                    <div className="font-medium">{booking.guest}</div>
                )}
                <div className="text-xs text-gray-500">
                    {booking.duration} / {booking.total_pax} PAX
                </div>
            </td>

            {/* Pickup Details */}
            {viewColumns.includes("pickup") && (
                <td className="py-3 px-4 align-top space-y-2">
                    <div className="flex">
                        {booking.pickup.meeting_point === "Surabaya Airport" ? (
                            booking.pickup.meeting_point_arrival ? (
                                <>
                                    <div>
                                        <Plane className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                    <div>
                                        {booking.pickup.meeting_point_arrival}
                                    </div>
                                </>
                            ) : (
                                <span className="flex items-center text-red-500">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    No pickup location
                                </span>
                            )
                        ) : booking.pickup.meeting_point ===
                          "Surabaya Train Station" ? (
                            booking.pickup.meeting_point ? (
                                <>
                                    <div>
                                        <Train className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                    <div>
                                        {booking.pickup.meeting_point_arrival}
                                    </div>
                                </>
                            ) : (
                                <span className="flex items-center text-red-500">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    No pickup location
                                </span>
                            )
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="flex">
                        {booking.pickup.meeting_point === "Surabaya Airport" ? (
                            <div>
                                <Ticket className="inline-block w-4 h-4 mr-1" />
                            </div>
                        ) : booking.pickup.meeting_point ===
                          "Surabaya Hotel" ? (
                            <div>
                                <Hotel className="inline-block w-4 h-4 mr-1" />
                            </div>
                        ) : booking.pickup.meeting_point ===
                          "Surabaya Train Station" ? (
                            <div>
                                <Ticket className="inline-block w-4 h-4 mr-1" />
                            </div>
                        ) : (
                            booking.pickup.meeting_point_value && (
                                <div>
                                    <MapPin className="inline-block w-4 h-4 mr-1" />
                                </div>
                            )
                        )}
                        {booking.pickup.meeting_point_value || (
                            <span className="flex items-center text-red-500">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                No pickup location
                            </span>
                        )}
                    </div>
                    <div className="text-xs">
                        {booking.pickup.pickup_time ? (
                            <div className="flex">
                                <Clock className="w-4 h-4 mr-1" />
                                <span className="text-gray-500">
                                    {booking.pickup.pickup_time}
                                </span>
                            </div>
                        ) : (
                            <span className="flex items-center text-red-500">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                No pickup time
                            </span>
                        )}
                    </div>
                </td>
            )}
            {viewColumns.includes("dropoff") && (
                <td className="py-3 px-4 align-top space-y-2">
                    <div className="flex">
                        {booking.dropoff.drop_point === "Surabaya Airport" ? (
                            booking.dropoff.drop_point_arrival ? (
                                <>
                                    <div>
                                        <Plane className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                    <div>
                                        {booking.dropoff.drop_point_arrival}
                                    </div>
                                </>
                            ) : (
                                <span className="flex items-center text-red-500">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    No dropoff location
                                </span>
                            )
                        ) : booking.dropoff.drop_point ===
                          "Surabaya Train Station" ? (
                            booking.dropoff.drop_point ? (
                                <>
                                    <div>
                                        <Train className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                    <div>
                                        {booking.dropoff.drop_point_arrival}
                                    </div>
                                </>
                            ) : (
                                <span className="flex items-center text-red-500">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    No dropoff location
                                </span>
                            )
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="flex">
                        {booking.dropoff.drop_point === "Surabaya Airport" ? (
                            <div>
                                <Ticket className="inline-block w-4 h-4 mr-1" />
                            </div>
                        ) : booking.dropoff.drop_point === "Surabaya Hotel" ? (
                            <div>
                                <Hotel className="inline-block w-4 h-4 mr-1" />
                            </div>
                        ) : booking.dropoff.drop_point ===
                          "Surabaya Train Station" ? (
                            <div>
                                <Ticket className="inline-block w-4 h-4 mr-1" />
                            </div>
                        ) : (
                            booking.dropoff.drop_point_value && (
                                <div>
                                    <MapPin className="inline-block w-4 h-4 mr-1" />
                                </div>
                            )
                        )}
                        {booking.dropoff.drop_point_value || (
                            <span className="flex items-center text-red-500">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                No dropoff location
                            </span>
                        )}
                    </div>
                    <div className="text-xs">
                        {booking.dropoff.drop_time ? (
                            <div className="flex">
                                <Clock className="w-4 h-4 mr-1" />
                                <span className="text-gray-500">
                                    {booking.dropoff.drop_time}
                                </span>
                            </div>
                        ) : (
                            <span className="flex items-center text-red-500">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                No dropoff time
                            </span>
                        )}
                    </div>
                </td>
            )}

            {viewColumns.includes("tshirtSize") && (
                <td className="py-3 px-4 align-top">
                    <div className="text-sm text-gray-700">
                        {booking.tshirtSize || "-"}
                    </div>
                </td>
            )}
            {viewColumns.includes("activities") && (
                <td className="py-3 px-4 align-top">
                    <div className="max-h-24 overflow-y-auto">
                        {booking.itinerary && booking.itinerary.length > 0 ? (
                            <ul className="text-xs text-gray-700 space-y-1">
                                {booking.itinerary.map((item, idx) => (
                                    <>
                                        {item.activity && (
                                            <li key={idx}>
                                                <span className="font-semibold">
                                                    {item.day}
                                                </span>
                                                : {item.activity}
                                            </li>
                                        )}
                                    </>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-xs text-gray-500">
                                No activity
                            </span>
                        )}
                    </div>
                </td>
            )}

            {viewColumns.includes("itinerary") && (
                <td className="py-3 px-4 align-top">
                    <div className="max-h-24 overflow-y-auto">
                        {booking.itinerary && booking.itinerary.length > 0 ? (
                            <ul className="text-xs text-gray-700 space-y-1">
                                {booking.itinerary.map((item, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold">
                                            {item.day}
                                        </span>
                                        : {item.itinerary}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-xs text-gray-500">
                                No itinerary
                            </span>
                        )}
                    </div>
                </td>
            )}

            {viewColumns.includes("accommodation") && (
                <td className="py-3 px-4 align-top">
                    <div className="max-h-24 overflow-y-auto">
                        {booking.hotels && booking.hotels.length > 0 ? (
                            <ul className="text-xs text-gray-700 space-y-1">
                                {booking.hotels.map((acc, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold">
                                            {format(
                                                addDays(
                                                    booking.date.start,
                                                    acc.day - 1,
                                                ),
                                                "dd",
                                            )}
                                        </span>
                                        : {acc.hotel}
                                        {Array.isArray(acc.rooms) &&
                                            acc.rooms.map((room, rIdx) => (
                                                <span
                                                    key={rIdx}
                                                    className="text-xs text-gray-500 ml-2"
                                                >
                                                    ({room.roomName} ×{" "}
                                                    {room.quantity})
                                                </span>
                                            ))}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-xs text-gray-500">
                                No accommodation
                            </span>
                        )}
                    </div>
                </td>
            )}

            {viewColumns.includes("vehicleCrew") && (
                <td className="py-3 px-4 align-top space-y-1">
                    <div className="space-y-1">
                        {booking.vehicles && booking.vehicles.length > 0 ? (
                            booking.vehicles.map((vehicle, idx) => (
                                <div key={idx} className="flex">
                                    <div className="flex px-3 py-1 rounded-md text-sm mr-2 bg-green-100 text-green-800">
                                        🚗 {vehicle}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex text-sm items-center text-red-500">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                No vehicle assigned
                            </div>
                        )}
                    </div>
                    {booking.drivers && booking.drivers.length > 0 ? (
                        booking.drivers.map((driver, idx) => (
                            <div
                                className="space-x-1 relative group flex"
                                key={idx}
                                onMouseEnter={() => setHoveredCrew(driver)}
                                onMouseLeave={() => setHoveredCrew(null)}
                            >
                                <span> Driver: </span>
                                <div className="underline text-blue-600 cursor-pointer">
                                    {driver.name}
                                </div>

                                {/* Crew profile popup on hover */}
                                {hoveredCrew &&
                                    hoveredCrew.id === driver.id && (
                                        <div className="absolute z-10 left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                                            <div className="flex items-start gap-3">
                                                <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={
                                                            driver.photo ||
                                                            "https://javavolcano-touroperator.com/assets/img/guide/default.jpg"
                                                        }
                                                        alt={driver.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white text-left">
                                                        {driver.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center">
                                                        Driver
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {driver.tags &&
                                                            driver.tags
                                                                .split(",")
                                                                .map(
                                                                    (
                                                                        tag,
                                                                        i,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 gap-2 text-center">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Escort Trips
                                                    </div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {driver.recap_this_month_escort ||
                                                            0}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/data-master-management/crew/${driver.id}`;
                                                }}
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    )}
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center text-red-500">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            No driver assigned
                        </div>
                    )}

                    <div className="text-sm text-gray-600">
                        {booking.guides && booking.guides.length > 0 ? (
                            booking.guides.map((guide, idx) => (
                                <div
                                    className="space-x-1 relative group flex"
                                    key={idx}
                                    onMouseEnter={() => setHoveredCrew(guide)}
                                    onMouseLeave={() => setHoveredCrew(null)}
                                >
                                    <span>{guide.type}:</span>
                                    <div className="underline cursor-pointer text-blue-600">
                                        {guide.name}
                                    </div>

                                    {/* Crew profile popup on hover */}
                                    {hoveredCrew &&
                                        hoveredCrew.id === guide.id && (
                                            <div className="absolute z-10 left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={
                                                                guide.photo ||
                                                                "https://javavolcano-touroperator.com/assets/img/guide/default.jpg"
                                                            }
                                                            alt={guide.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white text-left">
                                                            {guide.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center">
                                                            {guide.type} Guide
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {guide.tags &&
                                                                guide.tags
                                                                    .split(",")
                                                                    .map(
                                                                        (
                                                                            tag,
                                                                            i,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                                            >
                                                                                {
                                                                                    tag
                                                                                }
                                                                            </span>
                                                                        ),
                                                                    )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div
                                                    className={`mt-3 grid grid-cols-2 gap-2 text-center`}
                                                >
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Escort Trips
                                                        </div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {guide.recap_this_month_escort ||
                                                                0}
                                                        </div>
                                                    </div>
                                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Ijen Trips
                                                        </div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {guide.recap_this_month_ijen ||
                                                                0}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/data-master-management/crew/${guide.id}`;
                                                    }}
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        )}
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center text-red-500">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                No guide assigned
                            </div>
                        )}
                    </div>
                </td>
            )}

            {viewColumns.includes("financial") && (
                <td className="py-3 px-4 align-top space-y-1 relative">
                    <div className="text-sm">
                        {booking.financial.invoice.invoiceLink.length ? (
                            <div
                                onClick={() => {
                                    booking.financial.invoice.invoiceLink.forEach(
                                        (link) => window.open(link, "_blank"),
                                    );
                                }}
                                className="text-blue-500 underline cursor-pointer hover:text-blue-700"
                            >
                                Invoice:{" "}
                                {formatCurrency(
                                    booking.financial.invoice.total,
                                )}
                            </div>
                        ) : (
                            <div className="text-blue-500">
                                Invoice:{" "}
                                {formatCurrency(
                                    booking.financial.invoice.total,
                                )}
                            </div>
                        )}
                    </div>
                    <div className="text-sm">
                        <Link
                            href={booking.financial.expense.expenseLink}
                            className="text-orange-500 underline cursor-pointer hover:text-orange-700"
                        >
                            Expense:{" "}
                            {formatCurrency(booking.financial.expense.total)}
                        </Link>
                    </div>
                    <div className="text-sm">
                        <div className="text-green-500">
                            Crew:{" "}
                            {formatCurrency(
                                booking.financial.expense.crew_expense,
                            )}
                        </div>
                    </div>
                    <div className="text-sm">
                        <div className="text-red-500">
                            Hutang:{" "}
                            {formatCurrency(
                                booking.financial.expense.debt_expense,
                            )}
                        </div>
                    </div>

                    {/* Add Info icon with payment history for JVTO orders */}
                    {booking.orderChannel === "JVTO" && (
                        <div className="absolute top-2 right-2 group">
                            <Info className="h-4 w-4 text-gray-500 hover:text-blue-500 cursor-pointer" />
                            <div className="absolute z-10 right-0 -mt-2 w-72 p-3 bg-white shadow-lg rounded-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="mb-2 font-medium text-sm text-gray-700">
                                    Payment History
                                </div>
                                {booking.paymentHistory &&
                                booking.paymentHistory.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto">
                                        {booking.paymentHistory.map(
                                            (payment, idx) => (
                                                <div
                                                    key={idx}
                                                    className="mb-2 pb-2 border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="flex justify-between items-center mt-1">
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-700">
                                                                {
                                                                    payment.description
                                                                }
                                                            </div>
                                                            <div className="text-xs mt-1 font-semibold text-blue-600">
                                                                {formatCurrency(
                                                                    payment.nominal,
                                                                )}
                                                            </div>
                                                        </div>
                                                        {payment.paymentMethodId ==
                                                        3 ? (
                                                            <img
                                                                src="/assets/images/icon/xendit.png"
                                                                className="w-18"
                                                                alt=""
                                                                srcSet=""
                                                            />
                                                        ) : payment.paymentMethodId ==
                                                          5 ? (
                                                            <img
                                                                src="/assets/images/icon/wise.png"
                                                                className="w-18"
                                                                alt=""
                                                                srcSet=""
                                                            />
                                                        ) : payment.paymentMethodId ==
                                                          1 ? (
                                                            <img
                                                                src="/assets/images/icon/cash.png"
                                                                className="w-18"
                                                                alt=""
                                                                srcSet=""
                                                            />
                                                        ) : payment.paymentMethodId ==
                                                          4 ? (
                                                            <img
                                                                src="/assets/images/icon/edc.png"
                                                                className="w-18"
                                                                alt=""
                                                                srcSet=""
                                                            />
                                                        ) : payment.paymentMethodId ==
                                                          6 ? (
                                                            <img
                                                                src="/assets/images/icon/bank-transfer.png"
                                                                className="w-20"
                                                                alt=""
                                                                srcSet=""
                                                            />
                                                        ) : (
                                                            payment.paymentMethod
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            {payment.date}
                                                        </span>
                                                        {payment.reference && (
                                                            <a
                                                                href={
                                                                    payment.reference
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-500 hover:underline"
                                                            >
                                                                {payment.reference.substring(
                                                                    0,
                                                                    20,
                                                                )}
                                                                ...
                                                            </a>
                                                        )}
                                                    </div>
                                                    <a
                                                        href={
                                                            "https://javavolcano-touroperator.com/backoffice/invoice/view-receipt/" +
                                                            payment.booking_id +
                                                            "/partial/" +
                                                            payment.id
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-500 hover:underline"
                                                    >
                                                        {payment.receipt}
                                                    </a>
                                                </div>
                                            ),
                                        )}
                                        {booking.financial.balance > 0 && (
                                            <div className="mb-2 pb-2 border-b border-gray-100 last:border-0">
                                                <div className="flex justify-between items-center mt-1">
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-700">
                                                            FULL PAYMENT{" "}
                                                            <span className="bg-orange-100 text-orange-700 px-1 rounded-xl text-xs font-medium">
                                                                PENDING
                                                            </span>
                                                        </div>
                                                        <div className="text-xs mt-1 font-semibold text-blue-600">
                                                            {formatCurrency(
                                                                booking
                                                                    .financial
                                                                    .balance,
                                                            )}
                                                        </div>
                                                    </div>
                                                    {booking.financial
                                                        .paymentMethod ==
                                                    "cc" ? (
                                                        <img
                                                            src="/assets/images/icon/xendit.png"
                                                            className="w-18"
                                                            alt=""
                                                            srcSet=""
                                                        />
                                                    ) : booking.financial
                                                          .paymentMethod ==
                                                      "wise" ? (
                                                        <img
                                                            src="/assets/images/icon/wise.png"
                                                            className="w-18"
                                                            alt=""
                                                            srcSet=""
                                                        />
                                                    ) : booking.financial
                                                          .paymentMethod ==
                                                      "cash" ? (
                                                        <img
                                                            src="/assets/images/icon/cash.png"
                                                            className="w-18"
                                                            alt=""
                                                            srcSet=""
                                                        />
                                                    ) : booking.financial
                                                          .paymentMethod ==
                                                      "edc" ? (
                                                        <img
                                                            src="/assets/images/icon/edc.png"
                                                            className="w-18"
                                                            alt=""
                                                            srcSet=""
                                                        />
                                                    ) : booking.financial
                                                          .paymentMethod ==
                                                      "bank-transfer" ? (
                                                        <img
                                                            src="/assets/images/icon/bank-transfer.png"
                                                            className="w-20"
                                                            alt=""
                                                            srcSet=""
                                                        />
                                                    ) : (
                                                        booking.financial
                                                            .paymentMethod
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        ARRIVAL DATE
                                                    </span>
                                                    {booking.financial
                                                        .paymentMethodLink && (
                                                        <a
                                                            href={
                                                                booking
                                                                    .financial
                                                                    .paymentMethodLink
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-500 hover:underline"
                                                        >
                                                            {booking.financial.paymentMethodLink.substring(
                                                                0,
                                                                20,
                                                            )}
                                                            ...
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500 italic py-2">
                                        No payment records found
                                    </div>
                                )}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-gray-700">
                                            Total Paid:
                                        </span>
                                        <span className="text-xs font-semibold text-green-600">
                                            {formatCurrency(
                                                booking.financial.payment,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs font-medium text-gray-700">
                                            Balance:
                                        </span>
                                        <span className="text-xs font-semibold text-red-600">
                                            {booking.financial.balance > 0
                                                ? formatCurrency(
                                                      booking.financial.balance,
                                                  )
                                                : "PAID IN FULL"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </td>
            )}
            {/* <td className="py-3 px-4 align-top space-y-1">
    <div className="text-sm">
        {booking.financial.invoice.invoiceLink.length ? (
            <div
                onClick={() => {
                    booking.financial.invoice.invoiceLink.forEach(
                        (link) => window.open(link, "_blank"),
                    );
                }}
                className="text-blue-500 underline cursor-pointer hover:text-blue-700"
            >
                Invoice:{" "}
                {formatCurrency(booking.financial.invoice.total)}
            </div>
        ) : (
            <div className="text-blue-500">
                Invoice:{" "}
                {formatCurrency(booking.financial.invoice.total)}
            </div>
        )}
    </div>
    {booking.orderChannel == "JVTO" && (
        <>
            <div className="text-xs text-gray-600">
                <span>
                    Deposit:{" "}
                    {formatCurrency(booking.financial.payment)}
                </span>
            </div>
            <div className="text-xs text-gray-600">
                <span>
                    Balance:{" "}
                    {formatCurrency(booking.financial.balance)}
                </span>
            </div>
            <div className="text-xs text-gray-600">
                <span>
                    Payment Method:{" "}
                    {booking.financial.paymentMethod
                        ? booking.financial.paymentMethod.toUpperCase()
                        : "-"}
                </span>
            </div>
        </>
    )}
    <div className="text-xs text-gray-600">
        {booking.financial.expense.expenseLink ? (
            booking.financial.expense.target == "_blank" ? (
                <div
                    onClick={() =>
                        window.open(
                            booking.financial.expense.expenseLink,
                            "_blank",
                        )
                    }
                    className="cursor-pointer underline hover:text-blue-600"
                >
                    Expenses:{" "}
                    {formatCurrency(
                        booking.financial.expense.total,
                    )}
                </div>
            ) : (
                <Link href={booking.financial.expense.expenseLink}>
                    <div className="cursor-pointer underline hover:text-blue-600">
                        Expenses:{" "}
                        {formatCurrency(
                            booking.financial.expense.total,
                        )}
                    </div>
                </Link>
            )
        ) : (
            <span>
                Expenses:{" "}
                {formatCurrency(booking.financial.expense.total)}
            </span>
        )}
    </div>
    <div className="text-xs text-green-600 font-medium">
        Profit: {formatCurrency(booking.financial.profit)}
    </div>
</td> */}

            {viewColumns.includes("notes") && (
                <td className="py-3 px-4 align-top min-h-12 relative">
                    <EditableNote
                        note={noteData}
                        bookingId={booking.booking_id}
                        onNoteUpdate={handleNoteUpdate}
                        noteCategories={noteCategories}
                    />
                </td>
            )}

            {/* Actions */}
            <td className="py-3 px-4 align-top">
                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                                openDropdownId === booking.id
                                    ? null
                                    : booking.id,
                            );
                        }}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>

                    {openDropdownId === booking.id && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() =>
                                    window.open(
                                        `/bookings/details/${booking.booking_id}`,
                                        "_blank",
                                    )
                                }
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                            >
                                Details
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMoreVerticalClick(booking);
                                    setOpenDropdownId(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                            >
                                Plotting
                            </button>
                            <Link
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                href={`bookings/edit-booking/${booking.booking_id}`}
                            >
                                Edit
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    Swal.fire({
                                        title: "Are you sure?",
                                        text: "This action cannot be undone.",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#d33",
                                        cancelButtonColor: "#3085d6",
                                        confirmButtonText: "Yes, delete it!",
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            router.delete(
                                                "/bookings/delete/" +
                                                    booking.booking_id,
                                                {
                                                    onSuccess: (page) => {
                                                        Toast.fire({
                                                            icon: "success",
                                                            title: "Booking Deleted Successfully",
                                                        });
                                                        setTimeout(() => {
                                                            window.location.href =
                                                                ""; // reload current page
                                                        }, 1500); // delay 1.5 detik (1500 ms)
                                                    },
                                                },
                                            );
                                        }
                                    });
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};
const ColumnSelector = ({ selectedColumns, setSelectedColumns }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const columns = [
        { id: "pickup", label: "Pickup" },
        { id: "dropoff", label: "Drop-off" },
        { id: "tshirtSize", label: "T-Shirt Size" },
        { id: "activities", label: "Activities" },
        { id: "itinerary", label: "Itinerary" },
        { id: "accommodation", label: "Accommodation" },
        { id: "vehicleCrew", label: "Vehicle & Crew" },
        { id: "financial", label: "Financial" },
        { id: "notes", label: "Notes" },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleColumn = (columnId) => {
        if (selectedColumns.includes(columnId)) {
            setSelectedColumns(selectedColumns.filter((id) => id !== columnId));
        } else {
            setSelectedColumns([...selectedColumns, columnId]);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-2 w-full border border-gray-300 rounded-md bg-white text-gray-700 flex items-center space-x-2"
            >
                <span>Columns</span>
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 p-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Select columns to display
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {columns.map((column) => (
                            <label
                                key={column.id}
                                className="flex items-center space-x-2 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedColumns.includes(
                                        column.id,
                                    )}
                                    onChange={() => toggleColumn(column.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    {column.label}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                        <button
                            type="button"
                            onClick={() =>
                                setSelectedColumns(columns.map((c) => c.id))
                            }
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            Select all
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedColumns([])}
                            className="text-xs text-red-600 hover:text-red-800"
                        >
                            Clear all
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Index({ data }) {
    // Local state
    const [bookings, setBookings] = useState(data.booking);
    const [showCompletedTrips, setShowCompletedTrips] = useState(false);
    // Filter states
    const [searchTerm, setSearchTerm] = useState(data.filters.search);
    const [selectedChannel, setSelectedChannel] = useState(
        data.filters.channel,
    );
    const [pickupFilter, setPickupFilter] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [startDate, setStartDate] = useState(data.filters.startDate);
    const [endDate, setEndDate] = useState(data.filters.endDate);
    const [selectedPayment, setSelectedPayment] = useState(data.filters.payment);
    const [selectedCrew, setSelectedCrew] = useState(data.filters.crew);
    const [filterType, setFilterType] = useState(data.filters.filterType); // Default to month selection
    const [selectedMonth, setSelectedMonth] = useState(data.filters.month);
    // State to track which booking is expanded
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(
        // Initialize from URL params if available, otherwise show all columns
        data.filters.view
            ? data.filters.view.split(",")
            : [
                  "pickup",
                  "dropoff",
                  "tshirtSize",
                  "activities",
                  "itinerary",
                  "accommodation",
                  "vehicleCrew",
                  "financial",
                  "notes",
              ],
    );
    const [sortColumn, setSortColumn] = useState(data.filters.sort_column); // Get from props or default to date
    const [sortOrder, setSortOrder] = useState(data.filters.sort_order); // Get from props or default to asc
    const [isDateSortDropdownOpen, setIsDateSortDropdownOpen] = useState(false); // New state to control dropdown visibility
    const dateSortDropdownRef = useRef(null); // Reference for the dropdown

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dateSortDropdownRef.current &&
                !dateSortDropdownRef.current.contains(event.target)
            ) {
                setIsDateSortDropdownOpen(false);
            }
        };

        if (isDateSortDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDateSortDropdownOpen]);

    const viewColumns = data.filters.view.split(",");

    // useEffect(() => {
    //   const handleClickOutside = (event) => {
    //     if (isDownloadOpen && !event.target.closest('.download-dropdown')) {
    //       setIsDownloadOpen(false);
    //     }
    //   };

    //   document.addEventListener('mousedown', handleClickOutside);
    //   return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, [isDownloadOpen]);

    // Update date range
    const handleDateChange = (start, end) => {
        setStartDate(start);
        setEndDate(end);
    };

    // Filter logic
    const filteredBookings = bookings.filter((b) => {
        // Date filter
        const bookingStart = b.date.start_ymd;
        const bookingEnd = new Date(b.date.end);
        const filterStart = startDate;
        const filterEnd = endDate;
        const isWithinRange =
            bookingStart >= filterStart && bookingStart <= filterEnd;

        // Search term (ID or Guest)
        const matchesSearch =
            b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.guest.toLowerCase().includes(searchTerm.toLowerCase());

        // Order channel
        const matchesChannel = selectedChannel
            ? b.orderChannel === selectedChannel
            : true;

        // Pickup/Drop-off location
        let hasPickup = true;
        if (pickupFilter) {
            const locations = [
                b.pickup.meeting_point?.toLowerCase(),
                b.dropoff.drop_point?.toLowerCase(),
            ];
            hasPickup = locations.some((loc) =>
                loc?.includes(pickupFilter.toLowerCase()),
            );
        }

        // Payment Status
        let matchesPayment = true;
        if (paymentStatus === "Paid") {
            const totalPayments = b.paymentHistory.reduce(
                (sum, payment) => sum + payment.nominal,
                0,
            );
            matchesPayment = totalPayments >= b.financial.invoice.total;
        } else if (paymentStatus === "Pending") {
            const totalPayments = b.paymentHistory.reduce(
                (sum, payment) => sum + payment.nominal,
                0,
            );
            matchesPayment = totalPayments < b.financial.invoice.total;
        }

        return (
            isWithinRange &&
            matchesSearch &&
            matchesChannel &&
            hasPickup &&
            matchesPayment
        );
    });
    const [selectedBooking, setSelectedBooking] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [modalPlottingData, setModalPlottingData] = useState(null);

    const CustomMultiSelect = ({
        options,
        value = [],
        onChange,
        placeholder = "Select...",
    }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [search, setSearch] = useState("");
        const dropdownRef = useRef(null);
        const [tooltip, setTooltip] = useState({
            show: false,
            text: "",
            x: 0,
            y: 0,
        });

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target)
                ) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const showTooltip = (e, scheduleInfo) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({
                show: true,
                text: scheduleInfo,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
            });
        };

        const hideTooltip = () => {
            setTooltip({ show: false, text: "", x: 0, y: 0 });
        };

        const filteredOptions = options.filter((option) =>
            option.label.toLowerCase().includes(search.toLowerCase()),
        );

        const toggleOption = (option) => {
            if (option.disabled) return;

            const isSelected = value.find(
                (item) => item.value === option.value,
            );
            if (isSelected) {
                onChange(value.filter((item) => item.value !== option.value));
            } else {
                onChange([...value, option]);
            }
        };

        const removeOption = (optionToRemove) => {
            onChange(
                value.filter((option) => option.value !== optionToRemove.value),
            );
        };

        return (
            <>
                {/* Fixed position tooltip */}
                {tooltip.show && (
                    <div
                        style={{
                            position: "fixed",
                            left: `${tooltip.x}px`,
                            top: `${tooltip.y}px`,
                            transform: "translate(-50%, -100%)",
                            zIndex: 1000,
                        }}
                        className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap shadow-lg"
                    >
                        {tooltip.text}
                        <div
                            className="border-solid border-4 border-transparent border-t-gray-900"
                            style={{
                                position: "absolute",
                                bottom: "-8px",
                                left: "50%",
                                transform: "translateX(-50%)",
                            }}
                        />
                    </div>
                )}

                <div className="relative" ref={dropdownRef}>
                    {/* Selected items display */}
                    <div
                        className="min-h-[38px] p-1 border rounded-md bg-white flex flex-wrap gap-1 cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {value.length === 0 && (
                            <span className="p-1 text-gray-500">
                                {placeholder}
                            </span>
                        )}
                        {value.map((item) => (
                            <span
                                key={item.value}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1 text-sm"
                            >
                                {item.label}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeOption(item);
                                    }}
                                    className="hover:text-blue-600"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Dropdown */}
                    {isOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                            {/* Search input */}
                            <div className="p-2 border-b">
                                <input
                                    type="text"
                                    className="w-full px-2 py-1 border rounded-md"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            {/* Options list */}
                            <div className="max-h-48 overflow-y-auto">
                                {filteredOptions.length === 0 ? (
                                    <div className="p-2 text-gray-500 text-center">
                                        No options found
                                    </div>
                                ) : (
                                    filteredOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`p-2 flex items-center gap-2 
                                              ${
                                                  option.disabled
                                                      ? "bg-gray-50 cursor-not-allowed text-gray-400"
                                                      : "cursor-pointer hover:bg-gray-100"
                                              }
                                              ${value.find((item) => item.value === option.value) ? "bg-gray-50" : ""}`}
                                            onClick={() => toggleOption(option)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={value.some(
                                                    (item) =>
                                                        item.value ===
                                                        option.value,
                                                )}
                                                disabled={option.disabled}
                                                onChange={() => {}}
                                                className="h-4 w-4"
                                            />
                                            <span className="flex-1">
                                                {option.label}
                                            </span>
                                            {option.disabled && (
                                                <div
                                                    onMouseEnter={(e) =>
                                                        showTooltip(
                                                            e,
                                                            option.scheduleInfo,
                                                        )
                                                    }
                                                    onMouseLeave={hideTooltip}
                                                >
                                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    };

    const DetailsModal = ({ isOpen, onClose, booking, plottingData }) => {
        // Set default values based on booking data
        const defaultVehicles = useMemo(() => {
            return (
                booking?.vehicles
                    ?.map((vehicleName) => {
                        const vehicle = plottingData?.car?.find(
                            (v) => v.name === vehicleName,
                        );
                        return vehicle
                            ? {
                                  value: vehicle.id,
                                  label: vehicle.name,
                              }
                            : null;
                    })
                    .filter(Boolean) || []
            );
        }, [booking?.vehicles, plottingData?.car]);

        const defaultDrivers = useMemo(() => {
            return (
                booking?.drivers
                    ?.map((driverName) => {
                        const driver = plottingData?.driver?.find(
                            (d) => d.name === driverName,
                        );
                        return driver
                            ? {
                                  value: driver.id,
                                  label: driver.name,
                              }
                            : null;
                    })
                    .filter(Boolean) || []
            );
        }, [booking?.drivers, plottingData?.driver]);

        // Split guides by type
        const defaultGuides = useMemo(() => {
            const escortGuides = [];
            const ijenGuides = [];

            booking?.guides?.forEach((bookingGuide) => {
                const guide = plottingData?.guide?.find(
                    (g) => g.name === bookingGuide.name,
                );
                if (guide) {
                    const guideOption = {
                        value: guide.id,
                        label: guide.name,
                    };

                    if (bookingGuide.type === "Escort") {
                        escortGuides.push(guideOption);
                    } else if (bookingGuide.type === "Ijen") {
                        ijenGuides.push(guideOption);
                    }
                }
            });

            return { escortGuides, ijenGuides };
        }, [booking?.guides, plottingData?.guide]);

        const [vehicles, setVehicles] = useState(defaultVehicles);
        const [drivers, setDrivers] = useState(defaultDrivers);
        const [escortGuides, setEscortGuides] = useState(
            defaultGuides.escortGuides,
        );
        const [ijenGuides, setIjenGuides] = useState(defaultGuides.ijenGuides);
        const [notes, setNotes] = useState(booking?.notes || "");
        // Transform API data into options format with IDs
        const vehicleOptions = useMemo(() => {
            return (
                plottingData?.car?.map((vehicle) => {
                    // Always enable Hiace (id: 5) and Premio (id: 21)
                    const alwaysEnabled = [5, 21, 1, 2, 4].includes(vehicle.id);

                    return {
                        value: vehicle.id,
                        label: vehicle.name,
                        // Only disable if it's not in the alwaysEnabled list and status is 'Tidak Tersedia'
                        disabled:
                            !alwaysEnabled &&
                            vehicle.status === "Tidak Tersedia",
                        scheduleInfo: vehicle.schedule_info,
                    };
                }) || []
            );
        }, [plottingData?.car]);

        const driverOptions = useMemo(() => {
            return (
                plottingData?.driver?.map((driver) => {
                    // Always enable GARAGE (id: 9)
                    const alwaysEnabled = driver.id === 9;

                    return {
                        value: driver.id,
                        label: driver.name,
                        // Only disable if it's not GARAGE and status is 'Tidak Tersedia'
                        disabled:
                            !alwaysEnabled &&
                            driver.status === "Tidak Tersedia",
                        scheduleInfo: driver.schedule_info,
                    };
                }) || []
            );
        }, [plottingData?.driver]);

        const escortGuideOptions = useMemo(() => {
            return (
                plottingData?.guide
                    ?.filter((guide) => guide.id !== 56) // Still exclude Local Ijen from escort
                    .map((guide) => ({
                        value: guide.id,
                        label: guide.name,
                        disabled:
                            guide.status === "Tidak Tersedia" ||
                            !guide.dynamic_roles?.includes("Escort"),
                        scheduleInfo:
                            guide.status === "Tidak Tersedia"
                                ? guide.schedule_info
                                : !guide.dynamic_roles?.includes("Escort")
                                  ? "Hanya tersedia untuk Ijen"
                                  : undefined,
                    })) || []
            );
        }, [plottingData?.guide]);

        const ijenGuideOptions = useMemo(() => {
            return (
                plottingData?.guide?.map((guide) => ({
                    value: guide.id,
                    label: guide.name,
                    disabled:
                        (guide.id !== 56 &&
                            guide.status === "Tidak Tersedia") ||
                        (!guide.dynamic_roles?.includes("Ijen") &&
                            guide.id !== 56),
                    scheduleInfo:
                        guide.status === "Tidak Tersedia" && guide.id !== 56
                            ? guide.schedule_info
                            : !guide.dynamic_roles?.includes("Ijen") &&
                                guide.id !== 56
                              ? "Hanya tersedia untuk Escort"
                              : undefined,
                })) || []
            );
        }, [plottingData?.guide]);

        const handleSubmit = (e) => {
            e.preventDefault();
            setIsLoading(true);
            setApiError(null);

            const paramData = {
                booking_id: booking.booking_id,
                vehicles: vehicles.map((v) => v.value),
                drivers: drivers.map((d) => d.value),
                escortGuides: escortGuides.map((g) => g.value),
                ijenGuides: ijenGuides.map((g) => g.value),
                notes: notes,
            };

            // Use Inertia to make the POST request
            router.post("/plotting", paramData, {
                onSuccess: (page) => {
                    setIsLoading(false);
                    setIsModalOpen(false);

                    if (page.props.flash.message) {
                        // Update the booking data in the parent component
                        const updatedBookings = bookings.map((b) => {
                            if (b.booking_id === booking.booking_id) {
                                return {
                                    ...b,
                                    vehicles: vehicles.map((v) => v.label),
                                    drivers: drivers.map((d) => d.label),
                                    guides: [
                                        ...escortGuides.map((g) => ({
                                            type: "Escort",
                                            name: g.label,
                                        })),
                                        ...ijenGuides.map((g) => ({
                                            type: "Ijen",
                                            name: g.label,
                                        })),
                                    ],
                                    notes: notes,
                                };
                            }
                            return b;
                        });

                        // Update state
                        setBookings(updatedBookings);

                        Toast.fire({
                            icon: "success",
                            title: "Crew and vehicle assigned successfully",
                        });
                    }
                },
                onError: (errors) => {
                    setIsLoading(false);
                    setApiError(errors);

                    Swal.fire({
                        title: "Error!",
                        text:
                            errors.error || "Failed to assign crew and vehicle",
                        icon: "error",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#d33",
                    });
                },
                preserveScroll: true,
            });
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            Assign Crew & Vehicle
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Vehicle Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Vehicles:
                            </label>
                            <CustomMultiSelect
                                options={vehicleOptions}
                                value={vehicles}
                                onChange={setVehicles}
                                placeholder="Select vehicles..."
                            />
                        </div>

                        {/* Driver Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Drivers:
                            </label>
                            <CustomMultiSelect
                                options={driverOptions}
                                value={drivers}
                                onChange={setDrivers}
                                placeholder="Select drivers..."
                            />
                        </div>

                        {/* Escort Guide Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Escort Guides (Optional):
                            </label>
                            <CustomMultiSelect
                                options={escortGuideOptions}
                                value={escortGuides}
                                onChange={setEscortGuides}
                                placeholder="Select escort guides..."
                            />
                        </div>

                        {/* Ijen Guide Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Ijen Guides (Optional):
                            </label>
                            <CustomMultiSelect
                                options={ijenGuideOptions}
                                value={ijenGuides}
                                onChange={setIjenGuides}
                                placeholder="Select ijen guides..."
                            />
                        </div>

                        {/* Special Notes */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Notes:
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-2 h-24"
                                placeholder="Enter any special notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    const handleMoreVerticalClick = async (booking) => {
        try {
            setIsLoading(true);
            setApiError(null);

            // Format the URL with query parameters
            const url = `https://javavolcano-touroperator.com/backoffice/plotting/get-plotting?id=${booking.booking_id}&order_channel=${booking.orderChannel.toLowerCase()}`;

            // Make the GET request
            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    Origin: `https://new-backoffice.javavolcano-touroperator.com`,
                },
                mode: "cors",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch booking details");
            }

            const plottingData = await response.json();

            // After successful API call, open the modal with the plotting data
            openDetailsModal(booking, plottingData);
        } catch (error) {
            console.error("Error fetching booking details:", error);
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Update the openDetailsModal function
    const openDetailsModal = (booking, plottingData) => {
        setSelectedBooking(booking);
        setModalPlottingData(plottingData);
        setIsModalOpen(true);
    };
    const BookingDropdown = () => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        const options = [
            { label: "JVTO", href: "/bookings/add-booking/jvto" },
            { label: "KLOOK", href: "/bookings/add-booking/klook" },
            { label: "TWT", href: "/bookings/add-booking/twt" },
        ];

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(event.target)
                ) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }, []);
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 py-2 bg-black text-white rounded hover:opacity-90 flex items-center gap-3"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Add Booking
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#24303f] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        {options.map((option) => (
                            <Link
                                key={option.label}
                                href={option.href}
                                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                                {option.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const updateBookingNote = (bookingId, updatedNote) => {
        // Update the bookings state with the new note
        const updatedBookings = bookings.map((booking) => {
            if (booking.id === bookingId) {
                return {
                    ...booking,
                    notes: updatedNote.text,
                    noteCategoryId: updatedNote.categoryId,
                    noteCategoryColor: updatedNote.categoryColor,
                };
            }
            return booking;
        });

        setBookings(updatedBookings);
    };

    return (
        <Main>
            <div className="w-full mx-auto">
                {/* Gradient header area (like the MS Rewards style) */}
                <div className="bg-gradient-to-r from-blue-200 via-blue-50 to-blue-200 p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Booking</h1>
                        <div className="text-sm text-gray-700">
                            Booking Overview
                        </div>
                    </div>
                    <div className="text-right">
                        {/* <div className="text-sm text-gray-600">
                        Total Value: {formatCurrency(bookings.reduce((sum, b) => sum + b.financial.invoice.total, 0))}
                    </div>
                    <div className="text-xs text-gray-600">
                        Total Profit: {formatCurrency(bookings.reduce((sum, b) => sum + b.financial.profit, 0))}
                    </div> */}
                    </div>
                </div>

                {/* Hero or Banner Section */}
                <div className="bg-white p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <BookingDropdown />
                        <div className="mt-4 md:mt-0">
                            <img
                                src="https://javavolcano-touroperator.com/assets/img/download.png"
                                alt="Venice"
                                width="100"
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-6 shadow rounded-lg mb-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.get("/booking-overview", {
                                filter_type: filterType,
                                month: selectedMonth,
                                date_range: startDate + "_" + endDate,
                                search: searchTerm,
                                channel: selectedPayment ? 'JVTO' : selectedChannel,
                                payment: selectedPayment,
                                crew: selectedCrew,
                                view: selectedColumns.join(","), // Add this line to include selected columns
                            });
                        }}
                    >
                        <div className="grid grid-cols-12 gap-5 items-end">
                            {/* Filter By Column */}
                            <div className="col-span-12 md:col-span-4">
                                <div className="mb-2 flex font-bold justify-between text-gray-800">
                                    <span>Filter By</span>
                                    <div className="flex gap-3">
                                        <label className="inline-flex items-center cursor-pointer font-medium text-sm">
                                            <input
                                                type="radio"
                                                className="form-radio w-4 h-4 text-blue-600"
                                                name="filterType"
                                                value="month"
                                                checked={filterType === "month"}
                                                onChange={() =>
                                                    setFilterType("month")
                                                }
                                            />
                                            <span className="ml-2 text-gray-700">
                                                Month
                                            </span>
                                        </label>

                                        <label className="inline-flex items-center cursor-pointer font-medium text-sm">
                                            <input
                                                type="radio"
                                                className="form-radio w-4 h-4 text-blue-600"
                                                name="filterType"
                                                value="date_range"
                                                checked={
                                                    filterType === "date_range"
                                                }
                                                onChange={() =>
                                                    setFilterType("date_range")
                                                }
                                            />
                                            <span className="ml-2 text-gray-700">
                                                Date Range
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {filterType === "month" ? (
                                    <div className="relative">
                                        <input
                                            type="month"
                                            value={selectedMonth}
                                            onChange={(e) =>
                                                setSelectedMonth(e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-full">
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) =>
                                                        handleDateChange(
                                                            e.target.value,
                                                            endDate,
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>

                                            <span className="text-gray-500">
                                                —
                                            </span>

                                            <div className="relative w-full">
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) =>
                                                        handleDateChange(
                                                            startDate,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Channel Column */}
                            <div className="col-span-12 md:col-span-2">
                                <div className="mb-2 font-bold text-gray-800">
                                    Order Channel
                                </div>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                        value={selectedChannel}
                                        onChange={(e) =>
                                            setSelectedChannel(e.target.value)
                                        }
                                    >
                                        <option value="">All</option>
                                        <option value="TWT">TWT</option>
                                        <option value="KLOOK">KLOOK</option>
                                        <option value="JVTO">JVTO</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search Column */}
                            <div className="col-span-12 md:col-span-2">
                                <div className="mb-2 font-bold text-gray-800">
                                    Search
                                </div>
                                <input
                                    type="text"
                                    placeholder="Guest name"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-2">
                                <div className="mb-2 font-bold text-gray-800">
                                    View Columns
                                </div>
                                <ColumnSelector
                                    selectedColumns={selectedColumns}
                                    setSelectedColumns={setSelectedColumns}
                                />
                            </div>
                            <div className="col-span-12 md:col-span-2">
                                <div className="mb-2 font-bold text-gray-800">
                                    Payment Status
                                </div>
                                    <select
                                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                        value={selectedPayment}
                                        onChange={(e) =>
                                            setSelectedPayment(e.target.value)
                                        }
                                    >
                                        <option value="">All Payments</option>
                                        <option value="fully">Fully Paid</option>
                                        <option value="partially">Partially Paid</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                            </div>
                            <div className="col-span-12 md:col-span-2">
                                <div className="mb-2 font-bold text-gray-800">
                                    CREW
                                </div>
                                    <select
                                        className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                        value={selectedCrew}
                                        onChange={(e) =>
                                            setSelectedCrew(e.target.value)
                                        }
                                    >
                                        <option value="">All Crew</option>
                                        {data.crew.map((crew) => (
                                            <option key={crew.id} value={crew.id}>{crew.name}</option>
                                        ))}

                                    </select>
                            </div>
                            <div className="col-span-12 flex gap-2 md:col-span-6">
                                    <div>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                            Apply Filters
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsDownloadOpen(
                                                    !isDownloadOpen,
                                                )
                                            }
                                            className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                            Download
                                            <ChevronDown className="h-4 w-4 ml-2" />
                                        </button>

                                        {isDownloadOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                                                <a
                                                    href={`/booking-overview?filter_type=${filterType}&${filterType === "month" ? "month=" + selectedMonth : "date_range=" + startDate + "_" + endDate}&search=${searchTerm}&sort_column=${sortColumn}&sort_order=${sortOrder}&channel=${selectedChannel}&pdf=true`}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                    onClick={() =>
                                                        setIsDownloadOpen(false)
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 mr-2 text-red-600"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    PDF
                                                </a>
                                                <a
                                                    href={`/booking-overview?filter_type=${filterType}&${filterType === "month" ? "month=" + selectedMonth : "date_range=" + startDate + "_" + endDate}&search=${searchTerm}&sort_column=${sortColumn}&sort_order=${sortOrder}&channel=${selectedChannel}&export=true`}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                    onClick={() =>
                                                        setIsDownloadOpen(false)
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 mr-2 text-green-600"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Excel
                                                </a>
                                                <a
                                                    href={`/booking-overview?filter_type=${filterType}&${filterType === "month" ? "month=" + selectedMonth : "date_range=" + startDate + "_" + endDate}&search=${searchTerm}&sort_column=${sortColumn}&sort_order=${sortOrder}&channel=${selectedChannel}&json=true&download=true`}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                    onClick={() =>
                                                        setIsDownloadOpen(false)
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 mr-2 text-blue-600"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h6a1 1 0 100-2H4V5h12v5a1 1 0 102 0V5a2 2 0 00-2-2H4zm8.293 9.707a1 1 0 011.414 0L16 15l-2.293 2.293a1 1 0 01-1.414-1.414L13.586 15l-1.293-1.293a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    JSON
                                                </a>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        </div>
                    </form>
                </div>
                {/* Bookings Table */}
                <div className="bg-white shadow rounded-md p-4 mb-8 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="py-3 px-4">#</th>
                                <th className="py-3 px-4 min-w-35 relative whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div
                                            className="relative"
                                            ref={dateSortDropdownRef}
                                        >
                                            <button
                                                className="ml-1 text-gray-600 text-left font-bold hover:text-gray-700"
                                                onClick={() =>
                                                    setIsDateSortDropdownOpen(
                                                        !isDateSortDropdownOpen,
                                                    )
                                                }
                                            >
                                                <span className="mr-3">
                                                    DATE
                                                </span>
                                                {sortColumn === "date" ||
                                                sortColumn ===
                                                    "booking_date" ? (
                                                    <span>
                                                        {sortOrder === "asc"
                                                            ? "↑"
                                                            : "↓"}
                                                    </span>
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>

                                            {isDateSortDropdownOpen && (
                                                <div className="absolute left-0 mt-1 min-w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                                                    <div className="py-1">
                                                        <button
                                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                                                sortColumn ===
                                                                    "date" &&
                                                                sortOrder ===
                                                                    "asc"
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : "text-gray-700"
                                                            }`}
                                                            onClick={() => {
                                                                setIsDateSortDropdownOpen(
                                                                    false,
                                                                );
                                                                router.get(
                                                                    "/booking-overview",
                                                                    {
                                                                        filter_type:
                                                                            filterType,
                                                                        month: selectedMonth,
                                                                        date_range:
                                                                            startDate +
                                                                            "_" +
                                                                            endDate,
                                                                        search: searchTerm,
                                                                        channel:
                                                                            selectedChannel,
                                                                        view: selectedColumns.join(
                                                                            ",",
                                                                        ),
                                                                        sort_column:
                                                                            "date",
                                                                        sort_order:
                                                                            "asc",
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Travel Date
                                                            (Earliest first)
                                                        </button>
                                                        <button
                                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                                                sortColumn ===
                                                                    "date" &&
                                                                sortOrder ===
                                                                    "desc"
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : "text-gray-700"
                                                            }`}
                                                            onClick={() => {
                                                                setIsDateSortDropdownOpen(
                                                                    false,
                                                                );
                                                                router.get(
                                                                    "/booking-overview",
                                                                    {
                                                                        filter_type:
                                                                            filterType,
                                                                        month: selectedMonth,
                                                                        date_range:
                                                                            startDate +
                                                                            "_" +
                                                                            endDate,
                                                                        search: searchTerm,
                                                                        channel:
                                                                            selectedChannel,
                                                                        view: selectedColumns.join(
                                                                            ",",
                                                                        ),
                                                                        sort_column:
                                                                            "date",
                                                                        sort_order:
                                                                            "desc",
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Travel Date (Latest
                                                            first)
                                                        </button>
                                                        <button
                                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                                                sortColumn ===
                                                                    "booking_date" &&
                                                                sortOrder ===
                                                                    "asc"
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : "text-gray-700"
                                                            }`}
                                                            onClick={() => {
                                                                setIsDateSortDropdownOpen(
                                                                    false,
                                                                );
                                                                router.get(
                                                                    "/booking-overview",
                                                                    {
                                                                        filter_type:
                                                                            filterType,
                                                                        month: selectedMonth,
                                                                        date_range:
                                                                            startDate +
                                                                            "_" +
                                                                            endDate,
                                                                        search: searchTerm,
                                                                        channel:
                                                                            selectedChannel,
                                                                        view: selectedColumns.join(
                                                                            ",",
                                                                        ),
                                                                        sort_column:
                                                                            "booking_date",
                                                                        sort_order:
                                                                            "asc",
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Booking Date
                                                            (Earliest first)
                                                        </button>
                                                        <button
                                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                                                sortColumn ===
                                                                    "booking_date" &&
                                                                sortOrder ===
                                                                    "desc"
                                                                    ? "bg-blue-50 text-blue-700"
                                                                    : "text-gray-700"
                                                            }`}
                                                            onClick={() => {
                                                                setIsDateSortDropdownOpen(
                                                                    false,
                                                                );
                                                                router.get(
                                                                    "/booking-overview",
                                                                    {
                                                                        filter_type:
                                                                            filterType,
                                                                        month: selectedMonth,
                                                                        date_range:
                                                                            startDate +
                                                                            "_" +
                                                                            endDate,
                                                                        search: searchTerm,
                                                                        channel:
                                                                            selectedChannel,
                                                                        view: selectedColumns.join(
                                                                            ",",
                                                                        ),
                                                                        sort_column:
                                                                            "booking_date",
                                                                        sort_order:
                                                                            "desc",
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Booking Date (Latest
                                                            first)
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </th>
                                <th className="py-3 px-4 min-w-35">
                                    Guest & Pax
                                </th>
                                {viewColumns.includes("pickup") && (
                                    <th className="py-3 px-4 min-w-45">
                                        Pickup
                                    </th>
                                )}
                                {viewColumns.includes("dropoff") && (
                                    <th className="py-3 px-4 min-w-45">
                                        Drop-off
                                    </th>
                                )}
                                {viewColumns.includes("tshirtSize") && (
                                    <th className="py-3 px-4 min-w-30">
                                        T-Shirt Size
                                    </th>
                                )}
                                {viewColumns.includes("activities") && (
                                    <th className="py-3 px-4 min-w-60">
                                        Activities
                                    </th>
                                )}
                                {viewColumns.includes("itinerary") && (
                                    <th className="py-3 px-4 min-w-60">
                                        Itinerary
                                    </th>
                                )}
                                {viewColumns.includes("accommodation") && (
                                    <th className="py-3 px-4 min-w-60">
                                        Accommodation
                                    </th>
                                )}
                                {viewColumns.includes("vehicleCrew") && (
                                    <th className="py-3 px-4 min-w-50">
                                        Vehicle & Crew
                                    </th>
                                )}
                                {viewColumns.includes("financial") && (
                                    <th className="py-3 px-4 min-w-50">
                                        Financial
                                    </th>
                                )}
                                {viewColumns.includes("notes") && (
                                    <th className="py-3 px-4 min-w-40 md:min-w-1">
                                        Notes
                                    </th>
                                )}
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Completed Trips Collapsible Section */}
                            <tr className="border-b bg-green-50">
                                <td
                                    colSpan={selectedColumns.length + 4}
                                    className="py-2 px-4"
                                >
                                    <button
                                        onClick={() =>
                                            setShowCompletedTrips(
                                                !showCompletedTrips,
                                            )
                                        }
                                        className="w-full flex items-center justify-between text-left font-medium text-green-700"
                                    >
                                        <div className="flex items-center">
                                            <div>
                                                <span className="text-xs mr-3 bg-green-200 px-2 py-1 rounded-full">
                                                    {
                                                        bookings.filter(
                                                            (b) =>
                                                                new Date(
                                                                    b.date.end_ymd,
                                                                ) <
                                                                new Date(
                                                                    data.now,
                                                                ),
                                                        ).length
                                                    }
                                                </span>
                                                Completed Trips
                                            </div>
                                            {showCompletedTrips ? (
                                                <ChevronDown className="h-5 w-5 mr-2" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 mr-2" />
                                            )}
                                        </div>
                                    </button>
                                </td>
                            </tr>

                            {/* Add this state to the component */}
                            {/* const [showCompletedTrips, setShowCompletedTrips] = useState(false); */}

                            {showCompletedTrips &&
                                bookings
                                    .filter(
                                        (booking) =>
                                            new Date(booking.date.end_ymd) <
                                            new Date(data.now),
                                    )
                                    .map((booking, index) => (
                                        <BookingRow
                                            isCompleted={true}
                                            startNumb={1 + index}
                                            key={booking.id}
                                            booking={booking}
                                            index={index}
                                            handleMoreVerticalClick={
                                                handleMoreVerticalClick
                                            }
                                            updateBookingNote={
                                                updateBookingNote
                                            }
                                            noteCategories={
                                                data.note_categories
                                            }
                                            viewColumns={viewColumns}
                                            allBookings={bookings}
                                        />
                                    ))}

                            {/* Active/Upcoming Trips Label */}
                            <tr className="border-b bg-blue-50">
                                <td
                                    colSpan={selectedColumns.length + 4}
                                    className="py-2 px-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center font-medium text-blue-700">
                                            <div>
                                                <span className="text-xs mr-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                    {
                                                        bookings.filter(
                                                            (b) =>
                                                                new Date(
                                                                    b.date.end_ymd,
                                                                ) >=
                                                                new Date(
                                                                    data.now,
                                                                ),
                                                        ).length
                                                    }
                                                </span>
                                                Active & Upcoming Trips
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            {/* Then replace the original bookings.map with this */}
                            {bookings
                                .filter(
                                    (booking) =>
                                        new Date(booking.date.end_ymd) >=
                                        new Date(data.now),
                                )
                                .map((booking, index) => (
                                    <BookingRow
                                        startNumb={
                                            bookings.filter(
                                                (b) =>
                                                    new Date(b.date.end_ymd) <
                                                    new Date(data.now),
                                            ).length +
                                            1 +
                                            index
                                        }
                                        key={booking.id}
                                        booking={booking}
                                        index={index}
                                        handleMoreVerticalClick={
                                            handleMoreVerticalClick
                                        }
                                        updateBookingNote={updateBookingNote}
                                        noteCategories={data.note_categories}
                                        viewColumns={viewColumns}
                                        allBookings={bookings}
                                    />
                                ))}
                        </tbody>
                    </table>
                </div>
                {selectedBooking && (
                    <DetailsModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        booking={selectedBooking}
                        plottingData={modalPlottingData}
                        setBookings={setBookings} // Add this prop
                        bookings={bookings}
                    />
                )}
            </div>
        </Main>
    );
}
