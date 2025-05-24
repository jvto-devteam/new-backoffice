import React, { useState, useMemo, useEffect } from "react";
import Swal from "@/utils/swal";
import { router } from "@inertiajs/react";
import Authenticated from "@/Layouts/Main";
import { Download, BookmarkCheck, Image,Upload } from "lucide-react";

const formatCurrency = (value) => {
    value = parseInt(value);
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
        .format(value)
        .replace("IDR", "Rp");
};

const BookingInfo = ({ booking }) => {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Tour Expense Details</h1>
            <div className="flex gap-10">
                <div className="space-y-1">
                    <p>
                        <span className="font-bold"> Order Channel:</span>{" "}
                        {booking.channel}
                    </p>
                    <p>
                        <span className="font-bold">Reference: </span>{" "}
                        {booking.reference}
                    </p>
                    <p>
                        <span className="font-bold">Client: </span>{" "}
                        {booking.user.name}
                    </p>
                    <p>
                        <span className="font-bold">Package: </span>{" "}
                        {booking.booking_detail[0]?.package?.name ||
                            `${booking.package_duration}D ${booking.package_duration - 1}N Packages`}
                    </p>
                    <p>
                        <span className="font-bold">Number of Pax: </span>{" "}
                        {booking.total_pax} PAX
                    </p>
                </div>
                <div className="space-y-1">
                    <p>
                        <span className="font-bold">Trip Date: </span>{" "}
                        {booking.trip_date}
                    </p>
                    <p>
                        <span className="font-bold">Duration: </span>{" "}
                        {booking.duration_day} Days {booking.duration_day - 1}{" "}
                        {booking.duration_day - 1 == 1 ? "Night" : "Nights"}
                    </p>
                    <p>
                        <span className="font-bold">Driver: </span>{" "}
                        {booking.crew
                            .filter((crew) => crew.type === "driver")
                            .map((crew, index) => (
                                <span key={index}>
                                    {crew.person.name}
                                    {index <
                                    booking.crew.filter(
                                        (crew) => crew.type === "driver",
                                    ).length -
                                        1
                                        ? ", "
                                        : ""}
                                </span>
                            ))}
                    </p>
                    <p>
                        <span className="font-bold">Vehicle: </span>{" "}
                        {booking.car.map((car, index) => (
                            <span key={index}>
                                {car.car.name}
                                {index < booking.car.length - 1 ? ", " : ""}
                            </span>
                        ))}
                    </p>
                    <p>
                        <span className="font-bold">Guide: </span>{" "}
                        {booking.crew
                            .filter((crew) => crew.type === "guide")
                            .map((crew, index) => (
                                <span key={index}>
                                    {crew.person.name}{" "}
                                    {crew.guide_ijen == "1" ? "(IJEN)" : ""}
                                    {index <
                                    booking.crew.filter(
                                        (crew) => crew.type === "guide",
                                    ).length -
                                        1
                                        ? ", "
                                        : ""}
                                </span>
                            ))}
                    </p>
                </div>
            </div>
        </div>
    );
};
const PaymentProofModal = ({ isOpen, onClose, booking }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setPreviewUrl(null);
            setErrorMessage("");

            // If there's an existing payment proof, set it as preview
            if (booking.payment_proof_expense) {
                setPreviewUrl(`/storage/${booking.payment_proof_expense}`);
            }
        }
    }, [isOpen, booking]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) {
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf",
        ];
        if (!allowedTypes.includes(selectedFile.type)) {
            setErrorMessage("Please select an image (JPG, PNG) or PDF file");
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setErrorMessage("File size cannot exceed 5MB");
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        setFile(selectedFile);
        setErrorMessage("");

        // Create preview for images
        if (selectedFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else if (selectedFile.type === "application/pdf") {
            // For PDF, use a placeholder image
            setPreviewUrl("/images/pdf-placeholder.png");
        }
    };

    const handleSubmit = () => {
        if (!file && !booking.payment_proof_expense) {
            setErrorMessage("Please select a file to upload");
            return;
        }

        // If there's no new file and we already have a payment proof, just close the modal
        if (!file && booking.payment_proof_expense) {
            onClose();
            return;
        }

        // Create form data for file upload
        const formData = new FormData();
        formData.append("payment_proof", file);
        formData.append("booking_id", booking.id);

        setIsUploading(true);

        // Upload the file
        router.post(
            `/finance/expense-manager/${booking.id}/upload-payment-proof`,
            formData,
            {
                onSuccess: () => {
                    Swal.fire({
                        title: "Success!",
                        text: "Payment proof has been uploaded successfully",
                        icon: "success",
                    }).then(() => {
                        setIsUploading(false);
                        onClose();
                        // Refresh the page to show the updated payment proof
                        router.visit(
                            `/finance/expense-manager/${booking.id}/edit`,
                        );
                    });
                },
                onError: (errors) => {
                    setIsUploading(false);
                    setErrorMessage(
                        errors.message || "Failed to upload payment proof",
                    );
                    console.error("Upload errors:", errors);
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    };

    const handleDelete = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will remove the payment proof. Continue?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    `/finance/expense-manager/${booking.id}/delete-payment-proof`,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Payment proof has been removed",
                                icon: "success",
                            }).then(() => {
                                onClose();
                                // Refresh the page to update the UI
                                router.visit(
                                    `/finance/expense-manager/${booking.id}/edit`,
                                );
                            });
                        },
                        onError: (errors) => {
                            setErrorMessage(
                                errors.message ||
                                    "Failed to delete payment proof",
                            );
                        },
                    },
                );
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {booking.payment_proof_expense
                            ? "Payment Proof"
                            : "Upload Payment Proof"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {errorMessage}
                    </div>
                )}

                {/* Preview Section */}
                <div className="mb-4">
                    {previewUrl ? (
                        <div className="flex flex-col items-center">
                            <div className="border rounded p-2 mb-2 bg-gray-50 w-full">
                                <img
                                    src={previewUrl}
                                    alt="Payment Proof"
                                    className="max-h-64 max-w-full mx-auto object-contain"
                                />
                            </div>
                            {!booking.payment_proof_expense && (
                                <p className="text-sm text-gray-500 mb-2">
                                    Selected file: {file?.name}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <p className="text-gray-500">No file selected</p>
                        </div>
                    )}
                </div>

                {/* File Input */}
                {booking.payment_proof_expense === null && (
                    <>
                        {!isUploading && (
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    {booking.payment_proof_expense
                                        ? "Change payment proof:"
                                        : "Select file:"}
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="border rounded w-full py-2 px-3 text-gray-700"
                                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Allowed formats: JPG, PNG, PDF. Max size:
                                    5MB
                                </p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            {booking.payment_proof_expense && !file && (
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    disabled={isUploading}
                                >
                                    Delete
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
                                disabled={isUploading}
                            >
                                {booking.payment_proof_expense && !file
                                    ? "Close"
                                    : "Cancel"}
                            </button>

                            {(!booking.payment_proof_expense || file) && (
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                                            Uploading...
                                        </>
                                    ) : (
                                        "Upload"
                                    )}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
const SummaryCards = ({ booking, totals }) => {
    const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {/* Total Expenses */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Total Expenses</span>
                        <a
                            href={`/finance/expense-manager/${booking.id}/internal`}
                            className="text-blue-600"
                        >
                            <Download />
                        </a>
                    </div>
                    <div className="text-blue-600 text-2xl font-bold mt-1">
                        {formatCurrency(totals.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        All expense items
                    </div>
                </div>

                {/* ✅ Net Total = Unpaid Items (Need immediate payment) */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">
                            Net Total ({totals.unpaidItemsCount})
                        </span>
                        <div className="flex gap-1">
                            <a
                                href=""
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (booking.payment_proof_expense === null) {
                                        setIsPaymentProofModalOpen(true);
                                    } else {
                                        window.open(
                                            "/storage/" + booking.payment_proof_expense,
                                            "_blank",
                                        );
                                    }
                                }}
                                className="text-orange-600"
                            >
                                <Image />
                            </a>


                            <a
                                href={`/finance/expense-manager/${booking.id}/crew`}
                                className="text-orange-600"
                            >
                                <Download />
                            </a>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-orange-600 text-2xl font-bold mt-1">
                            {formatCurrency(totals.unpaidAmount)}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Need immediate payment
                    </div>
                </div>

                {/* Already Paid Items */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">
                            Already Paid ({totals.paidItemsCount})
                        </span>
                        <div className="flex gap-1">
                            <a
                                href={`/finance/expense-manager/${booking.id}/paid`}
                                className="text-green-600"
                            >
                                <Download />
                            </a>
                        </div>
                    </div>
                    <div className="text-green-600 text-2xl font-bold mt-1">
                        {formatCurrency(totals.paidAmount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Completed payments
                    </div>
                </div>

                {/* Pay Later Total */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">
                            Pay Later ({totals.payLaterItemsCount})
                        </span>
                        <div className="flex gap-1">
                            <a
                                href={`/finance/expense-manager/${booking.id}/pay-later`}
                                className="text-blue-600"
                            >
                                <Download />
                            </a>
                        </div>
                    </div>
                    <div className="text-blue-600 text-2xl font-bold mt-1">
                        {formatCurrency(totals.debtAmount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Deferred payments
                    </div>
                </div>

                {/* ✅ PRESERVED: Invoice Total */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Invoice</span>
                        <div className="flex gap-1">
                            <a
                                href={`https://javavolcano-touroperator.com/bookings/invoice/${booking.url}`}
                                className="text-red-500"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download />
                            </a>
                        </div>
                    </div>
                    <div className="text-red-500 text-2xl font-bold mt-1">
                        {formatCurrency(
                            parseInt(booking.grand_total) + parseInt(booking.book_add_on_total || 0)
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Customer invoice total
                    </div>
                </div>
            </div>

            {/* Payment Proof Modal */}
            <PaymentProofModal
                isOpen={isPaymentProofModalOpen}
                onClose={() => setIsPaymentProofModalOpen(false)}
                booking={booking}
            />
        </>
    );
};
const ExpenseTable = ({
    items,
    onPayLaterChange,
    onPaidChange,
    onEdit,
    onDelete,
}) => {
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState("");

    const handleKeyPress = (e, itemId, field, index) => {
        if (e.key === "Enter") {
            handleSave(itemId, field, index);
        }
    };

    const hotelGroups = items.reduce((acc, item) => {
        if (item.category === "Accommodation") {
            const hotelId = item.originalData.hotelId;
            if (!acc[hotelId]) {
                acc[hotelId] = {
                    index: items.indexOf(item),
                    isDebt: item.isDebt,
                    isPaid: item.isPaid, // ✅ Add isPaid tracking
                };
            }
        }
        return acc;
    }, {});

    const handleEdit = (itemId, field, value) => {
        setEditingCell(`${itemId}-${field}`);
        setEditValue(value.toString());
    };

    const handleSave = (itemId, field, index) => {
        let newValue = editValue;

        if (field === "qty") {
            newValue = parseInt(editValue) || 1;
        } else if (field === "rate") {
            newValue = parseInt(editValue.replace(/[^\d]/g, "")) || 0;
        }

        onEdit(index, field, newValue);
        setEditingCell(null);
        setEditValue("");
    };

    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    const categoryOrder = [
        "Accommodation",
        "Destination",
        "Others",
        "Transport",
        "Resource",
    ];

    let counter = 1;

    return (
        <div className="bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold p-4 border-b">Expense Items</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-500">
                                NO
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-500">
                                DESCRIPTION
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-500">
                                SUB CATEGORY
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-500">
                                UNIT
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-bold text-gray-500">
                                QTY
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-bold text-gray-500">
                                RATE
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-bold text-gray-500">
                                AMOUNT
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold text-gray-500">
                                PAID
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-bold text-gray-500">
                                PAY LATER
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categoryOrder.map((category) => {
                            const categoryItems = groupedItems[category] || [];
                            if (categoryItems.length === 0) return null;

                            return (
                                <React.Fragment key={category}>
                                    <tr className="bg-gray-200">
                                        <td
                                            colSpan="10"
                                            className="px-4 py-2 font-bold"
                                        >
                                            {category}
                                        </td>
                                    </tr>

                                    {categoryItems.map((item, itemIndex) => {
                                        const currentNumber = counter++;
                                        const hotelId =
                                            item.originalData?.hotelId;
                                        const showToggle =
                                            item.category !== "Accommodation" ||
                                            (hotelGroups[hotelId] &&
                                                hotelGroups[hotelId].index ===
                                                    items.indexOf(item));

                                        return (
                                            <tr
                                                key={item.id}
                                                className={
                                                    item.isPaid
                                                        ? "bg-green-50" // Green for paid items
                                                        : item.isDebt
                                                          ? "bg-yellow-50" // Yellow for pay later items
                                                          : "bg-white" // White for unpaid items
                                                }
                                            >
                                                <td className="px-4 py-3 text-sm">
                                                    {currentNumber}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {item.description}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {item.subCategory}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {item.unit}
                                                </td>

                                                {/* QTY Cell - No changes */}
                                                <td className="px-4 py-3 text-sm text-right">
                                                    {editingCell ===
                                                    `${item.id}-qty` ? (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <input
                                                                type="number"
                                                                value={
                                                                    editValue
                                                                }
                                                                onChange={(e) =>
                                                                    setEditValue(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onKeyPress={(
                                                                    e,
                                                                ) =>
                                                                    handleKeyPress(
                                                                        e,
                                                                        item.id,
                                                                        "qty",
                                                                        items.indexOf(
                                                                            item,
                                                                        ),
                                                                    )
                                                                }
                                                                className="w-16 p-1 border rounded text-right"
                                                                min="1"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    handleSave(
                                                                        item.id,
                                                                        "qty",
                                                                        items.indexOf(
                                                                            item,
                                                                        ),
                                                                    )
                                                                }
                                                                className="text-green-600 hover:text-green-800"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span>
                                                                {item.qty}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        item.id,
                                                                        "qty",
                                                                        item.qty,
                                                                    )
                                                                }
                                                                className="text-gray-400 hover:text-gray-600"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-3 w-3"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* RATE Cell - No changes */}
                                                <td className="px-4 py-3 text-sm text-right">
                                                    {editingCell ===
                                                    `${item.id}-rate` ? (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <input
                                                                type="text"
                                                                value={
                                                                    editValue.startsWith(
                                                                        "Rp",
                                                                    )
                                                                        ? editValue
                                                                        : formatCurrency(
                                                                              editValue,
                                                                          )
                                                                }
                                                                onChange={(e) =>
                                                                    setEditValue(
                                                                        e.target.value.replace(
                                                                            /[^\d]/g,
                                                                            "",
                                                                        ),
                                                                    )
                                                                }
                                                                onKeyPress={(
                                                                    e,
                                                                ) =>
                                                                    handleKeyPress(
                                                                        e,
                                                                        item.id,
                                                                        "rate",
                                                                        items.indexOf(
                                                                            item,
                                                                        ),
                                                                    )
                                                                }
                                                                className="w-32 p-1 border rounded text-right"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    handleSave(
                                                                        item.id,
                                                                        "rate",
                                                                        items.indexOf(
                                                                            item,
                                                                        ),
                                                                    )
                                                                }
                                                                className="text-green-600 hover:text-green-800"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span>
                                                                {formatCurrency(
                                                                    item.rate,
                                                                )}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        item.id,
                                                                        "rate",
                                                                        item.rate,
                                                                    )
                                                                }
                                                                className="text-gray-400 hover:text-gray-600"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-3 w-3"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-right">
                                                    {formatCurrency(
                                                        item.amount,
                                                    )}
                                                </td>
                                                {/* PAID Column - Updated with exclusive logic */}
                                                <td className="px-4 py-3">
                                                    {showToggle &&
                                                        !item.debtPaymentId && (
                                                            <div className="flex justify-center">
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            item.isPaid
                                                                        }
                                                                        disabled={
                                                                            item.isDebt
                                                                        } // ✅ Disabled when Pay Later is active
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            if (
                                                                                e
                                                                                    .target
                                                                                    .checked
                                                                            ) {
                                                                                // When marking as paid, automatically turn off pay later
                                                                                onPaidChange(
                                                                                    items.indexOf(
                                                                                        item,
                                                                                    ),
                                                                                    true,
                                                                                );
                                                                                if (
                                                                                    item.isDebt
                                                                                ) {
                                                                                    onPayLaterChange(
                                                                                        items.indexOf(
                                                                                            item,
                                                                                        ),
                                                                                        false,
                                                                                    );
                                                                                }
                                                                            } else {
                                                                                onPaidChange(
                                                                                    items.indexOf(
                                                                                        item,
                                                                                    ),
                                                                                    false,
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="sr-only peer"
                                                                    />
                                                                    <div
                                                                        className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                                                                            item.isDebt
                                                                                ? "bg-gray-300 cursor-not-allowed"
                                                                                : "bg-gray-200 peer-focus:outline-none peer-checked:bg-green-600"
                                                                        }`}
                                                                    ></div>
                                                                </label>
                                                            </div>
                                                        )}
                                                    {item.debtPaymentId && (
                                                        <div className="text-sm text-center text-green-600 font-medium flex justify-center items-center gap-1">
                                                            <BookmarkCheck className="h-5 w-5" />
                                                            PAID
                                                        </div>
                                                    )}
                                                </td>

                                                {/* PAY LATER Column - Updated with exclusive logic */}
                                                <td className="px-4 py-3">
                                                    {showToggle &&
                                                        !item.debtPaymentId && (
                                                            <div className="flex justify-center">
                                                                <label className="relative inline-flex items-center cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            item.isDebt
                                                                        }
                                                                        disabled={
                                                                            item.isPaid
                                                                        } // ✅ Disabled when Paid is active
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            if (
                                                                                e
                                                                                    .target
                                                                                    .checked
                                                                            ) {
                                                                                // When marking as pay later, automatically turn off paid
                                                                                onPayLaterChange(
                                                                                    items.indexOf(
                                                                                        item,
                                                                                    ),
                                                                                    true,
                                                                                );
                                                                                if (
                                                                                    item.isPaid
                                                                                ) {
                                                                                    onPaidChange(
                                                                                        items.indexOf(
                                                                                            item,
                                                                                        ),
                                                                                        false,
                                                                                    );
                                                                                }
                                                                            } else {
                                                                                onPayLaterChange(
                                                                                    items.indexOf(
                                                                                        item,
                                                                                    ),
                                                                                    false,
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="sr-only peer"
                                                                    />
                                                                    <div
                                                                        className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                                                                            item.isPaid
                                                                                ? "bg-gray-300 cursor-not-allowed"
                                                                                : "bg-gray-200 peer-focus:outline-none peer-checked:bg-blue-600"
                                                                        }`}
                                                                    ></div>
                                                                </label>
                                                            </div>
                                                        )}
                                                    {item.debtPaymentId && (
                                                        <div className="text-sm text-center text-green-600 font-medium flex justify-center items-center gap-1">
                                                            <BookmarkCheck className="h-5 w-5" />
                                                            PAY LATER (PAID)
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.category !==
                                                        "Accommodation" &&
                                                        !item.debtPaymentId && (
                                                            <div className="flex justify-center">
                                                                <button
                                                                    onClick={() =>
                                                                        onDelete(
                                                                            items.indexOf(
                                                                                item,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-700"
                                                                    title="Delete item"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-5 w-5"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
// Modal-modal tambahan
const AddDestinationModal = ({
    isOpen,
    onClose,
    onAddActivity,
    listForNewItems,
    existingItems,
}) => {
    const [selectedDestination, setSelectedDestination] = useState("");
    const [selectedActivity, setSelectedActivity] = useState("");
    const [newActivity, setNewActivity] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [isNewActivity, setIsNewActivity] = useState(false);

    const availableDestinations = useMemo(() => {
        return Object.keys(listForNewItems || {});
    }, [listForNewItems]);

    const availableActivities = useMemo(() => {
        if (
            !selectedDestination ||
            !listForNewItems ||
            !listForNewItems[selectedDestination]
        ) {
            return [];
        }

        // Get existing activities for this destination
        const existingActivitiesForDestination = existingItems
            .filter((item) => item.subCategory === selectedDestination)
            .map((item) => item.description);

        // Filter available activities that are not in existingItems
        return listForNewItems[selectedDestination]
            .filter(
                (activity) =>
                    activity &&
                    activity.name &&
                    !existingActivitiesForDestination.includes(activity.name),
            )
            .map((activity) => ({
                id: activity.id,
                name: activity.name,
                price: activity.price,
            }));
    }, [selectedDestination, listForNewItems, existingItems]);

    const getActivityPrice = (destName, activityName) => {
        const activity = (listForNewItems[destName] || []).find(
            (a) => a.name === activityName,
        );
        return activity ? parseFloat(activity.price) : 0;
    };

    const handleSubmit = () => {
        const activityName = isNewActivity ? newActivity : selectedActivity;
        if (selectedDestination && activityName) {
            const selectedDestinationData =
                listForNewItems[selectedDestination]?.[0];
            const selectedActivityData = listForNewItems[
                selectedDestination
            ]?.find((a) => a.name === selectedActivity);

            const newActivityData = {
                destination_id: selectedDestinationData?.destination_id,
                // Incluir el nombre del destino
                destinationName: selectedDestination,

                destination_activity: {
                    name: activityName,
                    id: isNewActivity ? null : selectedActivityData?.id,
                },

                ...(isNewActivity
                    ? {}
                    : { destination_activity_id: selectedActivityData?.id }),

                qty: quantity,
                price:
                    price ||
                    (isNewActivity
                        ? 0
                        : getActivityPrice(
                              selectedDestination,
                              selectedActivity,
                          )),
                name: activityName,
                status_paid: "unpaid",
                is_debt: "0",
                isNewActivity: isNewActivity,
            };

            onAddActivity(newActivityData);

            // Reset modal (sin cambios)
            setSelectedDestination("");
            setSelectedActivity("");
            setNewActivity("");
            setQuantity(1);
            setPrice(0);
            setIsNewActivity(false);
            onClose();
        }
    };

    const handleSwitchChange = (checked) => {
        setIsNewActivity(checked);
        setSelectedActivity("");
        setNewActivity("");
        setPrice(0);
    };

    const isSubmitDisabled =
        !selectedDestination ||
        (isNewActivity ? !newActivity : !selectedActivity) ||
        quantity <= 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-xl font-bold mb-4">
                    Add New Destination Activity
                </h2>

                {/* Destination Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Select Destination
                    </label>
                    <select
                        value={selectedDestination}
                        onChange={(e) => {
                            setSelectedDestination(e.target.value);
                            setSelectedActivity("");
                            setNewActivity("");
                        }}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select a destination</option>
                        {availableDestinations.map((dest) => (
                            <option key={dest} value={dest}>
                                {dest}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Switch Toggle for New/Existing Activity */}
                <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">New Activity</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isNewActivity}
                            onChange={(e) =>
                                handleSwitchChange(e.target.checked)
                            }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Activity Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        {isNewActivity
                            ? "Enter New Activity"
                            : "Select Activity"}
                    </label>
                    {isNewActivity ? (
                        <input
                            type="text"
                            value={newActivity}
                            onChange={(e) => setNewActivity(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter activity name"
                            disabled={!selectedDestination}
                        />
                    ) : (
                        <select
                            value={selectedActivity}
                            onChange={(e) => {
                                const activity = e.target.value;
                                setSelectedActivity(activity);
                                const selectedActivityData =
                                    availableActivities.find(
                                        (a) => a.name === activity,
                                    );
                                setPrice(
                                    selectedActivityData
                                        ? selectedActivityData.price
                                        : 0,
                                );
                            }}
                            className="w-full p-2 border rounded"
                            disabled={!selectedDestination}
                        >
                            <option value="">Select an activity</option>
                            {availableActivities.map((activity) => (
                                <option key={activity.id} value={activity.name}>
                                    {activity.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Quantity */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Price */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Price</label>
                    <input
                        type="text"
                        value={formatCurrency(price)}
                        onChange={(e) =>
                            setPrice(
                                parseInt(e.target.value.replace(/\D/g, "")) ||
                                    0,
                            )
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={isSubmitDisabled}
                    >
                        Add Activity
                    </button>
                </div>
            </div>
        </div>
    );
};
const AddOthersModal = ({
    isOpen,
    onClose,
    onAddItem,
    listForNewItems,
    existingItems,
}) => {
    const [selectedActivity, setSelectedActivity] = useState("");
    const [newActivity, setNewActivity] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [isNewActivity, setIsNewActivity] = useState(false);

    const availableActivities = useMemo(() => {
        console.log("listForNewItems:", listForNewItems); // Untuk debug

        // Pastikan listForNewItems adalah array
        const othersList = Array.isArray(listForNewItems)
            ? listForNewItems
            : [];

        // Get existing others activities
        const existingActivities = existingItems.map(
            (item) => item.description,
        );

        // Filter out activities that already exist in the table
        return othersList.filter(
            (activity) =>
                activity &&
                activity.name &&
                !existingActivities.includes(activity.name),
        );
    }, [listForNewItems, existingItems]);

    const getActivityPrice = (activityName) => {
        const activity = listForNewItems.find((a) => a.name === activityName);
        return activity ? parseFloat(activity.price) : 0;
    };

    const handleSubmit = () => {
        const activityName = isNewActivity ? newActivity : selectedActivity;
        if (activityName) {
            const selectedActivityData = listForNewItems.find(
                (a) => a.name === selectedActivity,
            );

            // Para items nuevos, no envíes others_activity_id directamente
            const originalData = isNewActivity
                ? { type: "other", name: activityName, isNewActivity: true }
                : {
                      type: "other",
                      others_activity_id: selectedActivityData.id,
                      isNewActivity: false,
                  };

            onAddItem({
                category: "Others",
                subCategory: "Additional",
                description: activityName,
                unit: "Item",
                qty: quantity,
                rate:
                    price ||
                    (isNewActivity ? 0 : getActivityPrice(selectedActivity)),
                amount:
                    quantity *
                    (price ||
                        (isNewActivity
                            ? 0
                            : getActivityPrice(selectedActivity))),
                isDebt: false,
                originalData: originalData,
            });
            // Reset modal
            setSelectedActivity("");
            setNewActivity("");
            setQuantity(1);
            setPrice(0);
            setIsNewActivity(false);
            onClose();
        }
    };

    const isSubmitDisabled =
        (isNewActivity ? !newActivity : !selectedActivity) || quantity <= 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-xl font-bold mb-4">Add New Others Item</h2>

                {/* Switch Toggle for New/Existing Activity */}
                <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">New Item</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isNewActivity}
                            onChange={(e) => {
                                setIsNewActivity(e.target.checked);
                                setSelectedActivity("");
                                setNewActivity("");
                            }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Activity Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        {isNewActivity ? "Enter New Item" : "Select Others"}
                    </label>
                    {isNewActivity ? (
                        <input
                            type="text"
                            value={newActivity}
                            onChange={(e) => setNewActivity(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter item name"
                        />
                    ) : (
                        <select
                            value={selectedActivity}
                            onChange={(e) => {
                                const activityName = e.target.value;
                                setSelectedActivity(activityName);
                                setPrice(getActivityPrice(activityName));
                            }}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select an item</option>
                            {availableActivities.map((activity) => (
                                <option key={activity.id} value={activity.name}>
                                    {activity.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Quantity */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Price */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Price</label>
                    <input
                        type="text"
                        value={formatCurrency(price)}
                        onChange={(e) =>
                            setPrice(
                                parseInt(e.target.value.replace(/\D/g, "")) ||
                                    0,
                            )
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={isSubmitDisabled}
                    >
                        Add Item
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddTransportationModal = ({
    isOpen,
    onClose,
    onAddItem,
    listForNewItems,
    existingItems,
}) => {
    const [selectedTransportation, setSelectedTransportation] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);

    const availableTransportations = useMemo(() => {
        // Pastikan listForNewItems.cars adalah array dan sudah ada
        const transportList =
            listForNewItems && Array.isArray(listForNewItems)
                ? listForNewItems
                : [];
        const existingVehicles = existingItems.map((item) => item.description);

        return transportList.filter(
            (car) => car && car.name && !existingVehicles.includes(car.name),
        );
    }, [listForNewItems, existingItems]);

    const getTransportationPrice = (transportationName) => {
        const cars = listForNewItems.cars || [];
        const car = cars.find((c) => c.name === transportationName);
        return car ? car.price : 0;
    };

    const handleSubmit = () => {
        if (selectedTransportation) {
            const transportation = listForNewItems.find(
                (c) => c.name === selectedTransportation,
            );

            onAddItem({
                category: "Transport",
                subCategory: "Airport Transfer",
                description: selectedTransportation,
                unit: "Unit",
                qty: quantity,
                rate: price || getTransportationPrice(selectedTransportation),
                amount:
                    quantity *
                    (price || getTransportationPrice(selectedTransportation)),
                isDebt: false,
                originalData: {
                    type: "transport",
                    car_id: transportation.id,
                },
            });

            // Reset modal
            setSelectedTransportation("");
            setQuantity(1);
            setPrice(0);
            onClose();
        }
    };

    const isSubmitDisabled = !selectedTransportation || quantity <= 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-xl font-bold mb-4">
                    Add New Transportation
                </h2>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Select Transportation
                    </label>
                    <select
                        value={selectedTransportation}
                        onChange={(e) => {
                            const transportName = e.target.value;
                            setSelectedTransportation(transportName);
                            const selectedTransport =
                                availableTransportations.find(
                                    (t) => t.name === transportName,
                                );
                            setPrice(
                                selectedTransport
                                    ? parseFloat(selectedTransport.price)
                                    : 0,
                            );
                        }}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select a transportation</option>
                        {availableTransportations.map((transport) => (
                            <option key={transport.id} value={transport.name}>
                                {transport.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Price</label>
                    <input
                        type="text"
                        value={formatCurrency(price)}
                        onChange={(e) =>
                            setPrice(
                                parseInt(e.target.value.replace(/\D/g, "")) ||
                                    0,
                            )
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={isSubmitDisabled}
                    >
                        Add Transportation
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddCrewModal = ({
    isOpen,
    onClose,
    onAddItem,
    listForNewItems,
    existingItems,
}) => {
    const [selectedCrew, setSelectedCrew] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);

    const availableCrews = useMemo(() => {
        // Pastikan listForNewItems adalah array
        const crewList =
            listForNewItems && Array.isArray(listForNewItems)
                ? listForNewItems
                : [];
        const existingCrews = existingItems.map((item) => item.description);

        return crewList.filter(
            (crew) => crew && crew.role && !existingCrews.includes(crew.role),
        );
    }, [listForNewItems, existingItems]);

    const getCrewPrice = (crewRole) => {
        const crews = listForNewItems.crews || [];
        const crew = crews.find((c) => c.role === crewRole);
        return crew ? crew.rate : 0;
    };

    const handleSubmit = () => {
        if (selectedCrew) {
            const crew = listForNewItems.find((c) => c.role === selectedCrew);

            onAddItem({
                category: "Resource",
                subCategory: "Crew",
                description: selectedCrew,
                unit: "Person",
                qty: quantity,
                rate: price || getCrewPrice(selectedCrew),
                amount: quantity * (price || getCrewPrice(selectedCrew)),
                isDebt: false,
                originalData: {
                    type: "crew",
                    crew_role_id: crew.id,
                },
            });

            // Reset modal
            setSelectedCrew("");
            setQuantity(1);
            setPrice(0);
            onClose();
        }
    };

    const isSubmitDisabled = !selectedCrew || quantity <= 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-xl font-bold mb-4">Add New Crew</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Select Crew
                    </label>
                    <select
                        value={selectedCrew}
                        onChange={(e) => {
                            const crewRole = e.target.value;
                            setSelectedCrew(crewRole);
                            const selectedCrew = availableCrews.find(
                                (c) => c.role === crewRole,
                            );
                            setPrice(
                                selectedCrew
                                    ? parseFloat(selectedCrew.rate)
                                    : 0,
                            );
                        }}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select a crew</option>
                        {availableCrews.map((crew) => (
                            <option key={crew.id} value={crew.role}>
                                {crew.role}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Price</label>
                    <input
                        type="text"
                        value={formatCurrency(price)}
                        onChange={(e) =>
                            setPrice(
                                parseInt(e.target.value.replace(/\D/g, "")) ||
                                    0,
                            )
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={isSubmitDisabled}
                    >
                        Add Crew
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditExpenseManager = ({
    booking,
    accommodations,
    destinations,
    others,
    resources,
    listForNewItems,
}) => {
    const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
    const [isOthersModalOpen, setIsOthersModalOpen] = useState(false);
    const [isTransportationModalOpen, setIsTransportationModalOpen] =
        useState(false);
    const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
    const [deletedItems, setDeletedItems] = useState([]);

    const sortItems = (items) => {
        // Definisikan urutan kategori
        const categoryOrder = {
            Accommodation: 1,
            Destination: 2,
            Others: 3,
            Transport: 4,
            Resource: 5,
        };

        return [...items].sort((a, b) => {
            // Pertama sort berdasarkan kategori
            const categoryDiff =
                categoryOrder[a.category] - categoryOrder[b.category];
            if (categoryDiff !== 0) return categoryDiff;

            // Jika kategori sama, sort berdasarkan subCategory
            const subCategoryDiff = a.subCategory.localeCompare(b.subCategory);
            if (subCategoryDiff !== 0) return subCategoryDiff;

            // Jika subCategory sama, new items selalu di bawah
            const aIsNew = String(a.id).startsWith("new_");
            const bIsNew = String(b.id).startsWith("new_");
            if (aIsNew !== bIsNew) {
                return aIsNew ? 1 : -1; // New items go to bottom
            }

            // Jika keduanya item baru atau item lama, sort berdasarkan ID
            if (aIsNew && bIsNew) {
                // Untuk item baru, bandingkan timestamp
                return (
                    parseInt(a.id.split("_")[1]) - parseInt(b.id.split("_")[1])
                );
            }

            // Untuk item lama, bandingkan ID asli
            return parseInt(a.id) - parseInt(b.id);
        });
    };

    // ✅ CORRECTED: handleAddNewItem function
    const handleAddNewItem = (newItem) => {
        setItems((prevItems) => {
            const newId = `new_${Date.now()}`;
            let processedItem;

            if (newItem.destination_id) {
                // Destination activity
                processedItem = {
                    id: newId,
                    category: "Destination",
                    subCategory: newItem.destinationName,
                    description:
                        newItem.name || newItem.destination_activity.name,
                    unit: "Pax",
                    qty: newItem.qty,
                    rate: newItem.price,
                    amount: newItem.qty * newItem.price,
                    isDebt: newItem.is_debt === "1",
                    isPaid: false, // ✅ Default to false for new items
                    status: "new",
                    originalData: {
                        type: "destination",
                        destName: newItem.destinationName,
                        destination_id: newItem.destination_id,
                        isNewActivity: newItem.isNewActivity,
                        ...(newItem.isNewActivity
                            ? {}
                            : {
                                  destination_activity_id:
                                      newItem.destination_activity_id,
                              }),
                        activityName:
                            newItem.name || newItem.destination_activity.name,
                    },
                };
            } else {
                // Other types of items
                processedItem = {
                    ...newItem,
                    id: newId,
                    isPaid: false, // ✅ Default to false for new items
                    status: "new",
                };
            }

            const updatedItems = [...prevItems, processedItem];
            return sortItems(updatedItems);
        });
    };
    const [items, setItems] = useState(() => {
        // Accommodation items
        const accommodationItems = accommodations.reduce((acc, hotel) => {
            // Room items
            const roomItems = hotel.book_room.map((room) => ({
                id: room.id,
                category: "Accommodation",
                subCategory: hotel.hotel.name,
                description: room.room_hotel.room_name,
                unit: "No",
                qty: room.quantity,
                rate: room.subtotal / room.quantity,
                amount: room.subtotal,
                isDebt: hotel.is_debt === "1",
                isPaid: hotel.is_paid === "1", // ✅ Correct mapping
                debtPaymentId: hotel.debt_payment_id !== null,
                originalData: {
                    type: "room",
                    hotelId: hotel.id,
                    roomId: room.id,
                    isPaid: hotel.is_paid,
                },
            }));

            // Meal items
            const mealItems = (hotel.book_hotel_meal || []).map((meal) => ({
                id: `meal-${meal.id}`,
                category: "Accommodation",
                subCategory: hotel.hotel.name,
                description: `${meal.meals.charAt(0).toUpperCase() + meal.meals.slice(1)} Meal`,
                unit: "Pax",
                qty: meal.qty,
                rate: meal.price,
                amount: meal.qty * meal.price,
                isDebt: hotel.is_debt === "1",
                isPaid: hotel.is_paid === "1", // ✅ Correct mapping
                originalData: {
                    type: "meal",
                    hotelId: hotel.id,
                    mealId: meal.id,
                    mealType: meal.meals,
                    isPaid: hotel.is_paid,
                },
            }));

            acc.push(...roomItems, ...mealItems);
            return acc;
        }, []);

        // Sort accommodation items
        const sortedAccommodationItems = accommodationItems.sort((a, b) => {
            const hotelCompare = a.subCategory.localeCompare(b.subCategory);
            if (hotelCompare !== 0) return hotelCompare;

            if (
                a.originalData.type === "room" &&
                b.originalData.type === "meal"
            )
                return -1;
            if (
                a.originalData.type === "meal" &&
                b.originalData.type === "room"
            )
                return 1;

            if (
                a.originalData.type === "meal" &&
                b.originalData.type === "meal"
            ) {
                return a.originalData.mealType.localeCompare(
                    b.originalData.mealType,
                );
            }

            return 0;
        });

        const initialItems = [
            ...sortedAccommodationItems.map((item) => ({
                ...item,
                status: "unchanged",
            })),

            // Destination items
            ...Object.entries(destinations).flatMap(([destName, activities]) =>
                activities.map((activity) => ({
                    id: activity.id,
                    category: "Destination",
                    subCategory: destName,
                    description: activity.destination_activity.name,
                    unit: "Pax",
                    qty: activity.qty,
                    rate: activity.price,
                    amount: activity.qty * activity.price,
                    isDebt: activity.is_debt === "1",
                    isPaid: activity.status_paid === "paid", // ✅ Correct mapping
                    debtPaymentId: activity.debt_payment_id !== null,
                    status: "unchanged",
                    originalData: {
                        type: "destination",
                        destName,
                        destination_id: activity.destination_id,
                        destination_activity_id:
                            activity.destination_activity_id,
                        activityId: activity.id,
                    },
                })),
            ),

            // Others items
            ...others.map((item) => ({
                id: item.id,
                category: "Others",
                subCategory: "Additional",
                description: item.others_activity.name,
                unit: "Item",
                qty: item.qty,
                rate: item.price,
                amount: item.qty * item.price,
                isDebt: item.is_debt === "1",
                isPaid: item.status_paid === "paid", // ✅ Correct mapping
                debtPaymentId: item.debt_payment_id !== null,
                status: "unchanged",
                originalData: {
                    type: "other",
                    others_activity_id: item.others_activity.id,
                    itemId: item.id,
                },
            })),

            // Transport items
            ...resources.cars.map((car) => ({
                id: car.id,
                category: "Transport",
                subCategory: "Airport Transfer",
                description: car.car.name,
                unit: "Unit",
                qty: car.qty,
                rate: car.price,
                amount: car.qty * car.price,
                isDebt: car.is_debt === "1",
                isPaid: car.status_paid === "paid", // ✅ Correct mapping
                debtPaymentId: car.debt_payment_id !== null,
                status: "unchanged",
                originalData: {
                    type: "transport",
                    car_id: car.car.id,
                    carId: car.id,
                },
            })),

            // Crew items
            ...resources.crews.map((crew) => ({
                id: crew.id,
                category: "Resource",
                subCategory: "Crew",
                description: crew.crew_role.role,
                unit: "Person",
                qty: crew.qty,
                rate: crew.price,
                amount: crew.qty * crew.price,
                isDebt: crew.is_debt === "1",
                isPaid: crew.status_paid === "paid", // ✅ Correct mapping
                debtPaymentId: crew.debt_payment_id !== null,
                status: "unchanged",
                originalData: {
                    type: "crew",
                    crew_role_id: crew.crew_role.id,
                    crewId: crew.id,
                },
            })),
        ];

        return initialItems;
    });
    const handlePaidChange = (index, isPaid) => {
        setItems((prevItems) => {
            const newItems = [...prevItems];
            const targetItem = newItems[index];

            // If item is accommodation, update all items from the same hotel
            if (targetItem.category === "Accommodation") {
                const hotelId = targetItem.originalData.hotelId;
                return newItems.map((item) => {
                    if (
                        item.category === "Accommodation" &&
                        item.originalData.hotelId === hotelId
                    ) {
                        return {
                            ...item,
                            isPaid,
                            isDebt: isPaid ? false : item.isDebt, // ✅ Turn off pay later when paid is active
                            status:
                                item.status === "unchanged"
                                    ? "modified"
                                    : item.status,
                        };
                    }
                    return item;
                });
            }

            // For non-accommodation items, only update the specific item
            newItems[index] = {
                ...newItems[index],
                isPaid,
                isDebt: isPaid ? false : newItems[index].isDebt, // ✅ Turn off pay later when paid is active
                status:
                    newItems[index].status === "unchanged"
                        ? "modified"
                        : newItems[index].status,
            };
            return newItems;
        });
    };
    const handlePayLaterChange = (index, isDebt) => {
        setItems((prevItems) => {
            const newItems = [...prevItems];
            const targetItem = newItems[index];

            // If item is accommodation, update all items from the same hotel
            if (targetItem.category === "Accommodation") {
                const hotelId = targetItem.originalData.hotelId;
                return newItems.map((item) => {
                    if (
                        item.category === "Accommodation" &&
                        item.originalData.hotelId === hotelId
                    ) {
                        return {
                            ...item,
                            isDebt,
                            isPaid: isDebt ? false : item.isPaid, // ✅ Turn off paid when pay later is active
                            status:
                                item.status === "unchanged"
                                    ? "modified"
                                    : item.status,
                        };
                    }
                    return item;
                });
            }

            // For non-accommodation items, only update the specific item
            newItems[index] = {
                ...newItems[index],
                isDebt,
                isPaid: isDebt ? false : newItems[index].isPaid, // ✅ Turn off paid when pay later is active
                status:
                    newItems[index].status === "unchanged"
                        ? "modified"
                        : newItems[index].status,
            };
            return newItems;
        });
    };

    const handleEdit = (index, field, value) => {
        setItems((prevItems) => {
            const newItems = [...prevItems];
            const item = { ...newItems[index] };

            // Update field
            item[field] = value;

            // Recalculate amount
            item.amount = item.qty * item.rate;

            if (item.status === "unchanged") {
                item.status = "modified";
            }

            newItems[index] = item;
            return newItems;
        });
    };
    // ✅ CORRECTED: Summary calculation with proper Net Total
    const summaryTotals = useMemo(() => {
        const paidItems = items.filter((item) => item.isPaid);
        const payLaterItems = items.filter((item) => item.isDebt);
        const unpaidItems = items.filter(
            (item) => !item.isPaid && !item.isDebt,
        ); // ✅ Items that need immediate payment

        const totalAmount = items.reduce(
            (sum, item) => sum + parseInt(item.amount),
            0,
        );
        const paidAmount = paidItems.reduce(
            (sum, item) => sum + parseInt(item.amount),
            0,
        );
        const debtAmount = payLaterItems.reduce(
            (sum, item) => sum + parseInt(item.amount),
            0,
        );
        const unpaidAmount = unpaidItems.reduce(
            (sum, item) => sum + parseInt(item.amount),
            0,
        ); // ✅ Net Total

        return {
            totalAmount, // Total keseluruhan
            paidAmount, // Yang sudah dibayar
            debtAmount, // Yang ditunda (Pay Later)
            unpaidAmount, // ✅ Net Total = Belum dibayar & tidak hutang (perlu bayar sekarang)
            payLaterItemsCount: payLaterItems.length,
            paidItemsCount: paidItems.length,
            unpaidItemsCount: unpaidItems.length,
        };
    }, [items]);

    // ✅ CORRECTED: handleSubmit function with proper data structure
    const handleSubmit = () => {
        const formatDecimal = (num) => Number(num).toFixed(2);

        // Group visible items by category and status
        const itemsByStatus = {
            modified: [],
            new: [],
            deleted: [],
        };

        // Filter and organize items
        items.forEach((item) => {
            if (item.status === "modified" || item.status === "new") {
                itemsByStatus[item.status].push(item);
            }
        });

        // Group accommodations by hotel
        const groupedAccommodations = items
            .filter(
                (item) =>
                    item.category === "Accommodation" &&
                    item.status !== "deleted",
            )
            .reduce((acc, item) => {
                const hotelId = item.originalData.hotelId;
                if (!acc[hotelId]) {
                    acc[hotelId] = {
                        rooms: [],
                        meals: [],
                        isDebt: item.isDebt,
                        isPaid: item.isPaid, // ✅ Track isPaid separately
                    };
                }
                if (item.originalData.type === "room") {
                    acc[hotelId].rooms.push(item);
                } else {
                    acc[hotelId].meals.push(item);
                }
                return acc;
            }, {});

        // Group destinations
        const groupedDestinations = {
            modified: itemsByStatus.modified
                .filter((item) => item.category === "Destination")
                .reduce((acc, item) => {
                    const destName = item.subCategory;
                    if (!acc[destName]) {
                        acc[destName] = [];
                    }
                    acc[destName].push(item);
                    return acc;
                }, {}),

            new: itemsByStatus.new
                .filter((item) => item.category === "Destination")
                .reduce((acc, item) => {
                    const destName = item.subCategory;
                    if (!acc[destName]) {
                        acc[destName] = [];
                    }
                    acc[destName].push(item);
                    return acc;
                }, {}),
        };

        const groupedDeletedItems = {
            destinations: deletedItems
                .filter((item) => item.category === "Destination")
                .map((item) => item.id),
            others: deletedItems
                .filter((item) => item.category === "Others")
                .map((item) => item.id),
            cars: deletedItems
                .filter((item) => item.category === "Transport")
                .map((item) => item.id),
            crews: deletedItems
                .filter((item) => item.category === "Resource")
                .map((item) => item.id),
        };

        const submitData = {
            booking_id: booking.id,

            // ✅ FIXED: Accommodations with separate isPaid field
            accommodations: Object.entries(groupedAccommodations).map(
                ([hotelId, data]) => ({
                    hotel_id: parseInt(hotelId),
                    is_paid: data.isPaid ? "1" : "0", // ✅ Use isPaid directly
                    is_debt: data.isDebt ? "1" : "0",
                    rooms: data.rooms.map((room) => ({
                        id: room.originalData.roomId,
                        quantity: room.qty,
                        rate: parseInt(room.rate),
                    })),
                    meals: data.meals.map((meal) => ({
                        id: meal.originalData.mealId,
                        type: meal.originalData.mealType,
                        qty: meal.qty,
                        price: formatDecimal(meal.rate),
                    })),
                }),
            ),

            // ✅ FIXED: Destinations with status_paid field
            destinations: {
                deleted: groupedDeletedItems.destinations,

                modified: Object.entries(groupedDestinations.modified).flatMap(
                    ([destName, activities]) =>
                        activities.map((item) => ({
                            id: item.id,
                            destination_id: item.originalData.destination_id,
                            destination_activity_id:
                                item.originalData.destination_activity_id,
                            quantity: item.qty,
                            price: parseInt(item.rate),
                            is_debt: item.isDebt ? "1" : "0",
                            status_paid: item.isPaid ? "paid" : "unpaid", // ✅ Use isPaid
                        })),
                ),

                new: Object.entries(groupedDestinations.new).flatMap(
                    ([destName, activities]) =>
                        activities.map((item) => {
                            const isNewActivity =
                                item.originalData.isNewActivity;
                            return {
                                destination_id:
                                    item.originalData.destination_id,
                                ...(isNewActivity
                                    ? { name: item.description }
                                    : {
                                          destination_activity_id:
                                              item.originalData
                                                  .destination_activity_id,
                                      }),
                                quantity: item.qty,
                                price: parseInt(item.rate),
                                is_debt: item.isDebt ? "1" : "0",
                                status_paid: item.isPaid ? "paid" : "unpaid", // ✅ Use isPaid
                            };
                        }),
                ),
            },

            // ✅ FIXED: Others with status_paid field
            others: {
                deleted: groupedDeletedItems.others,
                modified: itemsByStatus.modified
                    .filter((item) => item.category === "Others")
                    .map((item) => ({
                        id: item.id,
                        others_activity_id:
                            item.originalData.others_activity_id,
                        quantity: item.qty,
                        price: parseInt(item.rate),
                        is_debt: item.isDebt ? "1" : "0",
                        status_paid: item.isPaid ? "paid" : "unpaid", // ✅ Use isPaid
                    })),

                new: itemsByStatus.new
                    .filter((item) => item.category === "Others")
                    .map((item) => {
                        const isNewActivity = item.originalData.isNewActivity;
                        return {
                            ...(isNewActivity
                                ? {}
                                : {
                                      others_activity_id:
                                          item.originalData.others_activity_id,
                                  }),
                            name: item.description,
                            quantity: item.qty,
                            price: parseInt(item.rate),
                            is_debt: item.isDebt ? "1" : "0",
                            status_paid: item.isPaid ? "paid" : "unpaid", // ✅ Use isPaid
                        };
                    }),
            },

            // ✅ FIXED: Resources with status_paid field
            resources: {
                cars: {
                    deleted: groupedDeletedItems.cars,
                    modified: itemsByStatus.modified
                        .filter((item) => item.category === "Transport")
                        .map((item) => ({
                            id: item.id,
                            car_id: item.originalData.car_id,
                            quantity: item.qty,
                            price: parseInt(item.rate),
                            is_debt: item.isDebt ? "1" : "0",
                            status_paid: item.isPaid ? "paid" : "unpaid", // ✅ Use isPaid
                        })),

                    new: itemsByStatus.new
                        .filter((item) => item.category === "Transport")
                        .map((item) => ({
                            car_id: item.originalData.car_id,
                            quantity: item.qty,
                            price: parseInt(item.rate),
                            is_debt: item.isDebt ? "1" : "0",
                            status_paid: item.isPaid ? "paid" : "unpaid", // ✅ Use isPaid
                        })),
                },

                crews: {
                    deleted: groupedDeletedItems.crews,
                    modified: itemsByStatus.modified
                        .filter((item) => item.category === "Resource")
                        .map((item) => ({
                            id: item.id,
                            crew_role_id: item.originalData.crew_role_id,
                            quantity: item.qty,
                            price: parseInt(item.rate),
                            is_debt: item.isDebt ? "1" : "0",
                            status_paid: item.isPaid ? "paid" : "unpaid", // ✅ Use isPaid
                        })),

                    new: itemsByStatus.new
                        .filter((item) => item.category === "Resource")
                        .map((item) => ({
                            crew_role_id: item.originalData.crew_role_id,
                            quantity: item.qty,
                            price: parseInt(item.rate),
                            is_debt: item.isDebt ? "1" : "0",
                            status_paid: item.isPaid ? "paid" : "unpaid", // ✅ Use isPaid
                        })),
                },
            },

            summary: {
                totalAmount: summaryTotals.totalAmount, // Total keseluruhan
                paidAmount: summaryTotals.paidAmount, // Yang sudah dibayar
                unpaidAmount: summaryTotals.unpaidAmount, // ✅ Net Total = Yang perlu dibayar sekarang
                debtAmount: summaryTotals.debtAmount, // Yang ditunda (Pay Later)
                paidItemsCount: summaryTotals.paidItemsCount,
                unpaidItemsCount: summaryTotals.unpaidItemsCount,
                payLaterItemsCount: summaryTotals.payLaterItemsCount,
            },
        };

        router.post(
            `/finance/expense-manager/${booking.id}/update`,
            submitData,
            {
                onBefore: () => {
                    Swal.fire({
                        title: "Processing...",
                        html: "Please wait while we process your expense.",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        },
                    });
                },
                onSuccess: () => {
                    Swal.fire({
                        title: "Success!",
                        text: "Expense has been successfully updated",
                        icon: "success",
                    }).then(() => {
                        router.visit(
                            `/finance/expense-manager/${booking.id}/edit`,
                        );
                    });
                },
                onError: (errors) => {
                    Swal.fire({
                        title: "Error!",
                        text: "There was a problem updating your expense.",
                        icon: "error",
                    });
                    console.error("Submission errors:", errors);
                },
                preserveState: true,
                preserveScroll: true,
            },
        );

        console.log("Data to submit:", submitData);
    };
    const handleDelete = (index) => {
        setItems((prevItems) => {
            const newItems = [...prevItems];
            const item = newItems[index];

            // If it's a new item, just remove it
            if (item.status === "new") {
                newItems.splice(index, 1);
            } else {
                // For existing items, remove from visible list and add to deleted list
                setDeletedItems((prevDeleted) => [...prevDeleted, item]);
                newItems.splice(index, 1);
            }

            return sortItems(newItems);
        });
    };
    return (
        <Authenticated>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <BookingInfo booking={booking} />
                <SummaryCards booking={booking} totals={summaryTotals} />
                <ExpenseTable
                    items={items}
                    onPayLaterChange={handlePayLaterChange}
                    onPaidChange={handlePaidChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
                <div className="mt-6 flex justify-between items-center">
                    <div className="relative inline-block text-left">
                        <div
                            id="add-item-dropdown"
                            className="hidden absolute bottom-full left-0 mb-2 w-56 origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="menu-button"
                            tabIndex="-1"
                        >
                            <div className="py-1 rounded-md" role="none">
                                <button
                                    onClick={() => {
                                        setIsDestinationModalOpen(true);
                                        document
                                            .getElementById("add-item-dropdown")
                                            .classList.add("hidden");
                                    }}
                                    className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 hover:rounded-t-md"
                                    role="menuitem"
                                    tabIndex="-1"
                                >
                                    Destination Activity
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOthersModalOpen(true);
                                        document
                                            .getElementById("add-item-dropdown")
                                            .classList.add("hidden");
                                    }}
                                    className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                    role="menuitem"
                                    tabIndex="-1"
                                >
                                    Others Item
                                </button>
                                <button
                                    onClick={() => {
                                        setIsTransportationModalOpen(true);
                                        document
                                            .getElementById("add-item-dropdown")
                                            .classList.add("hidden");
                                    }}
                                    className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                    role="menuitem"
                                    tabIndex="-1"
                                >
                                    Transportation
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCrewModalOpen(true);
                                        document
                                            .getElementById("add-item-dropdown")
                                            .classList.add("hidden");
                                    }}
                                    className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 hover:rounded-b-md"
                                    role="menuitem"
                                    tabIndex="-1"
                                >
                                    Crew
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                            id="menu-button"
                            aria-expanded="true"
                            aria-haspopup="true"
                            onClick={() => {
                                const dropdown =
                                    document.getElementById(
                                        "add-item-dropdown",
                                    );
                                dropdown.classList.toggle("hidden");
                            }}
                        >
                            Add New Item
                            <svg
                                className="-mr-1 h-5 w-5 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Submit Changes
                    </button>
                </div>
                {/* Modal-modal */}
                <AddDestinationModal
                    isOpen={isDestinationModalOpen}
                    onClose={() => setIsDestinationModalOpen(false)}
                    onAddActivity={handleAddNewItem}
                    listForNewItems={listForNewItems.destinations}
                    existingItems={items.filter(
                        (item) => item.category === "Destination",
                    )}
                />
                <AddOthersModal
                    isOpen={isOthersModalOpen}
                    onClose={() => setIsOthersModalOpen(false)}
                    onAddItem={handleAddNewItem}
                    listForNewItems={listForNewItems.others}
                    existingItems={items.filter(
                        (item) => item.category === "Others",
                    )}
                />
                <AddTransportationModal
                    isOpen={isTransportationModalOpen}
                    onClose={() => setIsTransportationModalOpen(false)}
                    onAddItem={handleAddNewItem}
                    listForNewItems={listForNewItems.cars}
                    existingItems={items.filter(
                        (item) => item.category === "Transport",
                    )}
                />
                <AddCrewModal
                    isOpen={isCrewModalOpen}
                    onClose={() => setIsCrewModalOpen(false)}
                    onAddItem={handleAddNewItem}
                    listForNewItems={listForNewItems.crews}
                    existingItems={items.filter(
                        (item) => item.category === "Resource",
                    )}
                />
            </div>
        </Authenticated>
    );
};

export default EditExpenseManager;
