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
        description: "Explore Java's most breathtaking volcanoes, including Mount Bromo and Ijen with Java Volcano Tour Operator.",
        thumbnail: '',
        pdf: '',
        slug: ''
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
      
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description || '');
      form.append('slug', formData.slug);
      
      if (formData.thumbnail instanceof File) {
          form.append('thumbnail', formData.thumbnail);
      }
      
      if (formData.pdf instanceof File) {
          form.append('pdf', formData.pdf);
      }
      // console.log(formData);
      
      router.post('/generator/flipbook/store', form, {
          forceFormData: true,
          onSuccess: () => {
              setIsDialogOpen(false);
              setIsSubmitting(false);
              setFormData({
                  title: '',
                  description: '',
                  thumbnail: '',
                  pdf: '',
                  slug: ''
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
          description: item.description || '',
          thumbnail: item.thumbnail || '',
          pdf: item.pdf,
          slug: item.slug
      });
      setIsEditDialogOpen(true);
      setOpenDropdownId(null);
  };

  const handleUpdate = (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      const form = new FormData();
      form.append('_method', 'PUT');
      form.append('title', formData.title);
      form.append('description', formData.description || '');
      form.append('slug', formData.slug);
      
      if (formData.thumbnail instanceof File) {
          form.append('thumbnail', formData.thumbnail);
      }
      
      if (formData.pdf instanceof File) {
          form.append('pdf', formData.pdf);
      }
      
      router.post(`/generator/flipbook/${selectedItem.id}`, form, {
          forceFormData: true,
          onSuccess: () => {
              setIsEditDialogOpen(false);
              setIsSubmitting(false);
              setSelectedItem(null);
              setFormData({
                  title: '',
                  description: '',
                  thumbnail: '',
                  pdf: '',
                  slug: ''
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
        router.delete(`/generator/flipbook/${selectedItem.id}`, {
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

    const copyToClipboard = (slug) => {
        navigator.clipboard.writeText(`https://jv-to.com/flip/`+slug).then(() => {
            setFlashMessage('Link copied to clipboard!');
            setOpenDropdownId(null);
            setTimeout(() => setFlashMessage(''), 3000);
        });
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/-+/g, '-')      // Replace multiple - with single -
            .trim();                  // Trim - from start and end
    };

    const handleChange = (e) => {
      const { name, type } = e.target;
  
      if (type === 'file') {
          const file = e.target.files[0];
          if (file) {
              // Update formData dengan File object
              setFormData(prev => ({
                  ...prev,
                  [name]: file
              }));
  
              // Reset error jika ada
              if (errors[name]) {
                  setErrors(prev => ({
                      ...prev,
                      [name]: ''
                  }));
              }
          }
      } else if (name === 'title') {
          const value = e.target.value;
          // Auto-generate slug when title changes
          setFormData(prev => ({
              ...prev,
              title: value,
              slug: generateSlug(value)
          }));
      } else {
          setFormData(prev => ({
              ...prev,
              [name]: e.target.value
          }));
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
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter description"
                                rows="3"
                                disabled={isSubmitting}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PDF File
                            </label>
                            <input
                                type="file"
                                name="pdf"
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.pdf ? 'border-red-500' : 'border-gray-300'
                                }`}
                                accept=".pdf"
                                disabled={isSubmitting}
                            />
                            {errors.pdf && (
                                <p className="mt-1 text-sm text-red-500">{errors.pdf}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thumbnail (Optional)
                            </label>
                            <input
                                type="file"
                                name="thumbnail"
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.thumbnail ? 'border-red-500' : 'border-gray-300'
                                }`}
                                accept="image/*"
                                disabled={isSubmitting}
                            />
                            {errors.thumbnail && (
                                <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.slug ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Slug will auto-generate from title"
                                required
                                disabled={isSubmitting}
                            />
                            {errors.slug && (
                                <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
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
    const renderEditDialog = (isOpen, setIsOpen, title, submitHandler) => {
      if (!isOpen) return null;
      
      return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Edit Flipbook</h2>
                      <button 
                          onClick={() => setIsOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
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
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  errors.title ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Enter title"
                          />
                          {errors.title && (
                              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                          )}
                      </div>
  
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                          </label>
                          <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  errors.description ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Enter description"
                              rows="3"
                          />
                          {errors.description && (
                              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                          )}
                      </div>
  
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              PDF File
                          </label>
                          {selectedItem?.pdf && (
                              <div className="mb-2 text-sm">
                                  <a 
                                      href={`/storage/flipbooks/pdf/${selectedItem.pdf}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View Current PDF
                                  </a>
                              </div>
                          )}
                          <div className={`relative ${
                              errors.pdf ? 'border-red-500' : 'border-gray-300'
                          }`}>
                              <input
                                  type="file"
                                  name="pdf"
                                  onChange={handleChange}
                                  className="sr-only"
                                  accept=".pdf"
                                  id="pdf-upload-edit"
                              />
                              <label
                                  htmlFor="pdf-upload-edit"
                                  className="cursor-pointer w-full px-3 py-2 border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center"
                              >
                                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm mr-2">
                                      Choose New File
                                  </span>
                                  <span className="text-gray-500 text-sm truncate">
                                      {formData.pdf instanceof File ? formData.pdf.name : 'No file chosen'}
                                  </span>
                              </label>
                          </div>
                          {errors.pdf && (
                              <p className="mt-1 text-sm text-red-500">{errors.pdf}</p>
                          )}
                      </div>
  
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              Thumbnail (Optional)
                          </label>
                          {selectedItem?.thumbnail && (
                              <div className="mb-2 text-sm">
                                  <a 
                                      href={`/storage/flipbooks/thumbnails/${selectedItem.thumbnail}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View Current Thumbnail
                                  </a>
                              </div>
                          )}
                          <div className={`relative ${
                              errors.thumbnail ? 'border-red-500' : 'border-gray-300'
                          }`}>
                              <input
                                  type="file"
                                  name="thumbnail"
                                  onChange={handleChange}
                                  className="sr-only"
                                  accept="image/*"
                                  id="thumbnail-upload-edit"
                              />
                              <label
                                  htmlFor="thumbnail-upload-edit"
                                  className="cursor-pointer w-full px-3 py-2 border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center"
                              >
                                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm mr-2">
                                      Choose New File
                                  </span>
                                  <span className="text-gray-500 text-sm truncate">
                                      {formData.thumbnail instanceof File ? formData.thumbnail.name : 'No file chosen'}
                                  </span>
                              </label>
                          </div>
                          {errors.thumbnail && (
                              <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>
                          )}
                      </div>
  
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              Slug
                          </label>
                          <input
                              type="text"
                              name="slug"
                              value={formData.slug}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  errors.slug ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="URL slug for the flipbook"
                              readOnly
                          />
                          {errors.slug && (
                              <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
                          )}
                      </div>
  
                      <div className="flex justify-end gap-2 pt-4 border-t">
                          <button
                              type="button"
                              onClick={() => setIsOpen(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                              Cancel
                          </button>
                          <button
                              type="submit"
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              disabled={isSubmitting}
                          >
                              {isSubmitting ? (
                                  <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Processing...
                                  </>
                              ) : 'Update'}
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
                    <h1 className="text-2xl font-bold">Flipbooks</h1>
                    <button 
                        onClick={() => setIsDialogOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Add Flipbook
                    </button>
                </div>

                {/* Table Section */}
                <div className="border rounded-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF</th>
                                <th className="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.flipbook.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 truncate" title={item.title}>
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <a 
                                            href={`https://jv-to.com/flip/`+item.slug}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            {`https://jv-to.com/flip/`+item.slug}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="flex justify-center relative">
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
                                                            onClick={() => copyToClipboard(item.slug)}
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
                    'Create New Flipbook',
                    handleSubmit,
                    'Create'
                )}

                {/* Edit Dialog */}
                {renderEditDialog(
                    isEditDialogOpen,
                    setIsEditDialogOpen,
                    'Edit Flipbook',
                    handleUpdate,
                    'Update'
                )}

                {/* Delete Confirmation Dialog */}
                {isDeleteDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this flipbook?</p>
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