import React, { useState } from 'react';
import { Calendar, MapPin, Users, Coffee, Moon, Bed, ChevronDown, ChevronUp, FileText, Upload, X, Download,ChevronLeft, ChevronRight, Edit, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal, {Toast} from '@/utils/swal';


const Accommodation = ({hotelData,initialFilters,tab}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dragActive, setDragActive] = useState(false);  
  const [dateRange, setDateRange] = useState({
    start: initialFilters.start || '',
    end: initialFilters.end || ''
  });
  
  const handleFilter = () => {
    
    router.get(`/vendor/accommodation/${hotelData.hotel.id}`, {
      start: dateRange.start,
      end: dateRange.end
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const handleViewAll = () => {
    
    router.get(`/vendor/accommodation/${hotelData.hotel.id}`,{}, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const handleChangeTab = (tab) => {
    
    router.get(`/vendor/accommodation/${hotelData.hotel.id}`,{
      tab : tab
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    router.get(`/vendor/accommodation/${hotelData.hotel.id}`, {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const handleDownloadPDF = () => {
    const params = new URLSearchParams({
      tab: tab,
      start: dateRange.start || '',
      end: dateRange.end || '',
      download: true
    });
    
    
    window.location.href = `/vendor/accommodation/${hotelData.hotel.id}?${params.toString()}`;
  };  // Date Range Filters Component
  const DateRangeFilters = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
    <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium text-gray-900">Filter by Date Range</h3>
    <button
        onClick={() => handleDownloadPDF()}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
        <FileText className="w-4 h-4 mr-2" />
        Download PDF
    </button>
    </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        {(dateRange.start || dateRange.end) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Clear Filters
          </button>
        )}
        <button
          onClick={handleFilter}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
  const RoomCard = ({ room, onUpdate }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
      room_name: room.room_name || '',
      rate: room.rate || 0,
      photos: room.room_photo
    });
    const [newPhotos, setNewPhotos] = useState([]);
    const [errors, setErrors] = useState({});
    const [deletedPhotos, setDeletedPhotos] = useState([]);
    
    const photos = room.room_photo;
  
    // Photo Navigation Functions
    const nextPhoto = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };
  
    const prevPhoto = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };
    
    const handleRemoveNewPhoto = (index) => {
      setNewPhotos(prev => prev.filter((_, i) => i !== index));
    };
  
    const handleRemovePhoto = (index) => {
      const photoToDelete = formData.photos[index];
      setDeletedPhotos(prev => [...prev, photoToDelete]);
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }));
    };
  
    const handleMovePhoto = (index, direction) => {
      const newPhotos = [...formData.photos];
      const temp = newPhotos[index];
      newPhotos[index] = newPhotos[index + direction];
      newPhotos[index + direction] = temp;
      setFormData(prev => ({ ...prev, photos: newPhotos }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('room_name', formData.room_name);
        formDataToSend.append('rate', formData.rate);
        formDataToSend.append('id', room.id);
        formDataToSend.append('hotel_id', room.hotel_id);
    
        // Handle new photos
        for (let i = 0; i < newPhotos.length; i++) {
          try {
            const base64Photo = newPhotos[i];
            const base64Data = base64Photo.split(',')[1];
            
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
              const slice = byteCharacters.slice(offset, offset + 512);
              const byteNumbers = new Array(slice.length);
              for (let j = 0; j < slice.length; j++) {
                byteNumbers[j] = slice.charCodeAt(j);
              }
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            
            const blob = new Blob(byteArrays, { type: 'image/jpeg' });
            const file = new File([blob], `photo-${i + 1}.jpg`, { type: 'image/jpeg' });
            
            formDataToSend.append('new_photos[]', file);
          } catch (error) {
            console.error(`Error processing photo ${i + 1}:`, error);
            throw new Error(`Failed to process photo ${i + 1}`);
          }
        }
    
        // Add deleted photos if any
        if (deletedPhotos.length > 0) {
          deletedPhotos.forEach(photoId => {
            formDataToSend.append('deleted_photos[]', photoId.id);
          });
        }
    
        // Use fetch with credentials
        const response = await fetch(hotelData.url_update, {
          method: 'POST',
          body: formDataToSend,
          credentials: 'include', // Important for maintaining session
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          }
        });
    
        const data = await response.json();
    
        if (data.success) {
          // Close modal and reset states
          setIsEditModalOpen(false);
          setNewPhotos([]);
          setDeletedPhotos([]);
    
          // Show success alert
          Toast.fire({
              icon: 'success',
              title: 'Room updated successfully!'
          });

          router.get(`/vendor/accommodation/${hotelData.hotel.id}?tab=rooms`,{}, {
            preserveState: true,
            preserveScroll: true,
            replace: true
          });
          
        } else {
          throw new Error(data.message || 'Update failed');
        }
    
      } catch (error) {
        console.error('Error during submission:', error);
        setErrors({
          submit: error.message || 'Failed to update room. Please try again.'
        });
        alert('Failed to update room: ' + error.message);
      }
    };
    // Updated photo upload handler
    const handlePhotoUpload = (e) => {
      const files = Array.from(e.target.files);
      console.log('Files selected:', files.length);
      
      files.forEach((file, index) => {
        console.log(`Processing file ${index + 1}:`, {
          name: file.name,
          type: file.type,
          size: file.size
        });
    
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({
            ...prev,
            photos: `File ${file.name} is not an image`
          }));
          return;
        }
    
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({
            ...prev,
            photos: `File ${file.name} is too large (max 5MB)`
          }));
          return;
        }
    
        const reader = new FileReader();
        
        reader.onloadstart = () => {
          console.log(`Started reading file: ${file.name}`);
        };
        
        reader.onload = () => {
          console.log(`Successfully read file: ${file.name}`);
          setNewPhotos(prev => [...prev, reader.result]);
        };
        
        reader.onerror = () => {
          console.error(`Error reading file: ${file.name}`, reader.error);
          setErrors(prev => ({
            ...prev,
            photos: `Error reading file: ${file.name}`
          }));
        };
    
        reader.readAsDataURL(file);
      });
    };    
    
    const EditModal = () => (
      <Dialog open={isEditModalOpen} onOpenChange={() => setIsEditModalOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Edit Room Details</DialogTitle>
          </DialogHeader>
  
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Name
              </label>
              <input
                type="text"
                value={formData.room_name}
                onChange={(e) => setFormData(prev => ({ ...prev, room_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.room_name && (
                <p className="text-red-500 text-sm mt-1">{errors.room_name}</p>
              )}
            </div>
  
            {/* Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate (per night)
              </label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.rate && (
                <p className="text-red-500 text-sm mt-1">{errors.rate}</p>
              )}
            </div>
  
            {/* Photos Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Photos
              </label>
              
              {/* Existing Photos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden">
                    <img
                      src={hotelData.core_url+'/storage/'+photo.photo}
                      alt={`Room ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(index, -1)}
                          className="p-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4 text-white" />
                        </button>
                      )}
                      {index < formData.photos.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(index, 1)}
                          className="p-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4 text-white" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="p-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
  
                {/* New Photos Preview */}
                {newPhotos.map((photo, index) => (
                  <div key={`new-${index}`} className="relative group rounded-lg overflow-hidden">
                    <img
                      src={photo}
                      alt={`New photo ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewPhoto(index)}
                        className="p-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      New
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Upload Button */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Drop photos here or click to upload</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
              {errors.photos && (
                <p className="text-red-500 text-sm mt-1">{errors.photos}</p>
              )}
            </div>
  
            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
          {/* Image Section with Navigation */}
          <div className="relative h-48 overflow-hidden bg-gray-200 group">
            {/* Current Image */}
            <img
              src={hotelData.core_url+'/storage/'+photos[currentPhotoIndex]?.photo}
              alt={`${room.room_name} view ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
            />
  
            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
  
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
  
            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {currentPhotoIndex + 1} / {photos.length}
              </div>
            )}
  
            {/* Edit Button */}
            <button 
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
              onClick={(e) => {
                e.preventDefault();
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="w-5 h-5" />
            </button>
  
            {/* Photo Indicators */}
            {photos.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentPhotoIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentPhotoIndex 
                        ? 'bg-white scale-110' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
  
          {/* Content Section */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.room_name}</h3>
            
            {/* Price */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {room.rate.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">per night</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Edit Modal */}
        <EditModal />
      </>
    );
  };
  const RoomsSection = () => {
    const rooms = hotelData?.hotel?.room_hotel || [];
    
    if (rooms.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          No rooms available
        </div>
      );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {rooms.map((room, index) => (
            <RoomCard key={index} room={room} />
          ))}
        </div>
      );
    };      
  // Component for the hero banner section
  const HeroBanner = () => (
    <div 
      className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg shadow-lg mb-8 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://javavolcano-touroperator.com/assets/img/hotels/${hotelData.hotel.banner}')`
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-6 md:px-12 pb-8 md:pb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          {hotelData.hotel.name}
        </h1>
        <div className="flex items-center text-white/90">
          <MapPin className="w-5 h-5 mr-2 drop-shadow" />
          <a href={hotelData.hotel.map_url} 
             target="_blank" 
             rel="noopener noreferrer"
             className="hover:underline transition-all duration-200 drop-shadow"
          >
            View on Maps
          </a>
        </div>
      </div>
    </div>
  );

  // Tab navigation component
  const TabNavigation = () => (
    <nav className="flex space-x-1 overflow-x-auto scrollbar-hide mb-8 border-b border-gray-200">
      {['overview','schedule','rooms','meals','documents'].map((val) => (
        <button
          key={val}
          onClick={() => handleChangeTab(val)}
          className={`
            px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200
            ${tab === val 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
          `}
        >
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </button>
      ))}
    </nav>
  );
  const calculateGrandTotal = () => {
    if (!hotelData?.schedule) return 0;
    
    return hotelData.schedule.reduce((total, booking) => {
      const totalMeals = (booking.meals || []).reduce((sum, meal) => 
        sum + (parseFloat(meal.subtotal) || 0), 0);
      const totalRooms = (booking.rooms || []).reduce((sum, room) => 
        sum + (room.subtotal || 0), 0);
      return total + totalMeals + totalRooms;
    }, 0);
  };
  
  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log("File upload:", e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file upload
      console.log("File upload:", e.target.files[0]);
    }
  };

  // ... Previous HeroBanner and TabNavigation components ...

  // Document Card Component
  const DocumentCard = ({ document }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{document.filename}</h3>
              <p className="text-sm text-gray-500">{document.size}</p>
              <p className="text-xs text-gray-400">Uploaded on {document.uploaded_at}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Documents Section Component
  const DocumentsSection = () => {
    const documents = hotelData?.hotel?.document || [];
    
    return (
    <div className="space-y-6">
      {/* Upload area */}
      <div 
        className={`
          border-2 border-dashed rounded-lg p-8
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          transition-colors duration-200
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop your files here, or</p>
          <label className="cursor-pointer">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Browse Files
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileInput}
              multiple
            />
          </label>
        </div>
      </div>

      {/* Documents list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hotelData.document.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
  }
  const ScheduleSection = () => {
    const grandTotal = calculateGrandTotal();
    
    return (
      <div className="space-y-6">
        {
          !hotelData.isBookingId && (
            <DateRangeFilters />        
          )
        }
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ScheduleTable />
        </div>
        
        {
          !hotelData.isBookingId ? (
            <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
              <div className="text-blue-900">
                <h3 className="text-lg font-semibold">Grand Total</h3>
                <p className="text-sm">Total from all bookings</p>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                Rp {grandTotal.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-lg p-4 flex justify-center items-center">
              <button onClick={() => handleViewAll()} className="bg-blue-600 hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-150 flex items-center gap-2">View All Data</button>
            </div>
          )
        }

      </div>
    );
  };


 

  // Meals section component
  const MealsSection = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
      lunch_rate: hotelData.hotel.lunch_rate,
      dinner_rate: hotelData.hotel.dinner_rate
    });
  
    const handleSubmit = (e) => {
      e.preventDefault();
      
      router.post('/vendor/accommodation/update-meals/'+hotelData.hotel.id, {
        lunch_rate: formData.lunch_rate,
        dinner_rate: formData.dinner_rate,
        id: hotelData.hotel.id,
      }, {
        onSuccess: () => {
          setIsEditModalOpen(false);
          toast.success('Meal rates updated successfully!');
        },
        onError: (errors) => {
          toast.error('Failed to update meal rates: ' + Object.values(errors).join(', '));
        },
        preserveState: true,
        preserveScroll: true,
      });
    };

    const EditModal = () => (
      <Dialog open={isEditModalOpen} onOpenChange={() => setIsEditModalOpen(false)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Meal Rates</DialogTitle>
          </DialogHeader>
  
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lunch Rate (per person)
              </label>
              <input
                type="number"
                value={formData.lunch_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, lunch_rate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dinner Rate (per person)
              </label>
              <input
                type="number"
                value={formData.dinner_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, dinner_rate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
  
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  
    return (
      <>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Coffee className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">Lunch</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit Rates
              </button>
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-2">
              Rp {hotelData.hotel.lunch_rate.toLocaleString()}
            </p>
            <p className="text-gray-600">Per person</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Moon className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">Dinner</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit Rates
              </button>
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-2">
              Rp {hotelData.hotel.dinner_rate.toLocaleString()}
            </p>
            <p className="text-gray-600">Per person</p>
          </div>
        </div>
        <EditModal />
      </>
    );
  };
  const ScheduleTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check In
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participants
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Meals
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hotelData.schedule.map((booking, index) => {
            const totalMeals = booking.meals.reduce((sum, meal) => sum + parseFloat(meal.subtotal), 0);
            const totalRooms = booking.rooms.reduce((sum, room) => sum + room.subtotal, 0);
            const grandTotal = totalMeals + totalRooms;
            
            return (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.check_in}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.rooms.map(room => `${room.quantity}x ${room.room_name}`).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.participants}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.meals.length > 0 
                      ? booking.meals.map(meal => 
                          `${meal.meals} (${meal.quantity}x)`
                        ).join(', ')
                      : '-'
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Rp {grandTotal.toLocaleString()}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  // Content sections
  const TabContent = () => {
    switch (tab) {
      case 'rooms':
        return <RoomsSection/>
    case 'schedule':
        return <ScheduleSection />;
      case 'documents':
        return <DocumentsSection />;
      case 'meals':
        return <MealsSection />;
      default:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">About {hotelData.hotel.name}</h2>
              <p className="text-gray-600">
                {hotelData.hotel.address}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Active Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{hotelData.schedule.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-blue-600">{hotelData.hotel.room_hotel.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Document</p>
                  <p className="text-2xl font-bold text-blue-600">{hotelData.document.length}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Main>
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto">
        <HeroBanner />
        <TabNavigation />
        <main className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <TabContent />
        </main>
      </div>
    </div>
    </Main>
  );
};

export default Accommodation;