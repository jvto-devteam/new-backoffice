import React, { useState, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react'
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
import PhotoSelectionSection from '@/components/PhotoSelectionSection';
import { processDestinationPhotos, preparePhotosForSubmission } from '@/utils/photoHelpers';
import Main from '@/Layouts/Main';
import './Create.css'

// Definisi tipe data
type Photo = {
  photo_id: number;
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
  isUnlimitedMax?: boolean; // Properti baru untuk menandai format X+
};

type PackageInfo = {
  title: string;
  category: 1 | 2;
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
const Form = ({locations,activities,startEnd,hotels,destinations,page,packages}) => {
  
  // State Management
  const [activeTab, setActiveTab] = useState('package-info');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [departureOpen, setDepartureOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);  
  const [activityTypeOpen, setActivityTypeOpen] = useState({});
  const [collapsedDays, setCollapsedDays] = useState({});
  const [formStatus, setFormStatus] = useState({ isDirty: false, isSaving: false });
  const [destinationsData, setDestinationsData] = useState([]);
  const [processedPhotoData, setProcessedPhotoData] = useState({
    destinations: [],
    photosByDestination: {}
  });  

  const [days, setDays] = useState(packages.itinerary);
  const activityTypes = [
    { id: 2, name: 'Attraction / Tour', icon: <Sun className="h-5 w-5 text-amber-500" /> },
    { id: 3, name: 'Accommodation', icon: <Hotel className="h-5 w-5 text-indigo-500" /> },
    { id: 4, name: 'Meal / Restaurant', icon: <Coffee className="h-5 w-5 text-orange-500" /> },
    { id: 5, name: 'Transportation', icon: <Bus className="h-5 w-5 text-blue-500" /> },
  ];
  const hotelOptions = hotels;  

  const DUMMY_DESTINATION_PHOTOS = {
    "1": [ // Bali
      { id: "101", url: "https://via.placeholder.com/800x600?text=Bali+Beach", caption: "Kuta Beach", alt_text: "Sunset at Kuta Beach" },
      { id: "102", url: "https://via.placeholder.com/800x600?text=Bali+Temple", caption: "Tanah Lot Temple", alt_text: "Tanah Lot Temple during sunset" },
      { id: "103", url: "https://via.placeholder.com/800x600?text=Bali+Rice+Field", caption: "Ubud Rice Terraces", alt_text: "Green rice terraces in Ubud" },
      { id: "104", url: "https://via.placeholder.com/800x600?text=Bali+Traditional+Dance", caption: "Kecak Dance", alt_text: "Traditional Kecak fire dance performance" }
    ],
    "2": [ // Yogyakarta
      { id: "201", url: "https://via.placeholder.com/800x600?text=Yogyakarta+Borobudur", caption: "Borobudur Temple", alt_text: "Sunrise at Borobudur Temple" },
      { id: "202", url: "https://via.placeholder.com/800x600?text=Yogyakarta+Malioboro", caption: "Malioboro Street", alt_text: "Shopping at Malioboro Street" },
      { id: "203", url: "https://via.placeholder.com/800x600?text=Yogyakarta+Kraton", caption: "Yogyakarta Palace", alt_text: "The Sultanate Palace of Yogyakarta" }
    ],
    "3": [ // Lombok
      { id: "301", url: "https://via.placeholder.com/800x600?text=Lombok+Beach", caption: "Senggigi Beach", alt_text: "Crystal clear water at Senggigi" },
      { id: "302", url: "https://via.placeholder.com/800x600?text=Lombok+Rinjani", caption: "Mount Rinjani", alt_text: "Hiking at Mount Rinjani" }
    ],
    "4": [ // Bandung
      { id: "401", url: "https://via.placeholder.com/800x600?text=Bandung+Tangkuban+Perahu", caption: "Tangkuban Perahu", alt_text: "Volcanic crater at Tangkuban Perahu" },
      { id: "402", url: "https://via.placeholder.com/800x600?text=Bandung+Floating+Market", caption: "Floating Market", alt_text: "Lembang Floating Market" }
    ],
    "5": [ // Jakarta
      { id: "501", url: "https://via.placeholder.com/800x600?text=Jakarta+Monas", caption: "National Monument", alt_text: "The National Monument (Monas)" },
      { id: "502", url: "https://via.placeholder.com/800x600?text=Jakarta+Ancol", caption: "Ancol Beach", alt_text: "Recreation at Ancol Dreamland" }
    ]
  };
  
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
    title: packages.package_info.title,
    category: packages.package_info.category,
    duration: packages.package_info.duration,
    departure: packages.package_info.departure_id,
    return: packages.package_info.return_id,
    coverPhoto: packages.package_info.cover_photo,
    otherPhotos: packages.package_info.other_photos,
    sellingPoint: packages.package_info.selling_points
  });
  

  // State untuk pricing
  const [prices, setPrices] = useState(packages.prices);


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
            alt_text: '',
            photo_id: null
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
              photo_id: null
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
    setPrices([...prices, { 
      startPax: '', 
      endPax: '', 
      price: '',
      isUnlimitedMax: false
    }]);
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
    !price.startPax || (!price.endPax && !price.isUnlimitedMax) || !price.price
  );
  
  if (hasPricingErrors) {
    validationErrors.push("All pricing tiers must have complete information");
  }
  
  // Validasi tier pricing agar tidak overlap
  const priceTiers = [...prices].sort((a, b) => 
    parseInt(a.startPax) - parseInt(b.startPax)
  );
  
  for (let i = 0; i < priceTiers.length - 1; i++) {
    const currentTier = priceTiers[i];
    const nextTier = priceTiers[i + 1];
    
    // Jika tier saat ini menggunakan format X+, maka harus menjadi tier terakhir
    if (currentTier.isUnlimitedMax && i < priceTiers.length - 1) {
      validationErrors.push("A tier with unlimited max (X+) must be the last tier");
      break;
    }
    
    // Jika tidak menggunakan format X+, pastikan tidak ada gap atau overlap
    if (!currentTier.isUnlimitedMax) {
      if (parseInt(currentTier.endPax) + 1 !== parseInt(nextTier.startPax)) {
        validationErrors.push(`There's a gap or overlap between tier ${i+1} and tier ${i+2}`);
      }
    }
  }
  
  // Jika validasi gagal, tampilkan error dan hentikan submit
  if (validationErrors.length > 0) {
    console.error("Validation errors:", validationErrors);
    alert(`Please fix the following errors:\n${validationErrors.join("\n")}`);
    setFormStatus({ ...formStatus, isSaving: false });
    return;
  }
  
  // Prepare activities data with additional processing
  const processedDays = days.map(day => {
    const processedDay = { ...day };
    
    processedDay.activities = day.activities.map(activity => {
      // Handle activities berdasarkan tipe nya
      const activitiesData = activity.type === 3 ? hotels : activities.filter(a => a.activity_category_id === activity.type);
      
      const activityData = activitiesData.find(a => a.id == activity.activity);
      const locationData = locations.find(l => l.id == activity.location);
      
      const activityTypeName = activityTypes.find(t => t.id === activity.type)?.name || '';
      
      // Tambahkan data include untuk meals dan data hotel untuk accommodation
      return {
        ...activity,
        activityName: activityData ? activityData.name : '',
        locationName: locationData ? locationData.name : '',
        activityTypeId: activity.type,
        activityTypeName: activityTypeName,
        // Tambahan data berdasarkan tipe
        include: activity.type === 4 ? (activity.include || false) : undefined,
        hotelData: activity.type === 3 ? {
          id: activity.activity,
          name: (activity.activity && hotelOptions.find(h => h.id == activity.activity)?.name) || ''
        } : undefined
      };
    });
    
    return processedDay;
  });

  // Construct data untuk dikirim ke server
  const formData = {
    packageInfo: {
      ...packageInfo,
      formattedDuration: `${packageInfo.duration} days`,
      departureName: startEnd.find(loc => loc.id == packageInfo.departure)?.name || '',
      returnName: startEnd.find(loc => loc.id == packageInfo.return)?.name || ''
    },
    itinerary: processedDays,
    pricing: prices.map(price => ({
      ...price,
      // Format untuk display
      rangeText: price.isUnlimitedMax 
        ? `${price.startPax}+ people` 
        : `${price.startPax} to ${price.endPax} people`,
      // Remove commas from price string and convert to number
      numericPrice: parseInt(price.price.replace(/,/g, ''), 10)
    }))
  };

  // Konversi data foto untuk dikirim
  const preparePhotos = () => {
    // Untuk cover photo
    let coverPhotoData = null;
    if (packageInfo.coverPhoto) {
      coverPhotoData = {
        id: packageInfo.coverPhoto.id, // ID dari library jika ada
        photo_id: packageInfo.coverPhoto.photo_id,
        data: packageInfo.coverPhoto.isFromLibrary ? null : packageInfo.coverPhoto.preview, // Data base64 hanya jika upload sendiri
        preview_url: packageInfo.coverPhoto.preview,
        caption: packageInfo.coverPhoto.caption,
        alt_text: packageInfo.coverPhoto.alt_text,
        destination_id: packageInfo.coverPhoto.destinationId,
        is_from_library: packageInfo.coverPhoto.isFromLibrary
      };
    }
  
    // Untuk gallery photos
    const galleryPhotos = packageInfo.otherPhotos.map(photo => ({
      id: photo.id, // ID dari library jika ada
      photo_id: photo.photo_id,
      data: photo.isFromLibrary ? null : photo.preview, // Data base64 hanya jika upload sendiri
      preview_url: photo.preview,
      caption: photo.caption,
      alt_text: photo.alt_text,
      destination_id: photo.destinationId,
      is_from_library: photo.isFromLibrary
    }));
  
    return {
      coverPhoto: coverPhotoData,
      galleryPhotos
    };
  };

  const photosData = preparePhotosForSubmission(packageInfo);

  // Data lengkap untuk request
  const requestData = {
    title: formData.packageInfo.title,
    category: formData.packageInfo.category,
    duration: formData.packageInfo.duration,
    departure_id: formData.packageInfo.departure,
    return_id: formData.packageInfo.return,
    selling_points: formData.packageInfo.sellingPoint,
    photos: photosData,
    itinerary: formData.itinerary.map(day => ({
      day: day.day,
      title: day.title,
      description: day.description,
      activities: day.activities.map(activity => ({
        type_id: activity.type,
        activity_id: activity.activity,
        time: activity.time,
        location_id: activity.location,
        notes: activity.notes,
        include: activity.include || false
      }))
    })),
    pricing: formData.pricing.map(price => ({
      start_pax: parseInt(price.startPax),
      end_pax: price.isUnlimitedMax ? null : parseInt(price.endPax),
      is_unlimited: price.isUnlimitedMax,
      price: price.price
    }))
  };

  // Debugging
  console.log('Sending data to server:', requestData);

  const submitUrl = page === 'create' 
  ? '/package-inventory/store' 
  : `/package-inventory/update/${packages.package_info.id}`;

  // Submit form menggunakan Inertia.js
  router[page === 'create' ? 'post' : 'put'](submitUrl, requestData, {
    // Options
    onBefore: () => {
      // Tampilkan pesan loading jika diperlukan
      return true; // true berarti lanjutkan request
    },
    onSuccess: () => {
      // Reset form status
      setFormStatus({ isDirty: false, isSaving: false });
      // Redirect dan atau tampilkan pesan sukses
      alert(page === 'create' 
        ? "Package saved successfully!" 
        : "Package updated successfully!");
        
      // Redirect to package list after successful update if needed
      if (page === 'create') {
        router.visit('/package-inventory/jvto');
      }
      else{
        router.visit('/package-inventory/edit/'+packages.package_info.id);
      }
    },
    onError: (errors) => {
      // Tangani error validasi dari server
      console.error("Server validation errors:", errors);
      setFormStatus({ ...formStatus, isSaving: false });
      
      // Tampilkan error spesifik
      const errorMessages = Object.values(errors).flat();
      if (errorMessages.length > 0) {
        alert(`Error saving package:\n${errorMessages.join("\n")}`);
      } else {
        alert("Error saving package. Please try again.");
      }
    },
    onFinish: () => {
      // Selalu dijalankan setelah request selesai (sukses atau gagal)
      setFormStatus({ ...formStatus, isSaving: false });
    },
    preserveScroll: true,
    preserveState: true,
  });
};

