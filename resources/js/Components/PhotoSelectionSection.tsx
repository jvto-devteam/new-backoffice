// Perbaikan pada komponen PhotoSelectionSection.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Trash2, Search, Image, UploadCloud, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Main Photo Selection Component
const PhotoSelectionSection = ({ 
  packageInfo, 
  setPackageInfo, 
  setFormStatus, 
  destinations = [], // Default empty array untuk mencegah error
  photosByDestination = {}, // Default empty object untuk mencegah error
  type // 'cover' or 'gallery'
}) => {
  const [photoMode, setPhotoMode] = useState('library'); // 'library' or 'upload'
  const [selectedDestination, setSelectedDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDestination, setUploadDestination] = useState('');
  
  
  // Photos filtered by destination and search query
  const filteredPhotos = selectedDestination && photosByDestination && photosByDestination[selectedDestination] 
    ? photosByDestination[selectedDestination].filter(photo => 
        photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (photo.alt_text && photo.alt_text.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  // Check if photo is already selected (cover or gallery)
  const isPhotoSelected = (photoId) => {
    if (type === 'cover' && packageInfo.coverPhoto && packageInfo.coverPhoto.id === photoId) {
      return true;
    } else if (type === 'gallery') {
      return packageInfo.otherPhotos.some(photo => photo.id === photoId);
    }
    return false;
  };
  
  // Handler untuk memilih foto dari library
  const handleSelectPhoto = (photo) => {
    if (!photo) return;
    
    if (type === 'cover') {
      // For cover, replace current cover photo
      setPackageInfo({
        ...packageInfo,
        coverPhoto: {
          id: photo.id,
          photo_id: photo.id, // Add photo_id property that matches the library photo id
          preview: photo.url,
          caption: photo.caption,
          alt_text: photo.alt_text || '',
          destinationId: selectedDestination,
          isFromLibrary: true
        }
      });
    } else {
      // For gallery, check if not already in gallery
      if (!packageInfo.otherPhotos.some(p => p.id === photo.id)) {
        setPackageInfo({
          ...packageInfo,
          otherPhotos: [
            ...packageInfo.otherPhotos,
            {
              id: photo.id,
              photo_id: photo.id, // Add photo_id property that matches the library photo id
              preview: photo.url,
              caption: photo.caption,
              alt_text: photo.alt_text || '',
              destinationId: selectedDestination,
              isFromLibrary: true
            }
          ]
        });
      }
    }
    setFormStatus({ ...formStatus, isDirty: true });
  };
  
  // Update the handlePhotoUpload function in PhotoSelectionSection.jsx
  const handlePhotoUpload = (e) => {
    const files = e.target.files;
    if (!files) return;
  
    const file = files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const result = e.target?.result;
      
      if (type === 'cover') {
        setPackageInfo({
          ...packageInfo,
          coverPhoto: {
            preview: result,
            photo_id: null, // Explicitly set photo_id to null for manually uploaded photos
            caption: '',
            alt_text: '',
            destinationId: uploadDestination,
            isFromLibrary: false
          }
        });
      } else {
        setPackageInfo({
          ...packageInfo,
          otherPhotos: [
            ...packageInfo.otherPhotos,
            {
              preview: result,
              photo_id: null, // Explicitly set photo_id to null for manually uploaded photos
              caption: '',
              alt_text: '',
              destinationId: uploadDestination,
              isFromLibrary: false
            }
          ]
        });
      }
      setFormStatus({ ...formStatus, isDirty: true });
    };
  
    reader.readAsDataURL(file);
  };
  
  // Update photo caption
  const updatePhotoCaption = (index, caption) => {
    if (type === 'cover' && packageInfo.coverPhoto) {
      setPackageInfo({
        ...packageInfo,
        coverPhoto: {
          ...packageInfo.coverPhoto,
          caption
        }
      });
    } else {
      const newPhotos = [...packageInfo.otherPhotos];
      newPhotos[index].caption = caption;
      setPackageInfo({
        ...packageInfo,
        otherPhotos: newPhotos
      });
    }
    setFormStatus({ ...formStatus, isDirty: true });
  };

  // Update photo alt text
  const updatePhotoAltText = (index, alt_text) => {
    if (type === 'cover' && packageInfo.coverPhoto) {
      setPackageInfo({
        ...packageInfo,
        coverPhoto: {
          ...packageInfo.coverPhoto,
          alt_text
        }
      });
    } else {
      const newPhotos = [...packageInfo.otherPhotos];
      newPhotos[index].alt_text = alt_text;
      setPackageInfo({
        ...packageInfo,
        otherPhotos: newPhotos
      });
    }
    setFormStatus({ ...formStatus, isDirty: true });
  };
  
  // Update photo destination
  const updatePhotoDestination = (index, destinationId) => {
    if (type === 'cover' && packageInfo.coverPhoto) {
      setPackageInfo({
        ...packageInfo,
        coverPhoto: {
          ...packageInfo.coverPhoto,
          destinationId
        }
      });
    } else {
      const newPhotos = [...packageInfo.otherPhotos];
      newPhotos[index].destinationId = destinationId;
      setPackageInfo({
        ...packageInfo,
        otherPhotos: newPhotos
      });
    }
    setFormStatus({ ...formStatus, isDirty: true });
  };

  // Remove photo
  const removePhoto = (index) => {
    if (type === 'cover') {
      setPackageInfo({
        ...packageInfo,
        coverPhoto: null
      });
    } else {
      const newPhotos = [...packageInfo.otherPhotos];
      newPhotos.splice(index, 1);
      setPackageInfo({
        ...packageInfo,
        otherPhotos: newPhotos
      });
    }
    setFormStatus({ ...formStatus, isDirty: true });
  };
  
  return (
    <div>
      <Label className={`text-lg font-medium ${type === 'gallery' ? 'mb-2' : ''}`}>
        {type === 'cover' ? 'Cover Photo' : 'Gallery Photos'}
      </Label>
      <p className="text-gray-600 text-sm mb-3">
        {type === 'cover' 
          ? 'This will be the main image displayed for your package' 
          : 'Add additional photos to showcase different aspects of your package'}
      </p>
      
      {(type === 'cover' && !packageInfo.coverPhoto) || (type === 'gallery' && packageInfo.otherPhotos.length === 0) ? (
        // Selection Mode (no photos selected yet)
        <Tabs defaultValue="library" className="border rounded-lg p-4 shadow-sm">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="library" onClick={() => setPhotoMode('library')}>Choose from Library</TabsTrigger>
            <TabsTrigger value="upload" onClick={() => setPhotoMode('upload')}>Upload New Photo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destination">Select Destination</Label>
                <select 
                  id="destination"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                >
                  <option value="">-- Select Destination --</option>
                  {Array.isArray(destinations) && destinations.map(destination => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="search">Search Photos</Label>
                <div className="flex mt-1">
                  <Input
                    id="search"
                    placeholder="Search by caption..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button variant="outline" className="rounded-l-none border-l-0">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {selectedDestination ? (
              filteredPhotos && filteredPhotos.length > 0 ? (
                <div className="h-[400px] overflow-auto rounded-md p-2 border border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                    {filteredPhotos.map(photo => (
                      <motion.div 
                        key={photo.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 border-2 
                          ${isPhotoSelected(photo.id) 
                            ? 'border-green-500 shadow-lg' 
                            : 'border-transparent hover:border-blue-300'}`}
                        onClick={() => handleSelectPhoto(photo)}
                      >
                        <img 
                          src={photo.url} 
                          alt={photo.alt_text || photo.caption} 
                          className="w-full h-40 object-cover"
                        />
                        
                        {isPhotoSelected(photo.id) && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        
                        <div className="p-2 bg-white">
                          <p className="text-sm font-medium truncate">{photo.caption}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed rounded-lg">
                  <Image className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">No photos found for this destination</p>
                </div>
              )
            ) : (
              <div className="text-center py-16 border border-dashed rounded-lg">
                <Image className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Select a destination to view available photos</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload">
            <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={type === 'cover' ? 'cover-photo' : 'gallery-photo'}
                onChange={handlePhotoUpload}
              />
              
              <div className="text-center mb-6">
                <UploadCloud className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                <h3 className="text-lg font-medium">Upload a photo</h3>
                <p className="text-gray-500 mb-4">PNG, JPG or JPEG (max. 5MB)</p>
                
                <div className="flex flex-col items-center justify-center max-w-xs mx-auto mb-6">
                  <div className="w-full">
                    <Label htmlFor="upload-destination" className="text-sm">Select Destination</Label>
                    <select 
                      id="upload-destination"
                      className="w-full h-10 px-3 rounded-md border border-input mt-1"
                      value={uploadDestination}
                      onChange={(e) => setUploadDestination(e.target.value)}
                    >
                      <option value="">-- Select Destination --</option>
                      {Array.isArray(destinations) && destinations.map(destination => (
                        <option key={destination.id} value={destination.id}>
                          {destination.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById(type === 'cover' ? 'cover-photo' : 'gallery-photo')?.click()}
                    className="mx-auto flex items-center gap-2 py-6 px-6"
                    disabled={!uploadDestination}
                  >
                    <ImagePlus className="w-6 h-6 text-blue-500" />
                    <span className="text-base">
                      {uploadDestination 
                        ? `Upload ${type === 'cover' ? 'Cover' : ''} Photo` 
                        : 'Select a destination first'}
                    </span>
                  </Button>
                </motion.div>
                
                {!uploadDestination && (
                  <p className="text-orange-500 text-sm mt-2">
                    Please select a destination before uploading
                  </p>
                )}
                
                <p className="mt-2 text-sm text-gray-500">
                  {type === 'cover' ? 'Recommended size: 1200 x 800 pixels' : 'Recommended size: 800 x 600 pixels'}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Display selected photo(s)
        <div>
          {type === 'cover' && packageInfo.coverPhoto && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="relative">
                <img 
                  src={packageInfo.coverPhoto.preview} 
                  alt={packageInfo.coverPhoto.alt_text || packageInfo.coverPhoto.caption}
                  className="h-[300px] object-cover rounded-lg shadow-md"
                />
                <Badge 
                  className={`absolute top-2 right-2 text-white ${packageInfo.coverPhoto.isFromLibrary ? 'bg-blue-500' : 'bg-green-500'}`}
                >
                  {packageInfo.coverPhoto.isFromLibrary ? 'From Library' : 'Uploaded'}
                </Badge>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <Label htmlFor="cover-caption">Caption</Label>
                    <Input
                      id="cover-caption"
                      placeholder="Add caption (optional)"
                      value={packageInfo.coverPhoto.caption || ''}
                      onChange={(e) => updatePhotoCaption(0, e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor="cover-alt">Alt Text</Label>
                    <Input
                      id="cover-alt"
                      placeholder="Add alt text"
                      value={packageInfo.coverPhoto.alt_text || ''}
                      onChange={(e) => updatePhotoAltText(0, e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                    <div className="flex items-end col-span-2">
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(0)}
                        className="gap-1.5 mt-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <Label htmlFor="cover-destination">Destination</Label>
                    <select 
                      id="cover-destination"
                      className="w-full h-10 px-3 rounded-md border border-input mt-1"
                      value={packageInfo.coverPhoto.destinationId || ''}
                      onChange={(e) => updatePhotoDestination(0, e.target.value)}
                    >
                      <option value="">-- Select Destination --</option>
                      {Array.isArray(destinations) && destinations.map(destination => (
                        <option key={destination.id} value={destination.id}>
                          {destination.name}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  
                </div>
              </div>
            </motion.div>
          )}
          
          {type === 'gallery' && packageInfo.otherPhotos && packageInfo.otherPhotos.length > 0 && (
            <div className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Gallery Photos ({packageInfo.otherPhotos.length})</h3>
                
                <Tabs defaultValue="library" className="w-auto">
                  <TabsList className="h-8">
                    <TabsTrigger value="library" className="text-xs px-2 py-1" onClick={() => setPhotoMode('library')}>
                      Add from Library
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="text-xs px-2 py-1" onClick={() => setPhotoMode('upload')}>
                      Upload New
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Separator */}
              <div className="h-px w-full bg-gray-200 my-4"></div>
              
              {photoMode === 'library' ? (
                <div className="border rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gallery-destination" className="text-sm">Destination</Label>
                      <select 
                        id="gallery-destination"
                        className="w-full h-9 px-3 rounded-md border border-input mt-1 text-sm"
                        value={selectedDestination}
                        onChange={(e) => setSelectedDestination(e.target.value)}
                      >
                        <option value="">-- Select Destination --</option>
                        {Array.isArray(destinations) && destinations.map(destination => (
                          <option key={destination.id} value={destination.id}>
                            {destination.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="gallery-search" className="text-sm">Search</Label>
                      <div className="flex mt-1">
                        <Input
                          id="gallery-search"
                          placeholder="Search photos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="rounded-r-none h-9 text-sm"
                        />
                        <Button variant="outline" size="sm" className="rounded-l-none border-l-0 h-9">
                          <Search className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {selectedDestination ? (
                    filteredPhotos && filteredPhotos.length > 0 ? (
                      <div className="h-[400px] mt-3 overflow-auto rounded-md border border-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                          {filteredPhotos.map(photo => (
                            <motion.div 
                              key={photo.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-200 border-2 
                                ${isPhotoSelected(photo.id) 
                                  ? 'border-green-500 opacity-50' 
                                  : 'border-transparent hover:border-blue-300'}`}
                              onClick={() => !isPhotoSelected(photo.id) && handleSelectPhoto(photo)}
                            >
                              <img 
                                src={photo.url} 
                                alt={photo.alt_text || photo.caption} 
                                className="w-full h-24 object-cover"
                              />
                              
                              {isPhotoSelected(photo.id) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                  <Badge className="bg-green-500 text-black">
                                    Already Selected
                                  </Badge>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-lg mt-3">
                        <Image className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No photos found for this destination</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-lg mt-3">
                      <Image className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Select a destination to view available photos</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label htmlFor="upload-gallery-destination" className="text-sm">Destination for Upload</Label>
                      <select 
                        id="upload-gallery-destination"
                        className="w-full h-9 px-3 rounded-md border border-input mt-1 text-sm"
                        value={uploadDestination}
                        onChange={(e) => setUploadDestination(e.target.value)}
                      >
                        <option value="">-- Select Destination --</option>
                        {Array.isArray(destinations) && destinations.map(destination => (
                          <option key={destination.id} value={destination.id}>
                            {destination.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('gallery-add-photo')?.click()}
                        className="h-9 mt-auto"
                        disabled={!uploadDestination}
                      >
                        <ImagePlus className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Upload Photo</span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="gallery-add-photo"
                        onChange={handlePhotoUpload}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Display gallery photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageInfo.otherPhotos.map((photo, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border rounded-lg overflow-hidden bg-white"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={photo.preview} 
                        alt={photo.alt_text || photo.caption || `Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 text-white ${photo.isFromLibrary ? 'bg-blue-500' : 'bg-green-500'}`}
                      >
                        {photo.isFromLibrary ? 'From Library' : 'Uploaded'}
                      </Badge>
                    </div>
                    <div className="p-3 space-y-3">
                      <Input
                        placeholder="Add caption (optional)"
                        value={photo.caption || ''}
                        onChange={(e) => updatePhotoCaption(index, e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Add alt text"
                        value={photo.alt_text || ''}
                        onChange={(e) => updatePhotoAltText(index, e.target.value)}
                        className="text-sm"
                      />
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => removePhoto(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </Button>
                      
                      {/* <div className="grid grid-cols-2 gap-2">
                        <select 
                          className="h-9 px-3 rounded-md border border-input text-sm"
                          value={photo.destinationId || ''}
                          onChange={(e) => updatePhotoDestination(index, e.target.value)}
                        >
                          <option value="">-- Destination --</option>
                          {Array.isArray(destinations) && destinations.map(destination => (
                            <option key={destination.id} value={destination.id}>
                              {destination.name}
                            </option>
                          ))}
                        </select>
                        
                      </div> */}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoSelectionSection;