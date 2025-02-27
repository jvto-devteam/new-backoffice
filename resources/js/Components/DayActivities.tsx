import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Search,Trash2, ImagePlus, ChevronRight, ChevronDown, PlusCircle, 
    Calendar, Clock, MapPin, Info, FileEdit, DollarSign, 
    Save, Camera, Sun, Coffee, Bus, Hotel, Briefcase, 
    AlertCircle, CheckCircle2,Plus,PlaneLanding,PlaneTakeoff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ActivityTypeDropdown from '@/components/ActivityTypeDropdown';
import AddBetweenButton from '@/components/AddBetweenButton';
import SearchableSelect from '@/components/SearchableSelect';


const DUMMY_DATA = {
    attraction: [
      { id: 1, name: 'Bromo Sunrise Tour', type : 'activity' },
      { id: 2, name: 'Ijen Crater Tour', type : 'activity' },
      { id: 3, name: 'Malang City Tour', type : 'activity' }
    ],
    accommodation: [
      { id: 1, name: 'Check In', type : 'activity' },
      { id: 2, name: 'Check Out', type : 'activity' }
    ],
    meals: [
      { id: 1, name: 'Breakfast', type : 'activity' },
      { id: 2, name: 'Lunch', type : 'activity' },
      { id: 3, name: 'Dinner', type : 'activity' }
    ],
    transport: [
      { id: 1, name: 'By Car', type : 'activity' },
      { id: 2, name: 'By Bus', type : 'activity' },
      { id: 3, name: 'By Train', type : 'activity' }
    ],
    locations: [
      { id: 1, name: 'Gubuk Mang Engking', type: 'location' },
      { id: 2, name: 'Baratha Hotel', type: 'location' },
      { id: 3, name: 'Ijen Crater', type: 'location' },
      { id: 4, name: 'Bromo Mountain', type: 'location' },
      { id: 5, name: 'Gubuk Mang Engking', type: 'location' },
      { id: 6, name: 'Baratha Hotel', type: 'location' },
      { id: 7, name: 'Ijen Crater', type: 'location' },
      { id: 8, name: 'Bromo Mountain', type: 'location' }
    ]
  };
// Helper untuk mendapatkan ikon berdasarkan tipe aktivitas
const getActivityIcon = (type) => {
    switch (type) {
      case 2: return <Sun className="h-5 w-5 text-amber-500" />;
      case 4: return <Coffee className="h-5 w-5 text-orange-500" />;
      case 5: return <Bus className="h-5 w-5 text-blue-500" />;
      case 3: return <Hotel className="h-5 w-5 text-indigo-500" />;
      default: return <Briefcase className="h-5 w-5 text-gray-500" />;
    }
  };