// Fungsi untuk mengisi form dengan dummy data (versi yang ditingkatkan untuk komponen DayActivities baru)
const fillWithDummyData = () => {
  console.log('a');
  
  // --- PACKAGE INFO ---
  setPackageInfo({
    title: "Bali Cultural Heritage: 5D4N Adventure",
    category: 1,
    duration: 5,
    departure: startEnd[0]?.id || "1", // Menggunakan ID dari data yang ada
    return: startEnd[0]?.id || "1",
    coverPhoto: {
      id: "101", // ID dari foto library
      preview: "https://via.placeholder.com/800x600?text=Bali+Beach",
      caption: "Breathtaking sunset at Kuta Beach, Bali",
      alt_text: "Sunset view at Kuta Beach with traditional boats",
      destinationId: "1", // Bali
      isFromLibrary: true
    },
    otherPhotos: [
      {
        id: "102", // ID dari foto library
        preview: "https://via.placeholder.com/800x600?text=Bali+Temple",
        caption: "The iconic Tanah Lot sea temple",
        alt_text: "Tanah Lot temple during sunset, surrounded by ocean",
        destinationId: "1", // Bali
        isFromLibrary: true
      },
      {
        id: "103", // ID dari foto library
        preview: "https://via.placeholder.com/800x600?text=Bali+Rice+Field",
        caption: "Scenic rice terraces in Ubud",
        alt_text: "Lush green rice terraces in Ubud, Bali",
        destinationId: "1", // Bali
        isFromLibrary: true
      },
      {
        // Contoh foto upload sendiri (tanpa id dari library)
        preview: "https://via.placeholder.com/800x600?text=Balinese+Dance",
        caption: "Traditional Balinese performance",
        alt_text: "Balinese dancers performing traditional ceremony",
        destinationId: "1", // Bali
        isFromLibrary: false
      }
    ],
    sellingPoint: `
    <ul>
      <li>Experience the vibrant Balinese culture with visits to ancient temples and traditional villages</li>
      <li>Enjoy stunning landscapes from picturesque rice terraces to pristine beaches</li>
      <li>Savor authentic Balinese cuisine with special dining experiences</li>
      <li>Comfortable accommodations in 4-star hotels throughout your stay</li>
      <li>Private transportation and experienced local guide included</li>
    </ul>
    `
  });

  // --- DAYS & ITINERARY ---
  // Konfigurasi untuk komponen DayActivities yang baru
  const dummyDays = [
    {
      day: 1,
      title: "Day 1: Welcome to the Island of Gods",
      description: `<p>Arrive at Ngurah Rai International Airport where our representative will greet you. Transfer to your hotel in Kuta and enjoy a welcome dinner featuring traditional Balinese cuisine accompanied by a cultural dance performance.</p>`,
      departure: startEnd[0]?.id || "1",
      selectedActivity: "",
      activities: [
        {
          time: "14:00",
          type: 5, // Transportation
          activity: activities.find(a => a.activity_category_id === 5)?.id || "1",
          location: locations[0]?.id || "1",
          notes: "Airport pickup and transfer to hotel"
        },
        {
          time: "16:00",
          type: 3, // Accommodation
          activity: hotels[0]?.id || "1",
          location: locations[1]?.id || "2",
          notes: "Check-in and rest"
        },
        {
          time: "19:00",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "2",
          location: locations[2]?.id || "3",
          notes: "Welcome dinner with traditional dance performance",
          include: true // Menggunakan toggle include untuk meal
        }
      ]
    },
    {
      day: 2,
      title: "Day 2: Cultural Heritage of Ubud",
      description: `<p>Explore the cultural heart of Bali in Ubud. Visit the Sacred Monkey Forest, Ubud Palace, and experience traditional crafts in the surrounding villages. Enjoy lunch at a restaurant overlooking the famous rice terraces.</p>`,
      departure: "",
      selectedActivity: "",
      activities: [
        {
          time: "08:00",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "1",
          location: locations[1]?.id || "2",
          notes: "Breakfast at hotel",
          include: true
        },
        {
          time: "09:30",
          type: 2, // Attraction/Tour
          activity: activities.find(a => a.activity_category_id === 2)?.id || "1",
          location: locations[3]?.id || "4",
          notes: "Guided tour of Sacred Monkey Forest"
        },
        {
          time: "12:30",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "2",
          location: locations[4]?.id || "5",
          notes: "Lunch with rice terrace view",
          include: true
        },
        {
          time: "14:00",
          type: 2, // Attraction/Tour
          activity: activities.find(a => a.activity_category_id === 2)?.id || "3",
          location: locations[5]?.id || "6",
          notes: "Visit traditional art villages - silver crafting and batik making"
        }
      ]
    },
    {
      day: 3,
      title: "Day 3: Temple Exploration",
      description: `<p>Discover Bali's most iconic temples including Tanah Lot and Uluwatu. Learn about Balinese Hinduism and witness the spiritual practices that make this island unique. End the day with a seafood dinner at Jimbaran Bay.</p>`,
      departure: "",
      selectedActivity: "",
      activities: [
        {
          time: "07:30",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "1",
          location: locations[1]?.id || "2",
          notes: "Breakfast at hotel",
          include: true
        },
        {
          time: "09:00",
          type: 2, // Attraction/Tour
          activity: activities.find(a => a.activity_category_id === 2)?.id || "2",
          location: locations[6]?.id || "7",
          notes: "Visit Tanah Lot temple"
        },
        {
          time: "13:00",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "2",
          location: locations[7]?.id || "8",
          notes: "Lunch at local warung",
          include: false // Tidak termasuk dalam paket
        },
        {
          time: "16:00",
          type: 2, // Attraction/Tour
          activity: activities.find(a => a.activity_category_id === 2)?.id || "3",
          location: locations[0]?.id || "1",
          notes: "Uluwatu temple and Kecak dance performance"
        },
        {
          time: "19:00",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "3",
          location: locations[1]?.id || "2",
          notes: "Seafood dinner at Jimbaran Bay",
          include: true
        }
      ]
    },
    {
      day: 4,
      title: "Day 4: Adventure in Paradise",
      description: `<p>Experience the adventurous side of Bali with a white water rafting trip on the Ayung River followed by a visit to the spectacular Tegenungan Waterfall. Afternoon spa treatment to rejuvenate.</p>`,
      departure: "",
      selectedActivity: "",
      activities: [
        {
          time: "07:00",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "1",
          location: locations[1]?.id || "2",
          notes: "Early breakfast at hotel",
          include: true
        },
        {
          time: "08:30",
          type: 2, // Attraction/Tour
          activity: activities.find(a => a.activity_category_id === 2)?.id || "1",
          location: locations[2]?.id || "3",
          notes: "White water rafting adventure"
        },
        {
          time: "13:00",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "2",
          location: locations[3]?.id || "4",
          notes: "Lunch at riverside restaurant",
          include: true
        },
        {
          time: "15:00",
          type: 2, // Attraction/Tour
          activity: activities.find(a => a.activity_category_id === 2)?.id || "2",
          location: locations[4]?.id || "5",
          notes: "Visit Tegenungan Waterfall"
        },
        {
          time: "17:30",
          type: 2, // Attraction/Tour
          activity: activities.find(a => a.activity_category_id === 2)?.id || "3",
          location: locations[1]?.id || "2",
          notes: "Traditional Balinese spa treatment"
        }
      ]
    },
    {
      day: 5,
      title: "Day 5: Farewell Bali",
      description: `<p>Enjoy a leisurely morning with breakfast at the hotel. Last-minute shopping at local markets for souvenirs. Transfer to the airport for your departure flight. Say goodbye to the Island of Gods with unforgettable memories.</p>`,
      departure: "",
      return: startEnd[0]?.id || "1",
      selectedActivity: "",
      activities: [
        {
          time: "08:00",
          type: 4, // Meal/Restaurant
          activity: activities.find(a => a.activity_category_id === 4)?.id || "1",
          location: locations[1]?.id || "2",
          notes: "Breakfast at hotel",
          include: true
        },
        {
          time: "10:00",
          type: 2, // Attraction/Tour
          activity: activities.find(a => a.activity_category_id === 2)?.id || "1",
          location: locations[3]?.id || "4",
          notes: "Shopping at traditional market"
        },
        {
          time: "13:00",
          type: 5, // Transportation
          activity: activities.find(a => a.activity_category_id === 5)?.id || "1",
          location: locations[0]?.id || "1",
          notes: "Transfer to airport for departure"
        }
      ]
    }
  ];

  setDays(dummyDays);

  // --- PRICING TIERS ---
  setPrices([
    {
      startPax: "2",
      endPax: "5",
      price: "3,500,000",
      isUnlimitedMax: false
    },
    {
      startPax: "6",
      endPax: "10",
      price: "3,250,000",
      isUnlimitedMax: false
    },
    {
      startPax: "11",
      endPax: "",
      price: "2,900,000",
      isUnlimitedMax: true
    }
  ]);

  // Mark form as dirty to enable saving
  setFormStatus({ ...formStatus, isDirty: true });
};

