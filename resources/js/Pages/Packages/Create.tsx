import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SearchableSelect from '@/components/SearchableSelect';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Trash2, ImagePlus, ChevronRight, ChevronDown, PlusCircle, 
  Calendar, Clock, MapPin, Info, FileEdit, DollarSign, 
  Save, Camera, Sun, Coffee, Bus, Hotel, Briefcase, 
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { TabsContainer, TabContent } from '@/Components/CustomTabs';
import DayActivities from '@/components/DayActivities';
import Main from '@/Layouts/Main';
import './Create.css'

// Definisi tipe data
type Photo = {
  preview: string;
  caption: string;
  alt_text: string;
};

type Activity = {
  time: string;
  type: string;
  activity: string;
  location: string;
  notes: string;
};

type Day = {
  day: number;
  title: string;
  description: string;
  departure: string;
  selectedActivity: string;
  activities: Activity[];
};

type Price = {
  startPax: string;
  endPax: string;
  price: string;
};

type PackageInfo = {
  title: string;
  category: 'regular' | 'student';
  duration: number;
  departure: string;
  return: string;
  coverPhoto: Photo | null;
  otherPhotos: Photo[];
  sellingPoint: string;
};

// Data dummy untuk opsi select


// Helper untuk format currency
const formatCurrency = (value) => {
  const number = parseInt(value.replace(/\D/g, ''), 10) || 0;
  return number.toLocaleString('id-ID');
};


// Editor WYSIWYG component
const QuillEditor = ({ content, onChange }) => {
  return (
    <div className="bg-white border rounded-md">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        className="h-[200px] mb-12 text-base"
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
          ],
        }}
      />
    </div>
  );
};

// Card container dengan animasi
const AnimatedCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    <Card className="shadow-md border-t-4 border-t-blue-500">
      {children}
    </Card>
  </motion.div>
);