// TimelineItem untuk aktivitas
const TimelineItem = ({ 
    activity, 
    dayIndex, 
    actIndex, 
    removeActivity, 
    updateActivity, 
    addActivityAfter,  // Fungsi baru untuk menambahkan aktivitas
    locations, 
    activityOptions,
    activityTypes
  }) => {    
    
    
    const [isOpen, setIsOpen] = useState(false);
    const [activityOpen, setActivityOpen] = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);
    const addButtonRef = useRef(null);

    const activityName = activityTypes.find((type) => type.id === activity.type)?.name || 'Unknown';
  
    return (
      <div className="relative pl-8 pb-4 pt-2 group">
        {/* Timeline vertical line */}
        <div className="absolute top-0 left-3 w-0.5 h-full bg-gray-200"></div>
        
        {/* Timeline dot */}
        <div className="absolute top-3 left-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 z-10"></div>
        
        {/* Add button yang hanya muncul saat hover */}
        <div className="absolute left-0 top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <div ref={addButtonRef}>
            <Button
              size="sm"
              variant="ghost"
              className="h-[25px] w-[25px] p-0 rounded-[100%] bg-blue-100 hover:bg-blue-200 border border-blue-300"
              onClick={(e) => {
                e.stopPropagation();
                if (addActivityAfter) {
                  addActivityAfter(dayIndex, actIndex + 1, addButtonRef);
                }
              }}
            >
                <div>
                  <Plus className="h-[9px] w-[9px] text-blue-600" />
                </div>
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer bg-gray-50 rounded-t-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              {getActivityIcon(activity.type)}
              <span className="font-medium text-gray-700 capitalize">{activityName}</span>
              {activity.time && (
                <Badge variant="outline" className="ml-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {activity.time}
                </Badge>
              )}
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeActivity(dayIndex, actIndex);
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-12 gap-4">
                    {/* Form fields */}
                    <div className="col-span-12 sm:col-span-3">
                      <Label htmlFor={`time-${dayIndex}-${actIndex}`} className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-500" /> Time
                      </Label>
                      <Input 
                        id={`time-${dayIndex}-${actIndex}`}
                        type="time"
                        value={activity.time}
                        onChange={(e) => {
                          updateActivity(dayIndex, actIndex, 'time', e.target.value);
                        }}
                        className="focus:ring-blue-500 block"
                      />
                    </div>
                    
                    <div className="col-span-12 sm:col-span-4">
                      <Label htmlFor={`activity-${dayIndex}-${actIndex}`} className="flex items-center gap-2 mb-2">
                        <FileEdit className="h-4 w-4 text-gray-500" /> Activity
                      </Label>
                      <SearchableSelect
                        options={activityOptions}
                        value={activity.activity}
                        onChange={(value) => {
                          updateActivity(dayIndex, actIndex, 'activity', value);
                        }}
                        placeholder="Select Activity"
                        displayKey="name"
                        open={activityOpen}
                        setOpen={setActivityOpen}
                      />
                    </div>
                    
                    <div className="col-span-12 sm:col-span-5">
                      <Label htmlFor={`location-${dayIndex}-${actIndex}`} className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" /> Location
                      </Label>
                      <SearchableSelect
                        options={locations}
                        value={activity.location}
                        onChange={(value) => {
                          updateActivity(dayIndex, actIndex, 'location', value);
                        }}
                        placeholder="Select Location"
                        displayKey="name"
                        open={locationOpen}
                        setOpen={setLocationOpen}
                      />
                    </div>
                    
                    <div className="col-span-12 mt-2">
                      <Label htmlFor={`notes-${dayIndex}-${actIndex}`} className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-gray-500" /> Notes
                      </Label>
                      <Textarea
                        id={`notes-${dayIndex}-${actIndex}`}
                        placeholder="Add additional notes, instructions, or details about this activity"
                        className="min-h-[100px] focus:ring-blue-500 !text-lg"
                        value={activity.notes}
                        onChange={(e) => {
                          updateActivity(dayIndex, actIndex, 'notes', e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };
// Komponen utama DayActivities
const DayActivities = ({ day,locations,activities, dayIndex, updateDay, formStatus, setFormStatus,activityTypes,departure,returnDay,numbOfDay }) => {
    
    // State untuk dropdown
    const [addActivityDropdown, setAddActivityDropdown] = useState(false);
    const [addFirstActivityDropdown, setAddFirstActivityDropdown] = useState(false);
    const [addInlineDropdown, setAddInlineDropdown] = useState({ isOpen: false, position: -1 });
    
    // Refs untuk positioning
    const addActivityButtonRef = useRef(null);
    const addFirstActivityButtonRef = useRef(null);
    const addInlineButtonRef = useRef(null);
    
    // Fungsi untuk menambahkan aktivitas baru
    const handleAddActivity = (dayIdx, activityType, position = -1) => {
      // Tutup semua dropdown
      setAddActivityDropdown(false);
      setAddFirstActivityDropdown(false);
      setAddInlineDropdown({ isOpen: false, position: -1 });
      
      // Buat aktivitas baru
      const newActivity = {
        type: activityType,
        activity: '',
        time: '',
        location: '',
        notes: ''
      };
      
      // Update day dengan aktivitas baru di posisi tertentu
      const updatedActivities = [...day.activities];
      
      if (position === -1 || position >= updatedActivities.length) {
        // Tambahkan di akhir jika posisi tidak ditentukan
        updatedActivities.push(newActivity);
      } else {
        // Tambahkan di posisi yang ditentukan
        updatedActivities.splice(position, 0, newActivity);
      }
      
      const updatedDay = {
        ...day,
        activities: updatedActivities
      };
      
      // Panggil function update day dari parent
      updateDay(dayIdx, updatedDay);
    };
    
    // Fungsi untuk menambahkan aktivitas setelah aktivitas tertentu
    const handleAddActivityAfter = (dayIdx, position, buttonRef) => {
      // Simpan referensi buttonRef untuk positioning dropdown
      addInlineButtonRef.current = buttonRef.current;
      
      // Set state untuk membuka dropdown
      setAddInlineDropdown({
        isOpen: true,
        position: position
      });
      
      // Tutup dropdown lain
      setAddActivityDropdown(false);
      setAddFirstActivityDropdown(false);
    };
    const removeActivity = (dayIdx, activityIndex) => {
        if (dayIdx !== dayIndex) return;
        
        const updatedDay = {
          ...day,
          activities: day.activities.filter((_, index) => index !== activityIndex)
        };
        
        updateDay(dayIdx, updatedDay);
        setFormStatus({ ...formStatus, isDirty: true });
      };
      
      const updateActivity = (dayIdx, actIndex, field, value) => {
        if (dayIdx !== dayIndex) return;
        
        const updatedActivities = [...day.activities];
        updatedActivities[actIndex] = {
          ...updatedActivities[actIndex],
          [field]: value
        };
        
        const updatedDay = {
          ...day,
          activities: updatedActivities
        };
        
        updateDay(dayIdx, updatedDay);
        setFormStatus({ ...formStatus, isDirty: true });
      };    
    
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-base font-medium">Activities</Label>
          
          {/* Add Activity Button */}
          <div className="relative" ref={addActivityButtonRef}>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1.5 text-sm border-blue-200 hover:border-blue-500"
              onClick={() => {
                setAddActivityDropdown(!addActivityDropdown);
                // Pastikan dropdown lain tertutup
                setAddFirstActivityDropdown(false);
                setAddInlineDropdown({ isOpen: false, position: -1 });
              }}
            >
              <PlusCircle className="h-4 w-4 text-blue-600" />
              Add Activity
            </Button>
          </div>
        </div>
        
        {/* Activities List or Empty State */}
        <div className="relative">
          {day.activities.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8 text-gray-400" />
                <p className="text-gray-500">No activities added yet</p>
                
                {/* Add First Activity Button */}
                <div className="relative mt-2" ref={addFirstActivityButtonRef}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setAddFirstActivityDropdown(!addFirstActivityDropdown);
                      // Pastikan dropdown lain tertutup
                      setAddActivityDropdown(false);
                      setAddInlineDropdown({ isOpen: false, position: -1 });
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add First Activity
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0 pb-4">
              <AnimatePresence>
                {day.activities.map((activity, actIndex) => (
                    <>
                    {dayIndex == 0 && actIndex == 0 && (
                        <>
                            <div className="relative pl-8 pb-4 pt-2 group">
                                {/* Timeline vertical line */}
                                <div className="absolute top-0 left-3 w-0.5 h-full bg-gray-200"></div>
                                
                                {/* Timeline dot */}
                                <div className="absolute top-3 left-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 z-10"></div>
                                <div className="flex items-center gap-3">
                                    <PlaneLanding className="text-green-600"/>
                                    <span className="font-medium text-gray-700">Departure at {departure} </span>
                                </div>
                            </div>
                        </>
                    )}
                    <TimelineItem 
                        key={`${dayIndex}-${actIndex}`}
                        activity={activity}
                        dayIndex={dayIndex}
                        actIndex={actIndex}
                        removeActivity={removeActivity}
                        updateActivity={updateActivity}
                        addActivityAfter={handleAddActivityAfter}
                        locations={locations}
                        activityOptions={activities.filter((item) => item.activity_category_id === activity.type)}
                        activityTypes={activityTypes}
                    />
                    </>
                ))}
                {(dayIndex+1) == numbOfDay && (
                    <>
                        <div className="relative pl-8 pb-4 pt-2 group">
                            {/* Timeline vertical line */}
                            <div className="absolute top-0 left-3 w-0.5 h-full bg-gray-200"></div>
                            
                            {/* Timeline dot */}
                            <div className="absolute top-3 left-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 z-10"></div>
                            <div className="flex items-center gap-3">
                                <PlaneTakeoff className="text-orange-600"/>
                                <span className="font-medium text-gray-700">Return to {returnDay} </span>
                            </div>
                        </div>
                    </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        {/* Activity Type Dropdowns - Di-render menggunakan Portal */}
        <ActivityTypeDropdown
          isOpen={addActivityDropdown}
          onClose={() => setAddActivityDropdown(false)}
          onSelect={(dayIdx, type) => handleAddActivity(dayIdx, type)}
          dayIndex={dayIndex}
          triggerRef={addActivityButtonRef}
          position="bottom"
        activityTypes={activityTypes}          
        />
        
        <ActivityTypeDropdown
          isOpen={addFirstActivityDropdown}
          onClose={() => setAddFirstActivityDropdown(false)}
          onSelect={(dayIdx, type) => handleAddActivity(dayIdx, type, 0)}
          dayIndex={dayIndex}
          triggerRef={addFirstActivityButtonRef}
          position="bottom"
        activityTypes={activityTypes}          
        />
        
        {addInlineDropdown.isOpen && (
          <ActivityTypeDropdown
            isOpen={addInlineDropdown.isOpen}
            onClose={() => setAddInlineDropdown({ isOpen: false, position: -1 })}
            onSelect={(dayIdx, type) => handleAddActivity(dayIdx, type, addInlineDropdown.position)}
            dayIndex={dayIndex}
            triggerRef={{ current: addInlineButtonRef.current }}
            position="bottom"
        activityTypes={activityTypes}            
          />
        )}
      </div>
    );
  };

export default DayActivities;