import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import Main from '@/Layouts/Main';

export default function Index({ data, flash = {} }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [flashMessage, setFlashMessage] = useState(flash?.message || '');
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        short_url: data.new_short_url
    });
    const [errors, setErrors] = useState({});
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (flash?.message) {
            setFlashMessage(flash.message);
            const timer = setTimeout(() => {
                setFlashMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        router.post('/short-link/store', formData, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setIsSubmitting(false);
                setFormData({
                    title: '',
                    url: '',
                    short_url: data.new_short_url
                });
                setErrors({});
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors);
            }
        });
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setFormData({
            title: item.title,
            url: item.file,
            short_url: item.short_url
        });
        setIsEditDialogOpen(true);
        setOpenDropdownId(null);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        router.put(`/short-link/${selectedItem.id}`, formData, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setIsSubmitting(false);
                setSelectedItem(null);
                setFormData({
                    title: '',
                    url: '',
                    short_url: data.new_short_url
                });
                setErrors({});
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors);
            }
        });
    };

    const handleDelete = (item) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
        setOpenDropdownId(null);
    };

    const confirmDelete = () => {
        setIsDeleting(true);
        router.delete(`/short-link/${selectedItem.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setIsDeleting(false);
                setSelectedItem(null);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            setFlashMessage('Link copied to clipboard!');
            setOpenDropdownId(null);
            setTimeout(() => setFlashMessage(''), 3000);
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const renderDialog = (isOpen, setIsOpen, title, submitHandler, submitText = 'Submit') => {
        if (!isOpen) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                            disabled={isSubmitting}
                        >
                            ×
                        </button>
                    </div>
                    
                    <form onSubmit={submitHandler} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter title"
                                required
                                disabled={isSubmitting}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL/File
                            </label>
                            <input
                                type="text"
                                name="url"
                                value={formData.url}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.url ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter URL or file path"
                                required
                                disabled={isSubmitting}
                            />
                            {errors.url && (
                                <p className="mt-1 text-sm text-red-500">{errors.url}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Short URL
                            </label>
                            <input
                                type="text"
                                name="short_url"
                                value={formData.short_url}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.short_url ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Short URL"
                                required
                                disabled="disabled"
                            />
                            {errors.short_url && (
                                <p className="mt-1 text-sm text-red-500">{errors.short_url}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : submitText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <Main>
            <div>
                {flashMessage && (
                    <div className="fixed bottom-10 right-15 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out">
                        {flashMessage}
                    </div>
                )}

                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Short Links</h1>
                    <button 
                        onClick={() => setIsDialogOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Make Short Link
                    </button>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full table-fixed">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
                                <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.link.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 truncate" title={item.title}>
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <a 
                                            href={`https://jv-to.com/${item.short_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800"
                                            title={`https://jv-to.com/${item.short_url}`}
                                        >
                                            {`https://jv-to.com/${item.short_url}`}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 relative">
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={() => toggleDropdown(item.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                                </svg>
                                            </button>
                                            {openDropdownId === item.id && (
                                                <div 
                                                    ref={dropdownRef}
                                                    className="absolute right-0 mt-8 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                                                >
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => copyToClipboard(`https://jv-to.com/${item.short_url}`)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                Copy Link
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
    
                    {/* Create Dialog */}
                    {renderDialog(
                        isDialogOpen,
                        setIsDialogOpen,
                        'Create New Short Link',
                        handleSubmit,
                        'Create'
                    )}
    
                    {/* Edit Dialog */}
                    {renderDialog(
                        isEditDialogOpen,
                        setIsEditDialogOpen,
                        'Edit Short Link',
                        handleUpdate,
                        'Update'
                    )}
    
                    {/* Delete Confirmation Dialog */}
                    {isDeleteDialogOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                                <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                                <p className="text-gray-600 mb-6">Are you sure you want to delete this short link?</p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setIsDeleteDialogOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 flex items-center"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Deleting...
                                            </>
                                        ) : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Main>
        );
    }