// Component utama Create
const Create = ({locations,activities,startEnd}) => {
  
  // State Management
  const [activeTab, setActiveTab] = useState('package-info');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [departureOpen, setDepartureOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);  
  const [activityTypeOpen, setActivityTypeOpen] = useState({});
  const [collapsedDays, setCollapsedDays] = useState({});
  const [formStatus, setFormStatus] = useState({ isDirty: false, isSaving: false });
  const [days, setDays] = useState([{
    day: 1,
    title: 'Day 1: Welcome to Adventure',
    description: '',
    activities: []
  }]);
  const activityTypes = [
    { id: 2, name: 'Attraction / Tour', icon: <Sun className="h-5 w-5 text-amber-500" /> },
    { id: 3, name: 'Accommodation', icon: <Hotel className="h-5 w-5 text-indigo-500" /> },
    { id: 4, name: 'Meal / Restaurant', icon: <Coffee className="h-5 w-5 text-orange-500" /> },
    { id: 5, name: 'Transportation', icon: <Bus className="h-5 w-5 text-blue-500" /> },
  ];
  // Update day helper function
  const updateDay = (dayIndex, updatedDay) => {
    const updatedDays = [...days];
    updatedDays[dayIndex] = updatedDay;
    setDays(updatedDays);
    setFormStatus({ ...formStatus, isDirty: true });
  };

  // Fungsi toggle untuk collapse day
  const toggleDay = (dayIndex) => {
    setCollapsedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  // State untuk package information
  const [packageInfo, setPackageInfo] = useState({
    title: '',
    category: 'regular',
    duration: 3,
    departure: '',
    return: '',
    coverPhoto: null,
    otherPhotos: [],
    sellingPoint: `
  <ul>
  <li>Point 1</li>
  <li>Point 2</li>
  <li>Point 3</li>
  </ul>    
    `
  });

  // State untuk pricing
  const [prices, setPrices] = useState([{
    startPax: '2',
    endPax: '5',
    price: '1,500,000'
  }]);


  // Handler untuk upload foto
  const handlePhotoUpload = (type, e) => {
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
            caption: '',
            alt_text: ''
          }
        });
      } else {
        setPackageInfo({
          ...packageInfo,
          otherPhotos: [
            ...packageInfo.otherPhotos,
            {
              preview: result,
              caption: '',
              alt_text: '',
            }
          ]
        });
      }
      setFormStatus({ ...formStatus, isDirty: true });
    };

    reader.readAsDataURL(file);
  };

  // Update photo caption
  const updatePhotoCaption = (type, index, caption) => {
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
  const updatePhotoAltText = (type, index, alt_text) => {
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

  // Remove photo
  const removePhoto = (type, index) => {
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

  // Handler untuk menambah tipe aktivitas
  const handleActivityTypeChange = (dayIndex, value) => {
    // Tutup dropdown setelah pemilihan
    setActivityTypeOpen(prev => ({
      ...prev,
      [dayIndex]: false
    }));
    
    // Jika value kosong, jangan lakukan apa-apa
    if (!value) return;
    
    // Buat aktivitas baru dan tambahkan ke hari yang sesuai
    const updatedDays = [...days];
    updatedDays[dayIndex].activities.push({
      type: value,
      activity: '',
      time: '',
      location: '',
      notes: ''
    });
    
    setDays(updatedDays);
    setFormStatus({ ...formStatus, isDirty: true });
  };

  // Add price tier
  const addPrice = () => {
    setPrices([...prices, { startPax: '', endPax: '', price: '' }]);
    setFormStatus({ ...formStatus, isDirty: true });
  };

  // Remove price tier
  const removePrice = (index) => {
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    setPrices(newPrices);
    setFormStatus({ ...formStatus, isDirty: true });
  };

  // Effect untuk update jumlah hari berdasarkan durasi
  useEffect(() => {
    const duration = packageInfo.duration;
    if (duration > days.length) {
      const newDays = [...days];
      for (let i = days.length + 1; i <= duration; i++) {
        newDays.push({
          day: i,
          title: `Day ${i}: Exploration Day`,
          description: '',
          departure: '',
          selectedActivity: '',
          activities: []
        });
      }
      setDays(newDays);
    } else if (duration < days.length) {
      setDays(days.slice(0, duration));
    }
    setFormStatus({ ...formStatus, isDirty: true });
  }, [packageInfo.duration]);

  // Auto update departure dan return
  useEffect(() => {
    if (packageInfo.departure || packageInfo.return) {
      const updatedDays = days.map((day, index) => ({
        ...day,
        departure: index === 0 ? packageInfo.departure : '',
        return: index === days.length - 1 ? packageInfo.return : ''
      }));
      setDays(updatedDays);
    }
  }, [packageInfo.departure, packageInfo.return]);

  // Simulasi save
// Add this function to your Create component
const handleSubmit = () => {
  // Set loading state
  setFormStatus({ ...formStatus, isSaving: true });
  
  // Basic validation
  const validationErrors = [];
  
  if (!packageInfo.title) {
    validationErrors.push("Package title is required");
  }
  
  if (!packageInfo.departure) {
    validationErrors.push("Departure location is required");
  }
  
  if (!packageInfo.return) {
    validationErrors.push("Return location is required");
  }
  
  if (packageInfo.otherPhotos.length === 0 && !packageInfo.coverPhoto) {
    validationErrors.push("At least one photo is required");
  }
  
  // Check if any pricing tier is missing values
  const hasPricingErrors = prices.some(price => 
    !price.startPax || !price.endPax || !price.price
  );
  
  if (hasPricingErrors) {
    validationErrors.push("All pricing tiers must have complete information");
  }
  
  // If validation fails, show errors and stop submission
  if (validationErrors.length > 0) {
    console.error("Validation errors:", validationErrors);
    alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
    setFormStatus({ ...formStatus, isSaving: false });
    return;
  }
  
  // Prepare activities data with additional processing
  const processedDays = days.map(day => {
    // Make a deep copy of the day to avoid references
    const processedDay = { ...day };
    
    // Process activities for each day
    processedDay.activities = day.activities.map(activity => {
      // Get activity name and location name for display purposes
      const activityData = activities.find(a => a.id === parseInt(activity.activity));
      const locationData = locations.find(l => l.id === parseInt(activity.location));
      
      return {
        ...activity,
        activityName: activityData ? activityData.name : '',
        locationName: locationData ? locationData.name : '',
        activityTypeId: activity.type, // Explicitly store the activity type ID
        activityTypeName: activityTypes.find(t => t.id === activity.type)?.name || ''
      };
    });
    
    return processedDay;
  });
  
  // Construct complete data object
  const formData = {
    packageInfo: {
      ...packageInfo,
      // Format any specific data if needed
      formattedDuration: `${packageInfo.duration} days`,
      departureName: startEnd.find(loc => loc.id === packageInfo.departure)?.name || '',
      returnName: startEnd.find(loc => loc.id === packageInfo.return)?.name || ''
    },
    itinerary: processedDays,
    pricing: prices.map(price => ({
      ...price,
      // Remove commas from price string and convert to number
      numericPrice: parseInt(price.price.replace(/,/g, ''), 10),
      rangeText: `${price.startPax} to ${price.endPax} people`
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      totalActivities: days.reduce((sum, day) => sum + day.activities.length, 0),
      lastModified: new Date().toISOString()
    }
  };
  
  // Prepare a single comprehensive data object with all form data
  const allFormData = {
    packageInfo: {
      title: packageInfo.title,
      category: packageInfo.category,
      duration: packageInfo.duration,
      departure: packageInfo.departure,
      departureName: formData.packageInfo.departureName,
      return: packageInfo.return,
      returnName: formData.packageInfo.returnName,
      coverPhoto: packageInfo.coverPhoto,
      otherPhotos: packageInfo.otherPhotos,
      sellingPoint: packageInfo.sellingPoint,
      hasCoverPhoto: packageInfo.coverPhoto !== null,
      totalGalleryPhotos: packageInfo.otherPhotos.length
    },
    itinerary: formData.itinerary.map(day => ({
      day: day.day,
      title: day.title,
      description: day.description,
      activities: day.activities.map(activity => ({
        type: activity.type,
        typeId: activity.activityTypeId,
        typeName: activity.activityTypeName,
        activity: activity.activity,
        activityName: activity.activityName,
        time: activity.time,
        location: activity.location,
        locationName: activity.locationName,
        notes: activity.notes
      }))
    })),
    pricing: formData.pricing.map(price => ({
      startPax: price.startPax,
      endPax: price.endPax,
      price: price.price,
      numericPrice: price.numericPrice
    })),
    metadata: formData.metadata
  };

  // Simulate API call with setTimeout
  setTimeout(() => {
    // Log the comprehensive object in a way that's easy to copy
    console.log("const travelPackageData =", allFormData);
    
    // For easy copying as JSON
    console.log("\n// JSON string version for copying:");
    console.log("const travelPackageJSON = '" + JSON.stringify(allFormData).replace(/'/g, "\\'") + "';");
    
    // Still provide the detailed breakdown for readability
    console.log("\n=== PACKAGE INFO ===");
    console.log("Title:", allFormData.packageInfo.title);
    console.log("Category:", allFormData.packageInfo.category);
    console.log("Duration:", allFormData.packageInfo.duration, "days");
    console.log("Departure:", allFormData.packageInfo.departureName);
    console.log("Return:", allFormData.packageInfo.returnName);
    console.log("Cover Photo:", packageInfo.coverPhoto ? "✓ Uploaded" : "✗ Not uploaded");
    console.log("Gallery Photos:", packageInfo.otherPhotos.length);
    console.log("Selling Points:", packageInfo.sellingPoint);
    
    console.log("\n=== ITINERARY ===");
    allFormData.itinerary.forEach((day, index) => {
      console.log(`\nDay ${day.day}: ${day.title}`);
      console.log("Description:", day.description);
      
      if (day.activities.length === 0) {
        console.log("No activities scheduled");
      } else {
        console.log("Activities:");
        day.activities.forEach((activity, actIndex) => {
          console.log(`  ${actIndex + 1}. [Type ID: ${activity.typeId}] [${activity.typeName}] ${activity.time ? activity.time + ' - ' : ''}${activity.activityName || 'Untitled'} at ${activity.locationName || 'Unspecified location'}`);
          if (activity.notes) console.log(`     Notes: ${activity.notes}`);
          console.log(`     Activity Type ID: ${activity.typeId}, Activity ID: ${activity.activity}, Location ID: ${activity.location}`);
        });
      }
    });
    
    console.log("\n=== PRICING ===");
    allFormData.pricing.forEach((price, index) => {
      console.log(`Tier ${index + 1}: ${price.startPax} to ${price.endPax} people - Rp ${price.price} per person`);
    });
    
    console.log("\n=== SUBMISSION COMPLETE ===");
    
    // Reset form status
    setFormStatus({ isDirty: false, isSaving: false });
    
    // Show success message
    alert("Package saved successfully!");
  }, 1500);
};

// Replace your existing handleSave function with this one
// or keep both and call handleSubmit from handleSave

  return (
    <Main>
      <div className="mx-auto px-4 py-8 mb-48 bg-gray-50 min-h-screen">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Travel Package</h1>
            <p className="text-gray-600 mt-1">Design your perfect travel experience</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            {formStatus.isDirty && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex gap-1 items-center">
                <AlertCircle className="h-3.5 w-3.5" /> Unsaved changes
              </Badge>
            )}
            
            <Button 
              onClick={handleSubmit} 
              disabled={formStatus.isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {formStatus.isSaving ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Package
                </>
              )}
            </Button>
          </div>
        </div>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      
          {/* Package Info Tab */}
          <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab}>
            <TabsContent value="package-info" className="space-y-6">
              <AnimatedCard>
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Set the core details about your travel package
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="package-title" className="text-base flex items-center gap-2 mb-2">
                        <FileEdit className="h-4 w-4 text-gray-600" /> 
                        Package Title
                      </Label>
                      <Input 
                        id="package-title"
                        value={packageInfo.title}
                        onChange={(e) => {
                          setPackageInfo({...packageInfo, title: e.target.value});
                          setFormStatus({ ...formStatus, isDirty: true });
                        }}
                        placeholder="Enter an attractive title for your package"
                        className="text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="package-category" className="text-base flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-gray-600" /> 
                        Category
                      </Label>
                      <SearchableSelect
                        options={[
                          { id: 'regular', name: 'Regular Tour' },
                          { id: 'student', name: 'Student Package' }
                        ]}
                        value={packageInfo.category}
                        onChange={(value) => {
                          setPackageInfo({...packageInfo, category: value});
                          setFormStatus({ ...formStatus, isDirty: true });
                        }}
                        placeholder="Select package category"
                        open={categoryOpen}
                        setOpen={setCategoryOpen}
                        displayKey="name"
                      />
                    </div>
                  </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="package-duration" className="text-base flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-600" /> 
                        Duration (days)
                      </Label>
                      <Input 
                        id="package-duration"
                        type="number"
                        min="1"
                        max="30"
                        value={packageInfo.duration}
                        onChange={(e) => {
                          setPackageInfo({...packageInfo, duration: parseInt(e.target.value) || 1});
                          setFormStatus({ ...formStatus, isDirty: true });
                        }}
                        className="text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="departure-location" className="text-base flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-600" /> 
                        Departure From
                      </Label>
                      <SearchableSelect
                        options={startEnd}
                        value={packageInfo.departure}
                        onChange={(value) => {
                          setPackageInfo({...packageInfo, departure: value});
                          setFormStatus({ ...formStatus, isDirty: true });
                        }}
                        placeholder="Select departure location"
                        open={departureOpen}
                        setOpen={setDepartureOpen}
                        displayKey="name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="return-location" className="text-base flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-600" /> 
                        Return To
                      </Label>
                      <SearchableSelect
                        options={startEnd}
                        value={packageInfo.return}
                        onChange={(value) => {
                          setPackageInfo({...packageInfo, return: value});
                          setFormStatus({ ...formStatus, isDirty: true });
                        }}
                        placeholder="Select return location"
                        open={returnOpen}
                        setOpen={setReturnOpen}
                        displayKey="name"
                      />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            
              {/* Photos Section */}
              <AnimatedCard>
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-600" />
                    Package Photos
                  </CardTitle>
                  <CardDescription>
                    Add attractive images to showcase your travel package
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white pt-6 space-y-6">
                  {/* Cover Photo */}
                  <div>
                    <Label className="text-lg font-medium">Cover Photo</Label>
                    <p className="text-gray-600 text-sm mb-3">This will be the main image displayed for your package</p>
                    
                    <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="cover-photo"
                        onChange={(e) => handlePhotoUpload('cover', e)}
                      />
                      
                      {!packageInfo.coverPhoto ? (
                        <div className="text-center">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block"
                          >
                            <Button 
                              variant="outline" 
                              onClick={() => document.getElementById('cover-photo')?.click()}
                              className="mx-auto flex items-center gap-2 py-6 px-6"
                            >
                              <ImagePlus className="w-6 h-6 text-blue-500" />
                              <span className="text-base">Upload Cover Photo</span>
                            </Button>
                          </motion.div>
                          <p className="mt-2 text-sm text-gray-500">Recommended size: 1200 x 800 pixels</p>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative"
                        >
                          <img 
                            src={packageInfo.coverPhoto.preview} 
                            alt="Cover"
                            className="w-[800px] h-[400px] object-cover rounded-lg shadow-md"
                          />
                          <div className="mt-4 space-y-3">
                            <Input
                              placeholder="Add caption (optional)"
                              value={packageInfo.coverPhoto.caption}
                              onChange={(e) => updatePhotoCaption('cover', 0, e.target.value)}
                              className="border-blue-200 focus:border-blue-500 text-md"
                            />
                            <Input
                              placeholder="Add alt text"
                              value={packageInfo.coverPhoto.alt_text}
                              onChange={(e) => updatePhotoAltText('cover', 0, e.target.value)}
                              className="border-blue-200 focus:border-blue-500 text-md"
                            />
                            <div className="flex justify-end">
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => removePhoto('cover', 0)}
                                className="gap-1.5"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                
                  {/* Gallery Photos */}
                  <div>
                    <Label className="text-lg font-medium">Gallery Photos</Label>
                    <p className="text-gray-600 text-sm mb-3">Add additional photos to showcase different aspects of your package</p>
                    
                    <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="other-photos"
                        onChange={(e) => handlePhotoUpload('other', e)}
                      />
                      
                      <div className="text-center mb-6">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-block"
                        >
                          <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('other-photos')?.click()}
                            className="mx-auto flex items-center gap-2"
                          >
                            <ImagePlus className="w-4 h-4 text-blue-500" />
                            <span>Add Gallery Photos</span>
                          </Button>
                        </motion.div>
                      </div>
                    
                      <AnimatePresence>
                        {packageInfo.otherPhotos.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          >
                            {packageInfo.otherPhotos.map((photo, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                transition={{ duration: 0.2 }}
                                className="border rounded-lg overflow-hidden bg-white"
                              >
                                <div className="aspect-[4/3] overflow-hidden">
                                  <img 
                                    src={photo.preview} 
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                  />
                                </div>
                                <div className="p-3 space-y-3">
                                  <Input
                                    placeholder="Add caption (optional)"
                                    value={photo.caption}
                                    onChange={(e) => updatePhotoCaption('other', index, e.target.value)}
                                    className="text-sm"
                                  />
                                  <Input
                                    placeholder="Add alt text"
                                    value={photo.alt_text}
                                    onChange={(e) => updatePhotoAltText('other', index, e.target.value)}
                                    className="text-sm"
                                  />
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePhoto('other', index)}
                                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            
              {/* Selling Point */}
              <AnimatedCard>
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Selling Points
                  </CardTitle>
                  <CardDescription>
                    Describe what makes this package special and appealing to travelers
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white pt-6">
                  <QuillEditor
                    content={packageInfo.sellingPoint}
                    onChange={(content) => {
                      setPackageInfo({...packageInfo, sellingPoint: content});
                      setFormStatus({ ...formStatus, isDirty: true });
                    }}
                  />
                </CardContent>
              </AnimatedCard>
            </TabsContent>
        
            {/* Itinerary Tab */}
            <TabsContent value="itinerary" className="space-y-6">
              <AnimatedCard>
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Day-by-Day Itinerary
                  </CardTitle>
                  <CardDescription>
                    Plan the full experience with detailed daily activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white pt-6 space-y-6">
                  {days.map((day, dayIndex) => (
                    <motion.div 
                      key={dayIndex}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: dayIndex * 0.1 }}
                      className="border rounded-lg overflow-hidden shadow-sm"
                    >
                      {/* Day Header */}
                      <div 
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${collapsedDays[dayIndex] ? 'bg-blue-50' : 'bg-blue-100'}`}
                        onClick={() => toggleDay(dayIndex)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {day.day}
                          </div>
                          <Input 
                            placeholder="Day Title"
                            value={day.title}
                            onChange={(e) => {
                              const updatedDays = [...days];
                              updatedDays[dayIndex].title = e.target.value;
                              setDays(updatedDays);
                              setFormStatus({ ...formStatus, isDirty: true });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full md:w-96 border-0 text-md text-black font-semibold bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform duration-200 text-blue-700 ${collapsedDays[dayIndex] ? 'rotate-180' : ''}`}
                        />
                      </div>
                    
                      {/* Day Content */}
                      <AnimatePresence>
                        {!collapsedDays[dayIndex] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="p-4 space-y-6 bg-white">
                              {/* Description */}
                              <div>
                                <Label className="text-base mb-2 block">Day Description</Label>
                                <QuillEditor
                                  content={day.description}
                                  onChange={(content) => {
                                    const updatedDays = [...days];
                                    updatedDays[dayIndex].description = content;
                                    setDays(updatedDays);
                                    setFormStatus({ ...formStatus, isDirty: true });
                                  }}
                                />
                              </div>
                            
                              <DayActivities
                                day={day}
                                departure={startEnd.find((item) => item.id == packageInfo.departure)?.name || ''}
                                returnDay={startEnd.find((item) => item.id == packageInfo.return)?.name || ''}
                                locations={locations}
                                activities={activities}
                                activityTypes={activityTypes}
                                dayIndex={dayIndex}
                                updateDay={updateDay}
                                formStatus={formStatus}
                                setFormStatus={setFormStatus}
                                numbOfDay={packageInfo.duration}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </CardContent>
              </AnimatedCard>
            </TabsContent>
        
            {/* Prices Tab */}
            <TabsContent value="prices">
              <AnimatedCard>
                <CardHeader className="bg-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Pricing Tiers
                  </CardTitle>
                  <CardDescription>
                    Set different prices based on group size
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white pt-6 space-y-6">
                  <AnimatePresence>
                    {prices.map((price, index) => (
                      <motion.div 
                        key={index}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg border hover:shadow-sm transition-shadow bg-white"
                      >
                        <div className="col-span-12 md:col-span-1 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-3">
                          <Label className="mb-1.5 block text-sm text-gray-600">Min. Participants</Label>
                          <Input 
                            type="number"
                            placeholder="Min pax"
                            value={price.startPax}
                            onChange={(e) => {
                              const updatedPrices = [...prices];
                              updatedPrices[index].startPax = e.target.value;
                              setPrices(updatedPrices);
                              setFormStatus({ ...formStatus, isDirty: true });
                            }}
                            className="text-center"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-3">
                          <Label className="mb-1.5 block text-sm text-gray-600">Max. Participants</Label>
                          <Input 
                            type="number"
                            placeholder="Max pax"
                            value={price.endPax}
                            onChange={(e) => {
                              const updatedPrices = [...prices];
                              updatedPrices[index].endPax = e.target.value;
                              setPrices(updatedPrices);
                              setFormStatus({ ...formStatus, isDirty: true });
                            }}
                            className="text-center"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <Label className="mb-1.5 block text-sm text-gray-600">Price per Person (IDR)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                              Rp
                            </span>
                            <Input 
                              className="pl-10 font-medium text-right"
                              value={price.price}
                              onChange={(e) => {
                                const updatedPrices = [...prices];
                                updatedPrices[index].price = formatCurrency(e.target.value);
                                setPrices(updatedPrices);
                                setFormStatus({ ...formStatus, isDirty: true });
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-span-12 md:col-span-1 flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePrice(index)}
                            disabled={prices.length <= 1}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="outline"
                      onClick={addPrice}
                      className="w-full gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Price Tier
                    </Button>
                  </motion.div>
                
                  <div className="mt-8 flex justify-end">
                    <Button 
                      onClick={handleSubmit} 
                      disabled={formStatus.isSaving}
                      className="bg-blue-600 hover:bg-blue-700 py-6 px-8 text-base"
                    >
                      {formStatus.isSaving ? (
                        <>
                          <span className="animate-spin mr-2">◌</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Save Package
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </AnimatedCard>
            </TabsContent>
          </TabsContainer>
        </Tabs>
      </div>
    </Main>
  );
};

export default Create;