// Fungsi untuk memuat data destinasi foto
const loadDestinationPhotos = () => {
  try {
    // Pastikan destinations ada dan valid
    if (!destinations || !Array.isArray(destinations)) {
      console.warn('Destinations data invalid or not an array. Using dummy data.');
      prepareDummyPhotoData();
      return;
    }
    
    // Log untuk debug
    
    // Proses data menggunakan fungsi helper
    const { destinations: processedDestinations, photosByDestination } = processDestinationPhotos(destinations);
        
    // Update state
    setProcessedPhotoData({
      destinations: processedDestinations || [],
      photosByDestination: photosByDestination || {}
    });
  } catch (error) {
    console.error('Error in loadDestinationPhotos:', error);
    // Fallback ke data dummy jika terjadi error
    prepareDummyPhotoData();
  }
};
useEffect(() => {
  loadDestinationPhotos();
}, []);

const prepareDummyPhotoData = () => {
  console.log('Using dummy destination photo data');
  
  const dummyDestinations = [
    { id: "1", name: "Bali" },
    { id: "2", name: "Yogyakarta" },
    { id: "3", name: "Lombok" },
    { id: "4", name: "Bandung" },
    { id: "5", name: "Jakarta" }
  ];
  
  setProcessedPhotoData({
    destinations: dummyDestinations,
    photosByDestination: DUMMY_DESTINATION_PHOTOS
  });
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
            <Button 
              onClick={fillWithDummyData} 
              className="bg-green-600 hover:bg-green-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Fill with Sample Data
            </Button>
            
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
                          { id: 1, name: 'Regular Tour' },
                          { id: 2, name: 'Student Package' }
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
                {processedPhotoData && processedPhotoData.destinations && (
                  <>
                    {/* Cover Photo */}
                    <PhotoSelectionSection 
                      packageInfo={packageInfo}
                      setPackageInfo={setPackageInfo}
                      setFormStatus={setFormStatus}
                      destinations={processedPhotoData.destinations}
                      photosByDestination={processedPhotoData.photosByDestination}
                      type="cover"
                    />
                    
                    {/* Separator */}
                    <div className="h-px w-full bg-gray-200 my-6"></div>
                    
                    {/* Gallery Photos */}
                    <PhotoSelectionSection 
                      packageInfo={packageInfo}
                      setPackageInfo={setPackageInfo}
                      setFormStatus={setFormStatus}
                      destinations={processedPhotoData.destinations}
                      photosByDestination={processedPhotoData.photosByDestination}
                      type="gallery"
                    />
                  </>
                )}
                {(!processedPhotoData || !processedPhotoData.destinations) && (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                    </div>
                    <p className="mt-2 text-gray-600">Loading photo options...</p>
                  </div>
                )}                
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
                                hotelOptions={hotelOptions}
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
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1.5">
                              <Label className="text-sm text-gray-600">Max. Participants</Label>
                              
                              {/* Toggle untuk format unlimited (X+) */}
                              <div className="flex items-center gap-1.5">
                                <label 
                                  htmlFor={`unlimited-${index}`} 
                                  className="text-xs font-medium cursor-pointer text-blue-600"
                                >
                                  Unlimited (X+)
                                </label>
                                <input
                                  type="checkbox"
                                  id={`unlimited-${index}`}
                                  checked={price.isUnlimitedMax}
                                  onChange={(e) => {
                                    const updatedPrices = [...prices];
                                    updatedPrices[index].isUnlimitedMax = e.target.checked;
                                    if (e.target.checked) {
                                      // Jika dicentang, kosongkan endPax karena akan menggunakan format X+
                                      updatedPrices[index].endPax = '';
                                    }
                                    setPrices(updatedPrices);
                                    setFormStatus({ ...formStatus, isDirty: true });
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            
                            {price.isUnlimitedMax ? (
                              <div className="flex h-10 rounded-md border border-input bg-gray-100 px-3 py-2 text-center items-center justify-center text-muted-foreground">
                                <span className="text-sm font-medium">{price.startPax}+</span>
                              </div>
                            ) : (
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
                            )}
                          </div>
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
                  
                  {/* Tombol Save tetap sama */}
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

export default Form;