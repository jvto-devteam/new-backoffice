import React, { useState } from "react";
import { router } from "@inertiajs/react";
import Authenticated from "@/Layouts/Main";
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

const FinanceDashboard = ({ booking = [], summary = {}, filters = {} }) => {
    const [localFilters, setLocalFilters] = useState({
        search: "",
    });

    // Extract current filters from props
    const currentTab = filters.tab || "all";
    const currentChannel = filters.channel || "all";
    const currentMonth = filters.year_month || "";
    const currentDateType = filters.date_type || "trip";

    const tabs = [
        { label: "All Bookings", key: "all" },
        { label: "Paid", key: "paid" },
        { label: "Pending Payment", key: "pending" },
        { label: "Outstanding Debt", key: "debt" },
        { label: "Expense", key: "expense" },
    ];

    const channels = [
        { label: "All Channels", key: "all" },
        { label: "JVTO", key: "jvto" },
        { label: "TWT", key: "twt" },
        { label: "KLOOK", key: "klook" },
    ];

    const dateTypes = [
        { label: "Trip Date", key: "trip" },
        { label: "Payment Date", key: "payment" },
    ];

    const formatRupiah = (val) => {
        if (!val || val === 0) return "Rp 0";
        return "Rp " + parseInt(val).toLocaleString("id-ID");
    };
    function formatFullDate(dateStr) {
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            const options = { day: "2-digit", month: "short", year: "numeric" };
            return date.toLocaleDateString("en-GB", options); // e.g., "24 Dec 2024"
        } catch {
            return dateStr;
        }
    }

    const formatDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) return ["-", "-"];
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const dateOptions = { day: "2-digit", month: "short" };
            const dayOptions = { weekday: "short" };

            const startDateStr = start.toLocaleDateString("en-GB", dateOptions); // e.g., "24 May"
            const endDateStr = end.toLocaleDateString("en-GB", dateOptions); // e.g., "27 May"

            const startDayStr = start.toLocaleDateString("en-GB", dayOptions); // e.g., "Sat"
            const endDayStr = end.toLocaleDateString("en-GB", dayOptions); // e.g., "Tue"

            return [
                `${startDateStr} – ${endDateStr}`,
                `${startDayStr} – ${endDayStr}`,
            ];
        } catch {
            return [`${startDate} – ${endDate}`, "-"];
        }
    };

    const getBookingStatus = (startDate, endDate) => {
        if (!startDate || !endDate) return "Unknown";

        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Reset time to compare dates only
        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (end < today) return "Complete";
        if (start <= today && end >= today) return "Active";
        if (start > today) return "Upcoming";

        return "Unknown";
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            Complete: {
                class: "bg-green-100 text-green-700",
                text: "Complete",
            },
            Active: { class: "bg-blue-100 text-blue-700", text: "Active" },
            Upcoming: {
                class: "bg-orange-100 text-orange-700",
                text: "Upcoming",
            },
            Unknown: { class: "bg-gray-100 text-gray-700", text: "Unknown" },
        };

        const config = statusConfig[status] || {
            class: "bg-gray-100 text-gray-700",
            text: status,
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${config.class}`}
            >
                {config.text}
            </span>
        );
    };

    const getPaymentMethodImage = (
        method,
        reference = null,
        isClickable = false,
    ) => {
        if (!method || method === "-") return null;

        const methodLower = method.toLowerCase();
        let imagePath = "";

        if (methodLower.includes("transfer") || methodLower.includes("bank")) {
            imagePath = "/assets/images/icon/bank-transfer.png";
        } else if (
            methodLower.includes("cc") ||
            methodLower.includes("credit")
        ) {
            imagePath = "/assets/images/icon/xendit.png";
        } else if (methodLower.includes("cash")) {
            imagePath = "/assets/images/icon/cash.png";
        } else if (methodLower.includes("edc")) {
            imagePath = "/assets/images/icon/edc.png";
        } else if (methodLower.includes("wise")) {
            imagePath = "/assets/images/icon/wise.png";
        }

        const content = (
            <div
                className={`flex items-center gap-2 ${isClickable && reference ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
            >
                {imagePath && (
                    <img
                        src={imagePath}
                        alt={method}
                        className="h-7 object-contain"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                )}
            </div>
        );

        // If clickable and has reference, wrap in link
        if (isClickable && reference && reference !== "-") {
            // Check if reference is a full URL or needs to be constructed
            const url = reference.startsWith("http")
                ? reference
                : `https://${reference}`;

            return (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                >
                    {content}
                </a>
            );
        }

        return content;
    };

    const getFilteredData = () => {
        if (!Array.isArray(booking)) return [];

        return booking.filter((row) => {
            // Filter by search
            if (localFilters.search) {
                const searchTerm = localFilters.search.toLowerCase();
                let searchString = "";

                if (row.user) {
                    searchString +=
                        (row.user.name || row.user.user || "") + " ";
                }
                if (row.booking) {
                    searchString += (row.booking.booking_code || "") + " ";
                }
                if (row.package) {
                    searchString += (row.package.package_name || "") + " ";
                }

                if (!searchString.toLowerCase().includes(searchTerm))
                    return false;
            }

            return true;
        });
    };

    const filteredData = getFilteredData();

    const handleSearchChange = (value) => {
        setLocalFilters((prev) => ({
            ...prev,
            search: value,
        }));
    };

    const handleFilterChange = (key, value) => {
        const params = {
            tab: currentTab,
            channel: currentChannel,
            year_month: currentMonth,
            date_type: currentDateType,
            [key]: value,
        };

        Object.keys(params).forEach((k) => {
            if (!params[k] || params[k] === "all") {
                delete params[k];
            }
        });

        router.get("finance", params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({ search: "" });
        router.get(
            "finance",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const getChannelBadge = (channel, id = null) => {
        const channelConfig = {
            JVTO: { class: "bg-blue-100 text-blue-700" },
            TWT: { class: "bg-yellow-100 text-yellow-700" },
            KLOOK: { class: "bg-green-100 text-green-700" },
        };

        const config = channelConfig[channel] || {
            class: "bg-gray-100 text-gray-700",
        };

        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${config.class}`}
            >
                {channel}
                {id ? "-" + id : ""}
            </span>
        );
    };

    const getTableHeaders = () => {
        switch (currentTab) {
            case "all":
                return [
                    "No",
                    "Date",
                    "Guest & Pax",
                    "Package",
                    "Pickup",
                    "Drop",
                    "Grand Total",
                    "Status",
                ];
            case "paid":
                const basePaidHeaders = [
                    "No",
                    "Date",
                    "Guest & Pax",
                    "Package",
                    "Nominal",
                ];
                const klookExtras = [
                    "Description",
                    "Payment Method",
                    "Receipt",
                ];
                return filters.channel !== "klook"
                    ? [...basePaidHeaders, ...klookExtras, "Paid at"]
                    : [...basePaidHeaders, "Paid at"];
            case "pending":
                const basePendingHeaders = [
                    "No",
                    "Date",
                    "Guest & Pax",
                    "Package",
                    "Nominal",
                ];
                if (filters.channel === "all" || filters.channel === "jvto") {
                    basePendingHeaders.push("Payment Method");
                }
                return basePendingHeaders;
            case "debt":
                return ["No", "Date", "Guest & Pax", "Package", "Total Debt"];
            case "expense":
                return [
                    "No",
                    "Date",
                    "Guest & Pax",
                    "Package",
                    "Grand Total",
                    "Total Expense",
                    "Crew Expense",
                ];
            default:
                return ["No", "Channel", "Guest & Pax"];
        }
    };

    const renderTableRow = (row, index) => {
        const channel = row.channel || "JVTO";
        const userName = row.user?.name || row.user?.user || "-";
        const userPax = row.user?.pax || 0;
        const packageDuration = row.package?.duration || "-";
        const packageLink = row.package?.package_url || "#";
        const packageName = row.package?.package_name || "-";
        const bookingCode = row.booking?.booking_code || "-";
        const travelStart = row.booking?.travel_date_start || "-";
        const travelEnd = row.booking?.travel_date_end || "-";
        const grandTotal = row.booking?.grand_total || 0;
        const pricePerPax = row.package?.price_per_pax || 0;
        const bookingDate = row.booking?.booking_date || "-";

        const bookingInfo = (
            <div>
                {getChannelBadge(channel, row.booking.booking_id)}
                <div className="text-gray-900 mt-1 text-sm">{userName}</div>
                <div className="text-gray-500 text-xs mt-1">
                    {packageDuration} / {userPax} PAX
                </div>
            </div>
        );

        const packageInfo = (
            <div>
                <div className="font-medium text-sm max-w-xs">
                    {row.channel === "JVTO" ? (
                        <a
                            href={packageLink}
                            className="hover:text-blue-700 text-blue-600 line-clamp-2 underline"
                            title={packageName}
                        >
                            {packageName}
                        </a>
                    ) : (
                        <div
                            className="text-black line-clamp-2"
                            title={packageName}
                        >
                            {packageName}
                        </div>
                    )}
                </div>
                <div className="text-sm mt-1 text-black whitespace-nowrap">
                    {formatRupiah(pricePerPax)} @pax
                </div>
            </div>
        );

        const dateInfo = (
            <div>
                <div className="font-medium text-sm text-blue-600">
                    {formatDateRange(travelStart, travelEnd)[0]}
                </div>
                <div className="font-medium text-xs text-black mt-1">
                    {formatDateRange(travelStart, travelEnd)[1]}
                </div>
                <div className="font-medium text-xs mt-4">Booking Date : </div>
                <div className="font-medium text-xs text-black mt-1">
                    {formatFullDate(bookingDate)}
                </div>
            </div>
        );

        switch (currentTab) {
            case "all":
                const status = getBookingStatus(travelStart, travelEnd);
                return (
                    <tr
                        key={`${row.id}-${currentTab}`}
                        className="hover:bg-gray-50"
                    >
                        <td className="px-4 py-4 text-sm text-gray-600">
                            {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            {dateInfo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap md:whitespace-normal">
                            {bookingInfo}
                        </td>
                        <td className="px-4 py-4">{packageInfo}</td>
                        <td className="px-4 py-4 space-y-1 text-sm">
                            <div className="flex">
                                {row.booking.pickup.meeting_point ===
                                "Surabaya Airport" ? (
                                    row.booking.pickup.meeting_point_arrival ? (
                                        <>
                                            <div>
                                                <Plane className="inline-block w-4 h-4 mr-1" />
                                            </div>
                                            <div>
                                                {
                                                    row.booking.pickup
                                                        .meeting_point_arrival
                                                }
                                            </div>
                                        </>
                                    ) : (
                                        "-"
                                    )
                                ) : row.booking.pickup.meeting_point ===
                                  "Surabaya Train Station" ? (
                                    row.booking.pickup.meeting_point ? (
                                        <>
                                            <div>
                                                <Train className="inline-block w-4 h-4 mr-1" />
                                            </div>
                                            <div>
                                                {
                                                    row.booking.pickup
                                                        .meeting_point_arrival
                                                }
                                            </div>
                                        </>
                                    ) : (
                                        "-"
                                    )
                                ) : (
                                    ""
                                )}
                            </div>
                            <div className="flex">
                                {row.booking.pickup.meeting_point ===
                                "Surabaya Airport" ? (
                                    <div>
                                        <Ticket className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                ) : row.booking.pickup.meeting_point ===
                                  "Surabaya Hotel" ? (
                                    <div>
                                        <Hotel className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                ) : row.booking.pickup.meeting_point ===
                                  "Surabaya Train Station" ? (
                                    <div>
                                        <Ticket className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                ) : (
                                    row.booking.pickup.meeting_point_value && (
                                        <div>
                                            <MapPin className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    )
                                )}
                                {row.booking.pickup.meeting_point_value || "-"}
                            </div>
                            <div>
                                {row.booking.pickup.pickup_time ? (
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span className="text-gray-500">
                                            {row.booking.pickup.pickup_time}
                                        </span>
                                    </div>
                                ) : (
                                    "-"
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-4 space-y-1 text-sm">
                            <div className="flex">
                                {row.booking.dropoff.drop_point ===
                                "Surabaya Airport" ? (
                                    row.booking.dropoff.drop_point_arrival ? (
                                        <>
                                            <div>
                                                <Plane className="inline-block w-4 h-4 mr-1" />
                                            </div>
                                            <div>
                                                {
                                                    row.booking.dropoff
                                                        .drop_point_arrival
                                                }
                                            </div>
                                        </>
                                    ) : (
                                        "-"
                                    )
                                ) : row.booking.dropoff.drop_point ===
                                  "Surabaya Train Station" ? (
                                    row.booking.dropoff.drop_point ? (
                                        <>
                                            <div>
                                                <Train className="inline-block w-4 h-4 mr-1" />
                                            </div>
                                            <div>
                                                {
                                                    row.booking.dropoff
                                                        .drop_point_arrival
                                                }
                                            </div>
                                        </>
                                    ) : (
                                        "-"
                                    )
                                ) : (
                                    ""
                                )}
                            </div>
                            <div className="flex">
                                {row.booking.dropoff.drop_point ===
                                "Surabaya Airport" ? (
                                    <div>
                                        <Ticket className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                ) : row.booking.dropoff.drop_point ===
                                  "Surabaya Hotel" ? (
                                    <div>
                                        <Hotel className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                ) : row.booking.dropoff.drop_point ===
                                  "Surabaya Train Station" ? (
                                    <div>
                                        <Ticket className="inline-block w-4 h-4 mr-1" />
                                    </div>
                                ) : (
                                    row.booking.dropoff.drop_point_value && (
                                        <div>
                                            <MapPin className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    )
                                )}
                                {row.booking.dropoff.drop_point_value || "-"}
                            </div>
                            <div>
                                {row.booking.dropoff.drop_time ? (
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span className="text-gray-500">
                                            {row.booking.dropoff.drop_time}
                                        </span>
                                    </div>
                                ) : (
                                    "-"
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap md:whitespace-normal">
                            {formatRupiah(grandTotal)}
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(status)}</td>
                    </tr>
                );

            case "paid":
                const payment = row.payment || {};
                return (
                    <tr
                        key={`${row.id}-${currentTab}`}
                        className="hover:bg-gray-50"
                    >
                        <td className="px-4 py-4 text-sm text-gray-600">
                            {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            {dateInfo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap md:whitespace-normal">
                            {bookingInfo}
                        </td>
                        <td className="px-4 py-4">{packageInfo}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-green-600 whitespace-nowrap">
                            {row.channel === "TWT"
                                ? formatRupiah(row.booking.grand_total)
                                : formatRupiah(payment.nominal)}
                        </td>
                        {filters.channel != "klook" && (
                            <>
                                <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap md:whitespace-normal">
                                    {row.channel === "TWT"
                                        ? row.payment.map((pay, index) => {
                                              if (row.payment.length > 1) {
                                                  return (
                                                      <ul
                                                          className="list-disc"
                                                          key={index}
                                                      >
                                                          <li>
                                                              {pay.description ||
                                                                  "-"}
                                                          </li>
                                                      </ul>
                                                  );
                                              } else {
                                                  return pay.description || "-";
                                              }
                                          })
                                        : payment.description || "-"}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                                    {row.channel === "TWT"
                                        ? row.payment.map((pay, index) => {
                                              if (row.payment.length > 1) {
                                                  return (
                                                      <ul key={index}>
                                                          <li>
                                                              {getPaymentMethodImage(
                                                                  pay.payment_method,
                                                                  pay.reference,
                                                                  true,
                                                              )}
                                                          </li>
                                                      </ul>
                                                  );
                                              } else {
                                                  return getPaymentMethodImage(
                                                      pay.payment_method,
                                                      pay.reference,
                                                      true,
                                                  );
                                              }
                                          })
                                        : getPaymentMethodImage(
                                              payment.payment_method,
                                              payment.reference,
                                              true,
                                          )}
                                </td>
                                <td className="px-4 py-4 text-sm whitespace-nowrap">
                                    {row.channel === "TWT" ? (
                                        row.payment.map((pay, index) => {
                                            if (row.payment.length > 1) {
                                                return (
                                                    <ul
                                                        className="list-disc"
                                                        key={index}
                                                    >
                                                        <li>
                                                            <a
                                                                href={
                                                                    pay.receipt_url
                                                                }
                                                                target="_blank"
                                                                className="text-blue-600 underline hover:text-blue-700"
                                                            >
                                                                {pay.receipt ||
                                                                    "-"}
                                                            </a>
                                                        </li>
                                                    </ul>
                                                );
                                            } else {
                                                return (
                                                    <a
                                                        href={pay.receipt_url}
                                                        target="_blank"
                                                        className="text-blue-600 underline hover:text-blue-700"
                                                    >
                                                        {pay.receipt || "-"}
                                                    </a>
                                                );
                                            }
                                        })
                                    ) : payment.receipt == "-" ? (
                                        "-"
                                    ) : (
                                        <a
                                            href={`https://javavolcano-touroperator.com/backoffice/invoice/view-receipt/${row.booking.booking_id}/partial/${row.payment.id}`}
                                            target="_blank"
                                            className="text-blue-600 underline hover:text-blue-700"
                                        >
                                            {payment.receipt}
                                        </a>
                                    )}
                                </td>
                            </>
                        )}
                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {row.channel === "TWT"
                                ? row.payment.map((pay, index) => {
                                      if (row.payment.length > 1) {
                                          return (
                                              <ul
                                                  className="list-disc"
                                                  key={index}
                                              >
                                                  <li>
                                                      {pay.paid_at
                                                          ? formatFullDate(
                                                                pay.paid_at,
                                                            )
                                                          : "-"}
                                                  </li>
                                              </ul>
                                          );
                                      } else {
                                          return pay.paid_at
                                              ? formatFullDate(pay.paid_at)
                                              : "-";
                                      }
                                  })
                                : payment.paid_at == "-"
                                  ? "-"
                                  : formatFullDate(payment.paid_at)}
                        </td>
                    </tr>
                );

            case "pending":
                const pendingPayment = row.pending_payment || {};
                return (
                    <tr
                        key={`${row.id}-${currentTab}`}
                        className="hover:bg-gray-50"
                    >
                        <td className="px-4 py-4 text-sm text-gray-600">
                            {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap md:whitespace-normal">
                            {dateInfo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap md:whitespace-normal">
                            {bookingInfo}
                        </td>
                        <td className="px-4 py-4">{packageInfo}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-orange-600 whitespace-nowrap md:whitespace-normal">
                            {formatRupiah(pendingPayment.nominal || 0)}
                        </td>
                        {(filters.channel === "jvto" ||
                            filters.channel === "all") && (
                            <td className="px-4 py-4">
                                {getPaymentMethodImage(
                                    pendingPayment.payment_method,
                                    pendingPayment.payment_method_link,
                                    true,
                                )}
                            </td>
                        )}
                    </tr>
                );

            case "debt":
                const debt = row.booking?.debt || 0;
                return (
                    <tr
                        key={`${row.id}-${currentTab}`}
                        className="hover:bg-gray-50"
                    >
                        <td className="px-4 py-4 text-sm text-gray-600">
                            {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap md:whitespace-normal">
                            {dateInfo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap md:whitespace-normal">
                            {bookingInfo}
                        </td>
                        <td className="px-4 py-4">{packageInfo}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-red-600 whitespace-nowrap md:whitespace-normal">
                            {formatRupiah(debt)}
                        </td>
                    </tr>
                );

            case "expense":
                const totalExpense = row.booking?.total_expense || 0;
                const crewExpense = row.booking?.crew_expense || 0;
                return (
                    <tr
                        key={`${row.id}-${currentTab}`}
                        className="hover:bg-gray-50"
                    >
                        <td className="px-4 py-4 text-sm text-gray-600">
                            {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap md:whitespace-normal">
                            {dateInfo}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap md:whitespace-normal">
                            {bookingInfo}
                        </td>
                        <td className="px-4 py-4">{packageInfo}</td>
                        <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap md:whitespace-normal">
                            {formatRupiah(grandTotal)}
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap md:whitespace-normal">
                            {formatRupiah(totalExpense)}
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap md:whitespace-normal">
                            {formatRupiah(crewExpense)}
                        </td>
                    </tr>
                );

            default:
                return (
                    <tr
                        key={`${row.id}-${currentTab}`}
                        className="hover:bg-gray-50"
                    >
                        <td className="px-4 py-4 text-sm text-gray-600">
                            {index + 1}
                        </td>
                        <td className="px-4 py-4">
                            {getChannelBadge(channel)}
                        </td>
                        <td className="px-4 py-4">{bookingInfo}</td>
                    </tr>
                );
        }
    };

    const renderTableContent = () => {
        if (filteredData.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={getTableHeaders().length}
                        className="px-4 py-8 text-center text-gray-500"
                    >
                        No bookings found for the selected criteria.
                    </td>
                </tr>
            );
        }

        return filteredData.map((row, index) => renderTableRow(row, index));
    };

    return (
        <Authenticated>
            <div className="bg-gray-50 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Booking & Financial Dashboard JVTO
                </h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-2xl font-bold text-blue-600">
                            {summary.total_bookings || 0}
                        </div>
                        <div className="text-gray-600 text-sm">
                            Total Bookings
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-xl font-bold text-green-600">
                            {formatRupiah(summary.total_paid || 0)}
                        </div>
                        <div className="text-gray-600 text-sm">Total Paid</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-xl font-bold text-orange-600">
                            {formatRupiah(summary.total_pending || 0)}
                        </div>
                        <div className="text-gray-600 text-sm">
                            Pending Payment
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-xl font-bold text-red-600">
                            {formatRupiah(summary.total_debt || 0)}
                        </div>
                        <div className="text-gray-600 text-sm">
                            Outstanding Debt
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-xl font-bold text-purple-600">
                            {formatRupiah(summary.total_expense || 0)}
                        </div>
                        <div className="text-gray-600 text-sm">
                            Total Expense
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterChange("tab", tab.key)}
                            className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
                                currentTab === tab.key
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            Channel:
                        </label>
                        <select
                            value={currentChannel}
                            onChange={(e) =>
                                handleFilterChange("channel", e.target.value)
                            }
                            className="py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {channels.map((channel) => (
                                <option key={channel.key} value={channel.key}>
                                    {channel.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex md:items-center flex-col md:flex-row gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            Month:
                        </label>
                        <input
                            type="month"
                            value={currentMonth}
                            onChange={(e) =>
                                handleFilterChange("year_month", e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* {currentTab === "paid" && (
                        <div className="flex md:items-center flex-col md:flex-row gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Date Type:
                            </label>
                            <select
                                value={currentDateType}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "date_type",
                                        e.target.value,
                                    )
                                }
                                className="py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {dateTypes.map((type) => (
                                    <option key={type.key} value={type.key}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )} */}
                    <div className="flex-1">
                        <label className="md:hidden mb-1 block text-sm font-medium text-gray-700">
                            Search:
                        </label>
                        <input
                            type="text"
                            placeholder="Search client, booking, package..."
                            value={localFilters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="flex-1 px-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Current Filter Display */}
                {(currentChannel !== "all" ||
                    currentMonth ||
                    currentTab !== "all" ||
                    currentDateType !== "trip") && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800 flex flex-wrap gap-2 items-center">
                            <span className="font-medium">Active filters:</span>
                            {currentTab !== "all" && (
                                <span className="bg-blue-200 text-xs font-medium px-2 py-1 rounded">
                                    Tab:{" "}
                                    {
                                        tabs.find((t) => t.key === currentTab)
                                            ?.label
                                    }
                                </span>
                            )}
                            {currentChannel !== "all" && (
                                <span className="bg-blue-200 text-xs font-medium px-2 py-1 rounded">
                                    Channel:{" "}
                                    {
                                        channels.find(
                                            (c) => c.key === currentChannel,
                                        )?.label
                                    }
                                </span>
                            )}
                            {currentMonth && (
                                <span className="bg-blue-200 text-xs font-medium px-2 py-1 rounded">
                                    Month: {currentMonth}
                                </span>
                            )}
                            {currentDateType !== "trip" && (
                                <span className="bg-blue-200 text-xs font-medium px-2 py-1 rounded">
                                    Date Type:{" "}
                                    {
                                        dateTypes.find(
                                            (d) => d.key === currentDateType,
                                        )?.label
                                    }
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {getTableHeaders().map((header, index) => (
                                        <th
                                            key={index}
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredData.length} of{" "}
                    {Array.isArray(booking) ? booking.length : 0} bookings
                    {currentMonth && ` for ${currentMonth}`}
                    {currentTab !== "all" &&
                        ` in ${tabs.find((t) => t.key === currentTab)?.label} tab`}
                    {currentChannel !== "all" &&
                        ` from ${channels.find((c) => c.key === currentChannel)?.label} channel`}
                </div>
            </div>
        </Authenticated>
    );
};

export default FinanceDashboard;
