import React, { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SearchableSelect from '@/Components/SearchableSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, ImagePlus, ChevronRight, ChevronDown, Bold, Italic, List } from 'lucide-react';


type Photo = {
  preview: string;
  caption: string;
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

// Dummy Data untuk Select Options
const DUMMY_DATA = {
  attraction: [
    { id: 1, name: 'Bromo Sunrise Tour' },
    { id: 2, name: 'Ijen Crater Tour' },
    { id: 3, name: 'Malang City Tour' }
  ],
  accommodation: [
    { id: 1, name: 'Check In' },
    { id: 2, name: 'Check Out' }
  ],
  meals: [
    { id: 1, name: 'Breakfast' },
    { id: 2, name: 'Lunch' },
    { id: 3, name: 'Dinner' }
  ],
  transport: [
    { id: 1, name: 'By Car' },
    { id: 2, name: 'By Bus' },
    { id: 3, name: 'By Train' }
  ],
  locations: [
    { id: 1, name: 'Gubuk Mang Engking' },
    { id: 2, name: 'Baratha Hotel' },
    { id: 3, name: 'Ijen Crater' },
    { id: 4, name: 'Bromo Mountain' }
  ]
};
// WYSIWYG Editor 
const QuillEditor = ({ content, onChange }: { content: string; onChange: (content: string) => void }) => {
    return (
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        className="h-[200px] mb-12" // tambahkan margin bottom untuk toolbar
      />
    );
  };  
  // Searchable Select Component
  type SearchableSelectProps = {
    options: { id: number | string; name: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  
  // Helper function untuk format currency
  const formatCurrency = (value: string): string => {
    const number = parseInt(value.replace(/\D/g, ''), 10) || 0;
    return number.toLocaleString('id-ID');
  };
  const Create = () => {
    // State Management
    const [activeTab, setActiveTab] = useState('package-info');
    const [categoryOpen, setCategoryOpen] = useState(false);    
    const [activityTypeOpen, setActivityTypeOpen] = useState(false);
    const [activityOpen, setActivityOpen] = useState<{[key: string]: boolean}>({});
    const [locationOpen, setLocationOpen] = useState<{[key: string]: boolean}>({});
    const [collapsedDays, setCollapsedDays] = useState({});
    const [collapsedActivities, setCollapsedActivities] = useState<{[key: string]: boolean}>({});

    
    // Tambahkan fungsi toggle
    const toggleDay = (dayIndex) => {
      setCollapsedDays(prev => ({
        ...prev,
        [dayIndex]: !prev[dayIndex]
      }));
    };
    
    const toggleActivity = (dayIndex, activityType) => {
      const key = `${dayIndex}-${activityType}`;
      setCollapsedActivities(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };
    const toggleActivityCollapse = (dayIndex: number, actIndex: number) => {
        const key = `${dayIndex}-${actIndex}`;
        setCollapsedActivities(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };    
    
    const [packageInfo, setPackageInfo] = useState<PackageInfo>({
      title: '',
      category: 'regular',
      duration: 1,
      departure: '',
      return: '',
      coverPhoto: null,
      otherPhotos: [],
      sellingPoint: ''
    });
  
    const [days, setDays] = useState<Day[]>([{
      day: 1,
      title: '',
      description: '',
      departure: '',
      selectedActivity: '',
      activities: []
    }]);
  
    const [prices, setPrices] = useState<Price[]>([{
      startPax: '',
      endPax: '',
      price: ''
    }]);
  
    // Photo Handler Functions
    const handlePhotoUpload = (type: 'cover' | 'other', e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
  
      const file = files[0];
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        if (type === 'cover') {
          setPackageInfo({
            ...packageInfo,
            coverPhoto: {
              preview: result,
              caption: ''
            }
          });
        } else {
          setPackageInfo({
            ...packageInfo,
            otherPhotos: [
              ...packageInfo.otherPhotos,
              {
                preview: result,
                caption: ''
              }
            ]
          });
        }
      };
  
      reader.readAsDataURL(file);
    };
  
    const updatePhotoCaption = (type: 'cover' | 'other', index: number, caption: string) => {
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
    };
  
    const removePhoto = (type: 'cover' | 'other', index: number) => {
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
    };
  
    // Activity Handler Functions
    const handleActivityTypeChange = (dayIndex: number, value: string) => {
        const updatedDays = [...days];
        
        // Tambahkan aktivitas baru di akhir array activities
        updatedDays[dayIndex].activities.push({
            type: value,
            activity: '',
            time: '',
            location: '',
            notes: ''
        });
        
        setDays(updatedDays);
    };
    
    const removeActivity = (dayIndex: number, activityIndex: number) => {
        const updatedDays = [...days];
        updatedDays[dayIndex].activities.splice(activityIndex, 1);
        setDays(updatedDays);
    };

    // Price Handler Functions
    const addPrice = () => {
      setPrices([...prices, { startPax: '', endPax: '', price: '' }]);
    };
  
    const removePrice = (index: number) => {
      const newPrices = [...prices];
      newPrices.splice(index, 1);
      setPrices(newPrices);
    };
  
    // Duration Effect
    useEffect(() => {
      const duration = packageInfo.duration;
      if (duration > days.length) {
        const newDays = [...days];
        for (let i = days.length + 1; i <= duration; i++) {
          newDays.push({
            day: i,
            title: '',
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
    }, [packageInfo.duration]);
  
    // Auto update departure and return for first and last day
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
    return (
        <div className="max-w-6xl mx-auto p-4">
            <Tabs className="bg-white p-6" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                <TabsTrigger value="package-info">Package Info</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="prices">Prices</TabsTrigger>
                </TabsList>
        
                <TabsContent value="package-info">
                <Card>
                    <CardHeader>
                    <CardTitle>Package Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <Label>Package Title</Label>
                        <Input 
                            value={packageInfo.title}
                            onChange={(e) => setPackageInfo({...packageInfo, title: e.target.value})}
                        />
                        </div>
                        <div>
                        <Label>Category</Label>
                        <SearchableSelect
                            options={[
                            { id: 'regular', name: 'Regular' },
                            { id: 'student', name: 'Student' }
                            ]}
                            value={packageInfo.category}
                            onChange={(value) => setPackageInfo({...packageInfo, category: value})}
                            placeholder="Select Category"
                            open={categoryOpen}
                            setOpen={setCategoryOpen}
                            displayKey="name"
                        />
                          </div>
                    </div>
        
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                        <Label>Duration (days)</Label>
                        <Input 
                            type="number"
                            min="1"
                            value={packageInfo.duration}
                            onChange={(e) => setPackageInfo({...packageInfo, duration: parseInt(e.target.value) || 1})}
                        />
                        </div>
                        <div>
                        <Label>Departure Location</Label>
                        <Input 
                            value={packageInfo.departure}
                            onChange={(e) => setPackageInfo({...packageInfo, departure: e.target.value})}
                            placeholder="e.g. Surabaya"
                        />
                        </div>
                        <div>
                        <Label>Return Location</Label>
                        <Input 
                            value={packageInfo.return}
                            onChange={(e) => setPackageInfo({...packageInfo, return: e.target.value})}
                            placeholder="e.g. Malang"
                        />
                        </div>
                    </div>
        
                    {/* Photos Section */}
                    <div className="space-y-4">
                        {/* Cover Photo */}
                        <div>
                        <Label>Cover Photo</Label>
                        <div className="border rounded p-4 space-y-2">
                            <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="cover-photo"
                            onChange={(e) => handlePhotoUpload('cover', e)}
                            />
                            <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('cover-photo')?.click()}
                            >
                            <ImagePlus className="w-4 h-4 mr-2" />
                            Upload Cover Photo
                            </Button>
                            
                            {packageInfo.coverPhoto && (
                            <div className="mt-2">
                                <img 
                                src={packageInfo.coverPhoto.preview} 
                                alt="Cover"
                                className="h-50 object-cover mb-2"
                                />
                                <Input
                                placeholder="Add caption"
                                value={packageInfo.coverPhoto.caption}
                                onChange={(e) => updatePhotoCaption('cover', 0, e.target.value)}
                                className="mb-2"
                                />
                                <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => removePhoto('cover', 0)}
                                >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                                </Button>
                            </div>
                            )}
                        </div>
                        </div>
        
                        {/* Other Photos */}
                        <div>
                        <Label>Other Photos</Label>
                        <div className="border rounded p-4 space-y-2">
                            <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            id="other-photos"
                            onChange={(e) => handlePhotoUpload('other', e)}
                            />
                            <Button 
                            variant="outline" 
                            onClick={() => document.getElementById('other-photos')?.click()}
                            >
                            <ImagePlus className="w-4 h-4 mr-2" />
                            Add Other Photos
                            </Button>
        
                            <div className="grid grid-cols-2 gap-4 mt-2">
                            {packageInfo.otherPhotos.map((photo, index) => (
                                <div key={index} className="border rounded p-2">
                                <img 
                                    src={photo.preview} 
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-40 object-cover mb-2"
                                />
                                <Input
                                    placeholder="Add caption"
                                    value={photo.caption}
                                    onChange={(e) => updatePhotoCaption('other', index, e.target.value)}
                                    className="mb-2"
                                />
                                <Button 
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removePhoto('other', index)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                </Button>
                                </div>
                            ))}
                            </div>
                        </div>
                        </div>
                    </div>
        
                    {/* Selling Point */}
                    <div>
                        <Label>Selling Point</Label>
                        <QuillEditor
                            content={packageInfo.sellingPoint}
                            onChange={(content) => setPackageInfo({...packageInfo, sellingPoint: content})}
                        />
                    </div>
                    </CardContent>
                </Card>
                </TabsContent>
        
                <TabsContent value="itinerary">
                    <Card>
                        <CardHeader>
                        <CardTitle>Itinerary</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-4">
                            {days.map((day, dayIndex) => (
                            <div key={dayIndex} className="border rounded-lg">
                                {/* Day Header */}
                                <div 
                                className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                                onClick={() => toggleDay(dayIndex)}
                                >
                                <div className="flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                                    {day.day}
                                    </div>
                                    <Input 
                                    placeholder="Day Title"
                                    value={day.title}
                                    onChange={(e) => {
                                        const updatedDays = [...days];
                                        updatedDays[dayIndex].title = e.target.value;
                                        setDays(updatedDays);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-64"
                                    />
                                </div>
                                <ChevronDown 
                                    className={`w-5 h-5 transition-transform ${collapsedDays[dayIndex] ? 'rotate-180' : ''}`}
                                />
                                </div>

                                {/* Day Content */}
                                {!collapsedDays[dayIndex] && (
                                    <div className="p-4 space-y-4">
                                        {/* Description */}
                                        <div>
                                            <Label>Description</Label>
                                            <QuillEditor
                                                content={day.description}
                                                onChange={(content) => {
                                                    const updatedDays = [...days];
                                                    updatedDays[dayIndex].description = content;
                                                    setDays(updatedDays);
                                                }}
                                            />
                                        </div>

                                        {/* Activities List */}
                                        <div className="space-y-4">
                                        {day.activities.map((activity, actIndex) => {
                                            const key = `${dayIndex}-${actIndex}`;
                                            const isCollapsed = collapsedActivities[key] ?? false;

                                            return (
                                                <div key={actIndex} className="border rounded">
                                                    <div 
                                                        className="flex items-center justify-between p-2 cursor-pointer bg-gray-50 capitalize"
                                                        onClick={(e) => {
                                                            // Mencegah event propagation hanya untuk collapsing
                                                            if (e.target === e.currentTarget) {
                                                                toggleActivityCollapse(dayIndex, actIndex);
                                                            }
                                                        }}
                                                    >
                                                        {activity.type}
                                                        <ChevronDown 
                                                            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                                        />
                                                    </div>
                                                    
                                                    {!isCollapsed && (
                                                        <div className="p-2" onClick={(e) => e.stopPropagation()}>
                                                            <div className="grid grid-cols-12 gap-4 mb-2">
                                                                <div className="col-span-2">
                                                                    <Input 
                                                                        type="time"
                                                                        value={activity.time}
                                                                        onChange={(e) => {
                                                                            const updatedDays = [...days];
                                                                            updatedDays[dayIndex].activities[actIndex].time = e.target.value;
                                                                            setDays(updatedDays);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-4">
                                                                <SearchableSelect
        options={(() => {
            console.log('Activity Options:', DUMMY_DATA[activity.type] || []);
            return DUMMY_DATA[activity.type] || [];
        })()}
        value={activity.activity}
        onChange={(value) => {
            console.log('Selected Value:', value);
            const updatedDays = [...days];
            updatedDays[dayIndex].activities[actIndex].activity = value;
            setDays(updatedDays);
        }}
        placeholder="Select Activity"
        displayKey="name"
        filterType={activity.type}
    />
                                                                </div>
                                                                <div className="col-span-4">
                                                                    <SearchableSelect
                                                                        options={DUMMY_DATA.locations}
                                                                        value={activity.location}
                                                                        onChange={(value) => {
                                                                            const updatedDays = [...days];
                                                                            updatedDays[dayIndex].activities[actIndex].location = value;
                                                                            setDays(updatedDays);
                                                                        }}
                                                                        placeholder="Select Location"
                                                                        displayKey="name"
                                                                        filterType="location"
                                                                        // Pastikan prop open dan setOpen tersedia
                                                                        open={locationOpen[`${dayIndex}-${actIndex}`] || false}
                                                                        setOpen={(value) => {
                                                                            setLocationOpen(prev => ({
                                                                                ...prev,
                                                                                [`${dayIndex}-${actIndex}`]: value
                                                                            }));
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeActivity(dayIndex, actIndex)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                                    </Button>
                                                                </div>

                                                                {/* Notes */}
                                                                <div className="col-span-12 mt-2">
                                                                    <Label>Notes</Label>
                                                                    <textarea
                                                                        className="w-full p-2 border rounded-md min-h-[100px]"
                                                                        value={activity.notes}
                                                                        onChange={(e) => {
                                                                            const updatedDays = [...days];
                                                                            updatedDays[dayIndex].activities[actIndex].notes = e.target.value;
                                                                            setDays(updatedDays);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        </div>
                                        {/* Add Activity Button */}
                                        <div className="mt-4">
                                            <SearchableSelect
                                                options={[
                                                    { id: 'attraction', name: 'Attraction' },
                                                    { id: 'meals', name: 'Meals' },
                                                    { id: 'transport', name: 'Transport' },
                                                    { id: 'accommodation', name: 'Accommodation' }
                                                ]}
                                                value=""
                                                onChange={(value) => handleActivityTypeChange(dayIndex, value)}
                                                placeholder="Add Activity"
                                                open={activityTypeOpen}
                                                setOpen={setActivityTypeOpen}
                                                displayKey="name"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            ))}
                        </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="prices">
                    <Card>
                        <CardHeader>
                        <CardTitle>Prices</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        {prices.map((price, index) => (
                            <div key={index} className="grid grid-cols-7 gap-4 items-center">
                            <div className="col-span-2">
                                <Input 
                                type="number"
                                placeholder="Start Pax"
                                value={price.startPax}
                                onChange={(e) => {
                                    const updatedPrices = [...prices];
                                    updatedPrices[index].startPax = e.target.value;
                                    setPrices(updatedPrices);
                                }}
                                />
                            </div>
                            <div className="col-span-2">
                                <Input 
                                type="number"
                                placeholder="End Pax"
                                value={price.endPax}
                                onChange={(e) => {
                                    const updatedPrices = [...prices];
                                    updatedPrices[index].endPax = e.target.value;
                                    setPrices(updatedPrices);
                                }}
                                />
                            </div>
                            <div className="col-span-2">
                                <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    IDR
                                </span>
                                <Input 
                                    className="pl-12"
                                    value={price.price}
                                    onChange={(e) => {
                                    const updatedPrices = [...prices];
                                    updatedPrices[index].price = formatCurrency(e.target.value);
                                    setPrices(updatedPrices);
                                    }}
                                />
                                </div>
                            </div>
                            <div className="col-span-1">
                                <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePrice(index)}
                                >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                            </div>
                        ))}
                        <Button 
                            variant="outline"
                            onClick={addPrice}
                            className="w-full"
                        >
                            Add Price Range
                        </Button>
                        <div className="mt-6">
                            <Button 
                                className="w-full"
                                onClick={() => {
                                // Handle form submission
                                console.log({
                                    packageInfo,
                                    days,
                                    prices
                                });
                                }}
                            >
                                Save Package
                            </Button>
                        </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Create;