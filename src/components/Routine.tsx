import React, { useState } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import { 
  formatOrbitalDate, 
  formatGregorianDate, 
  getDayName,
  DayRoutine
} from '../utils/routineLogic';
import { isCurrentTime, isCurrentActivity } from '../utils/routineLogic';
import { useAuth } from '../context/AuthContext';
import { useAuthRefresh } from '../hooks/useAuthRefresh';
import './Routine.css';
import { buildApiUrl } from '../utils/api';

// Interface for processed routine data with row spans
interface ProcessedRoutine {
  time: string;
  activity: string;
  category: string;
  rowSpan: number;
  isExtended: boolean;
}

interface RoutineData {
  day: number;
  routines: {
    time: string;
    activity: string;
    category: string;
  }[];
}

interface ApiResponse {
  list: {
    id: number;
    name: string;
    category: string;
    items_json: RoutineData[];
  };
  routines?: DayRoutine[]; // Added for user routines response
}

interface EditFormData {
  activity: string;
  category: string;
}

interface RowEditData {
  time: string;
  activity: string;
  category: string;
  newTime: string; // Track intended new time for moving activities
}

const Routine: React.FC = () => {
  const [currentDate] = useState<OrbitalDate>(orbitalCalendar.getCurrentOrbitalDate());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [routineData, setRoutineData] = useState<DayRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, authToken, currentUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<{ day: number; time: string } | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({ activity: '', category: '' });
  const [rowEditData, setRowEditData] = useState<RowEditData>({ time: '', activity: '', category: '', newTime: '' });
  
  // Store pending changes during edit mode
  const [pendingChanges, setPendingChanges] = useState<{
    [key: string]: { activity: string; category: string }
  }>({});
  
  // Track newly added time slots (not yet saved)
  const [addedTimeSlots, setAddedTimeSlots] = useState<string[]>([]);
  
  // Track time slots marked for deletion (not yet saved)
  const [deletedTimeSlots, setDeletedTimeSlots] = useState<string[]>([]);
  
  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Track the original deleted timeslots to detect changes
  const [originalDeletedTimeSlots, setOriginalDeletedTimeSlots] = useState<string[]>([]);

  // Calendar mode toggle state
  const [isGregorianMode, setIsGregorianMode] = useState(true);
  
  // Track original calendar mode to detect changes
  const [originalCalendarMode, setOriginalCalendarMode] = useState(true);

  // Day overview state - stores custom descriptions with categories for each day
  const [dayOverviews, setDayOverviews] = useState<{ [key: number]: Array<{ text: string; category: string }> }>({});
  
  // Track original day overviews to detect changes
  const [originalDayOverviews, setOriginalDayOverviews] = useState<{ [key: number]: Array<{ text: string; category: string }> }>({});
  
  // User categories state - stores custom categories created by the user
  const [userCategories, setUserCategories] = useState<Array<{ name: string; color: string }>>([]);
  
  // Track original user categories to detect changes
  const [originalUserCategories, setOriginalUserCategories] = useState<Array<{ name: string; color: string }>>([]);
  
  // Category management modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#e67e22'); // Default to first available color
  
  // Predefined colors for user categories (completely different from system categories)
  const availableColors = [
    '#000000', // Black (unique)
    '#ffffff', // White (unique)
    '#32cd32', // Lime green (different from meals dark green)
    '#f1c40f', // Sunflower (unique yellow)
    '#e91e63', // Pink (unique)
    '#795548', // Brown (unique)
    '#ff6b6b', // Light coral (unique)
    '#4ecdc4', // Turquoise (unique)
  ];

  // Load user settings from database
  const loadUserSettings = async () => {
    try {
      if (!currentUser || !authToken) {
        // No current user or auth token found, skipping user settings load
        return;
      }

      const userId = currentUser.id;
      
      if (!userId) {
        // No valid user ID found in current user data
        return;
      }

      // Loading user settings for userId

      const response = await fetch(buildApiUrl(`/api/users/${userId}/settings`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Settings load response status

      if (response.ok) {
        const data = await response.json();
        // Settings load response data
        if (data.settings && data.settings.calendarMode) {
          // Setting calendar mode from loaded settings
          setIsGregorianMode(data.settings.calendarMode === 'gregorian');
          setOriginalCalendarMode(data.settings.calendarMode === 'gregorian'); // Initialize original
        } else {
          // No calendar mode setting found in loaded settings
        }

        // Load day overviews if they exist
        if (data.settings && data.settings.dayOverviews) {
          try {
            const loadedOverviews = JSON.parse(data.settings.dayOverviews);
            setDayOverviews(loadedOverviews);
            setOriginalDayOverviews(loadedOverviews);
          } catch (error) {
            console.error('Error parsing day overviews:', error);
            // If parsing fails, set empty overviews
            setDayOverviews({});
            setOriginalDayOverviews({});
          }
        }
        
        // Load user categories if they exist
        if (data.settings && data.settings.userCategories) {
          try {
            const loadedCategories = JSON.parse(data.settings.userCategories);
            setUserCategories(loadedCategories);
            setOriginalUserCategories(loadedCategories);
          } catch (error) {
            console.error('Error parsing user categories:', error);
            setUserCategories([]);
            setOriginalUserCategories([]);
          }
        } else {
          setUserCategories([]);
          setOriginalUserCategories([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load user settings. Status:', response.status, 'Response:', errorText);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  // Save user settings to database
  const saveUserSettings = async (settings: { [key: string]: string }) => {
    try {
      if (!currentUser || !authToken) {
        console.error('No current user or auth token found');
        return;
      }

      const userId = currentUser.id;
      
      if (!userId) {
        console.error('No valid user ID found in current user data');
        return;
      }

      // Attempting to save user settings

      const response = await fetch(buildApiUrl(`/api/users/${userId}/settings`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });

      // Settings save response status and headers

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save user settings. Status:', response.status, 'Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      await response.json();
      // Settings saved successfully
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error; // Re-throw so the caller can handle it
    }
  };

  // Fetch routine data when authentication state changes
  useAuthRefresh(() => {
    if (isLoggedIn) {
      fetchRoutineData(true);
      loadUserSettings();
    } else {
      // Clear all data when logged out
      setRoutineData([]);
      setLoading(false);
      setIsEditMode(false);
      setEditingCell(null);
      setEditingRow(null);
      setEditFormData({ activity: '', category: '' });
      setRowEditData({ time: '', activity: '', category: '', newTime: '' });
      setPendingChanges({});
      setAddedTimeSlots([]);
      setDeletedTimeSlots([]);
      setHasUnsavedChanges(false);
      setOriginalDeletedTimeSlots([]);
      setIsGregorianMode(true);
      setOriginalCalendarMode(true);
      setDayOverviews({});
      setOriginalDayOverviews({});
      setUserCategories([]);
      setOriginalUserCategories([]);
    }
  }, [isLoggedIn]);

  // Automatically update hasUnsavedChanges when any changes are made
  React.useEffect(() => {
    // Check if there are actual changes in deleted timeslots (not just if they exist)
    const hasDeletedTimeslotChanges = deletedTimeSlots.length !== originalDeletedTimeSlots.length || 
      deletedTimeSlots.some((time: string) => !originalDeletedTimeSlots.includes(time)) ||
      originalDeletedTimeSlots.some((time: string) => !deletedTimeSlots.includes(time));
    
    // Check if calendar mode has changed
    const hasCalendarModeChanges = isGregorianMode !== originalCalendarMode;
    
    // Check if day overviews have changed
    const hasDayOverviewChanges = Object.keys(dayOverviews).some(day => {
      const currentTags = dayOverviews[parseInt(day)] || [];
      const originalTags = originalDayOverviews[parseInt(day)] || [];
      return currentTags.length !== originalTags.length || 
             currentTags.some(tag => !originalTags.some(origTag => 
               origTag.text === tag.text && origTag.category === tag.category
             )) ||
             originalTags.some(tag => !currentTags.some(currTag => 
               currTag.text === tag.text && currTag.category === tag.category
             ));
    }) || Object.keys(originalDayOverviews).some(day => {
      const currentTags = dayOverviews[parseInt(day)] || [];
      const originalTags = originalDayOverviews[parseInt(day)] || [];
      return currentTags.length !== originalTags.length || 
             currentTags.some(tag => !originalTags.some(origTag => 
               origTag.text === tag.text && origTag.category === tag.category
             )) ||
             originalTags.some(tag => !currentTags.some(currTag => 
               currTag.text === tag.text && currTag.category === tag.category
             ));
    });
    
    // Check if user categories have changed
    const hasUserCategoryChanges = userCategories.length !== originalUserCategories.length ||
      userCategories.some((cat, index) => 
        cat.name !== originalUserCategories[index]?.name || 
        cat.color !== originalUserCategories[index]?.color
      );
    
    const hasChanges = Object.keys(pendingChanges).length > 0 || 
                      addedTimeSlots.length > 0 || 
                      hasDeletedTimeslotChanges ||
                      hasCalendarModeChanges ||
                      hasDayOverviewChanges ||
                      hasUserCategoryChanges;
    
    setHasUnsavedChanges(hasChanges);
  }, [pendingChanges, addedTimeSlots, deletedTimeSlots, originalDeletedTimeSlots, isGregorianMode, originalCalendarMode, dayOverviews, originalDayOverviews, userCategories, originalUserCategories]);

  const fetchRoutineData = async (isUserLoggedIn: boolean) => {
    try {
      setLoading(true);
      
      let endpoint = '/api/lists/routine'; // Default system routine endpoint
      let headers: HeadersInit = {};
      
      if (isUserLoggedIn && currentUser && authToken) {
        const userId = currentUser.id;
        if (userId) {
          endpoint = `/api/users/${userId}/routines`;
          headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          };
        }
      }
      
      // Fetching routine data from endpoint
      
      const response = await fetch(buildApiUrl(endpoint), { headers });
      
      // Response status and ok
      
      if (!response.ok) {
        // Don't treat 401 (no user routines) as an error - it's expected
        if (isUserLoggedIn && response.status === 401) {
          // User is logged in but has no personal routines yet
          setRoutineData([]);
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      // Received data
      
      if (data.routines && data.routines.length > 0) {
        // Handle user routines response format
        // Using user routine data
        setRoutineData(data.routines);
      } else if (data.list && data.list.items_json && data.list.items_json.length > 0) {
        // Fallback to system routine data (if it still exists)
        setRoutineData(data.list.items_json);
      } else {
        // No routine data found, setting empty array
        setRoutineData([]);
      }
      
      // If user is logged in, also fetch their deleted timeslots
      if (isUserLoggedIn && currentUser && authToken) {
        try {
          const userId = currentUser.id;
          
          if (userId) {
            const deletedTimeslotsResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/deleted-timeslots`), {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            });
              
            if (deletedTimeslotsResponse.ok) {
              const deletedData = await deletedTimeslotsResponse.json();
              const deletedTimes = deletedData.deletedTimeslots || [];
              setDeletedTimeSlots(deletedTimes);
              setOriginalDeletedTimeSlots(deletedTimes); // Track original state
              // Loaded deleted timeslots
            } else {
              // No deleted timeslots found or error occurred
              setDeletedTimeSlots([]);
              setOriginalDeletedTimeSlots([]);
            }
          }
        } catch (error) {
          console.error('Error fetching deleted timeslots:', error);
          setDeletedTimeSlots([]);
        }
      }
    } catch (err) {
      console.error('Error fetching routine data:', err);
    } finally {
      setLoading(false);
    }
  };



  // Update current time every minute
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${displayHour}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Generate times from routine data or use default template in edit mode
  const generateTimesFromData = (data: DayRoutine[]) => {
    // If we're in edit mode and logged in, show template times minus deleted ones
    if (isEditMode && isLoggedIn) {
      // Default template: 6am to 10pm hourly
      const templateTimes = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
                            '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 
                            '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];
      
      // Filter out deleted timeslots
      return templateTimes.filter(time => !deletedTimeSlots.includes(time));
    }
    
    if (data.length === 0) {
      return [];
    }
    
    const timeSet = new Set<string>();
    data.forEach(day => {
      day.routines.forEach(routine => {
        timeSet.add(routine.time);
      });
    });
    
    // Convert to array and sort chronologically
    const times = Array.from(timeSet);
    // Original times from data
    
    // Sort times chronologically by converting to comparable values
    const sortedTimes = times.sort((a, b) => {
      const timeA = convertTimeToMinutes(a);
      const timeB = convertTimeToMinutes(b);
      // Comparing times for sorting
      return timeA - timeB;
    });
    
    // Sorted times
    return sortedTimes;
  };

  // Helper function to convert time string to minutes for proper sorting
  const convertTimeToMinutes = (timeStr: string): number => {
    // Handle different time formats
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
      console.warn('Could not parse time format:', timeStr);
      return 0;
    }
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes;
  };

  // Helper function to calculate duration between two time slots
  const calculateDuration = (startTime: string, endTime: string): string => {
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);
    
    let durationMinutes: number;
    
    if (endMinutes <= startMinutes) {
      // Cross-day duration: end time is on the next day
      // Add 24 hours (1440 minutes) to the end time
      durationMinutes = (endMinutes + 1440) - startMinutes;
    } else {
      // Same-day duration
      durationMinutes = endMinutes - startMinutes;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '';
    }
  };



  // Helper function to get the next activity time for a specific day and time
  const getNextActivityTimeForDay = (currentTime: string, dayNumber: number): string | null => {
    const currentIndex = displayTimes.indexOf(currentTime);
    if (currentIndex === -1) {
      return null; // Invalid time
    }
    
    // Look for the next time slot that has an activity on this specific day
    for (let i = currentIndex + 1; i < displayTimes.length; i++) {
      const checkTime = displayTimes[i];
      
      // Check if there's an activity at this time on this specific day
      const dayRoutine = routineData.find(day => day.day === dayNumber);
      if (dayRoutine) {
        const routine = dayRoutine.routines.find(r => r.time === checkTime);
        if (routine && routine.activity && routine.activity.trim() !== '') {
          // Found next activity on this day
          return checkTime;
        }
      }
      
      // Also check for pending changes on this day
      const changeKey = `${dayNumber}-${checkTime}`;
      const pendingChange = pendingChanges[changeKey];
      if (pendingChange && pendingChange.activity && pendingChange.activity.trim() !== '') {
        // Found next activity from pending changes on this day
        return checkTime;
      }
    }
    
    // If no next activity found on this day, look for the first activity of the next day
    const nextDayNumber = dayNumber === 7 ? 1 : dayNumber + 1; // Wrap around from Sunday to Monday
    const nextDayRoutine = routineData.find(day => day.day === nextDayNumber);
    
    if (nextDayRoutine) {
      // Find the first activity of the next day
      for (let i = 0; i < displayTimes.length; i++) {
        const checkTime = displayTimes[i];
        const routine = nextDayRoutine.routines.find(r => r.time === checkTime);
        if (routine && routine.activity && routine.activity.trim() !== '') {
          // Found first activity of next day
          return checkTime;
        }
        
        // Also check pending changes for next day
        const changeKey = `${nextDayNumber}-${checkTime}`;
        const pendingChange = pendingChanges[changeKey];
        if (pendingChange && pendingChange.activity && pendingChange.activity.trim() !== '') {
          // Found first activity of next day from pending changes
          return checkTime;
        }
      }
    }
    
    // If still no next activity found, return null
    return null;
  };

  // Generate all available times in 15-minute intervals for the Change Time dropdown
  const generateAllAvailableTimes = (): string[] => {
    const allTimes: string[] = [];
    
    // Generate times from 6:00 AM to 11:45 PM in 15-minute intervals
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        let displayHour = hour;
        let period = 'AM';
        
        if (hour >= 12) {
          period = 'PM';
          if (hour > 12) displayHour = hour - 12;
        }
        if (hour === 0) displayHour = 12;
        
        const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        allTimes.push(timeString);
      }
    }
    
    // Filter out times that already have activities assigned or are marked for deletion
    return allTimes.filter(time => {
      // Check if this time is marked for deletion
      if (deletedTimeSlots.includes(time)) {
        return false;
      }
      
      // Check if this time has activities in the existing routine data
      const hasExistingActivity = routineData.some(day => 
        day.routines.some(routine => 
          routine.time === time && routine.activity && routine.activity.trim() !== ''
        )
      );
      
      // Check if this time has pending changes with activities
      const hasPendingActivity = Object.entries(pendingChanges).some(([key, data]) => {
        const [, timeSlot] = key.split('-');
        return timeSlot === time && data.activity && data.activity.trim() !== '';
      });
      
      // Return true only if the time has no activities (existing or pending)
      return !hasExistingActivity && !hasPendingActivity;
    });
  };

  // Generate dropdown options with "Keep current time" in chronological position
  const generateTimeDropdownOptions = (): Array<{ value: string; label: string; isKeepCurrent: boolean }> => {
    if (!editingRow) return [];
    
    const availableTimes = generateAllAvailableTimes().filter(time => time !== editingRow);
    const options: Array<{ value: string; label: string; isKeepCurrent: boolean }> = [];
    
    // Add the "Keep current time" option
    const keepCurrentOption = { value: '', label: `Keep current time (${editingRow})`, isKeepCurrent: true };
    
    // Insert "Keep current time" in the correct chronological position
    let inserted = false;
    for (const time of availableTimes) {
      if (!inserted && convertTimeToMinutes(time) > convertTimeToMinutes(editingRow)) {
        options.push(keepCurrentOption);
        inserted = true;
      }
      options.push({ value: time, label: time, isKeepCurrent: false });
    }
    
    // If we haven't inserted it yet (all times are before current time), add it at the end
    if (!inserted) {
      options.push(keepCurrentOption);
    }
    
    return options;
  };

  const times = generateTimesFromData(routineData);

  // Helper function to get the orbital day number for a given Gregorian day number
  const getOrbitalDayNumber = (gregorianDay: number): number => {
    // Map Gregorian days (1-7) to orbital days (1-7) where 1=Monday, 7=Sunday
    const orbitalMapping: { [key: number]: number } = {
      1: 1, // Monday -> Unyom
      2: 2, // Tuesday -> Tuyom
      3: 3, // Wednesday -> Triyom
      4: 4, // Thursday -> Foyom
      5: 5, // Friday -> Phiyom
      6: 6, // Saturday -> Seyom
      7: 7  // Sunday -> Sabbath
    };
    return orbitalMapping[gregorianDay] || gregorianDay;
  };



  const getDateForDay = (dayNumber: number): OrbitalDate => {
    try {
      if (isGregorianMode) {
        // In Gregorian mode, we need to calculate the date for the displayed day
        // dayNumber represents Monday(1) through Sunday(7)
        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        
        // Convert to our Monday(1)-Sunday(7) system
        const currentGregorianDay = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
        
        // Calculate days difference
        const daysDiff = dayNumber - currentGregorianDay;
        
        // Calculate the target date
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysDiff);
        
        // For Gregorian mode, we don't need to convert to orbital date
        // Just return a basic orbital date structure with the gregorian date
        return {
          weekDay: dayNumber,
          month: today.getMonth() + 1,
          day: targetDate.getDate(),
          year: targetDate.getFullYear(),
          gregorianDate: targetDate,
          isSpecialDay: false
        };
      } else {
        // In Orbital mode, use the original logic
        const today = orbitalCalendar.getCurrentOrbitalDate();
        const daysDiff = dayNumber - today.weekDay;
        
        // Calculate the target date
        const targetDate = new Date(today.gregorianDate);
        targetDate.setDate(targetDate.getDate() + daysDiff);
        
        // Convert back to orbital date
        return orbitalCalendar.gregorianToOrbital(targetDate);
      }
    } catch (error) {
      console.error('Error in getDateForDay:', error);
      // Return a fallback date to prevent crashes
      const fallbackDate = new Date();
      return {
        weekDay: dayNumber,
        month: fallbackDate.getMonth() + 1,
        day: fallbackDate.getDate(),
        year: fallbackDate.getFullYear(),
        gregorianDate: fallbackDate,
        isSpecialDay: false
      };
    }
  };

  // Helper function to get day name based on calendar mode
  const getDisplayDayName = (dayNumber: number): string => {
    try {
      if (isGregorianMode) {
        // In Gregorian mode, return the Gregorian day name based on the display day number
        const gregorianDayNames = [
          '', // 0 - not used
          'Monday',    // 1
          'Tuesday',   // 2
          'Wednesday', // 3
          'Thursday',  // 4
          'Friday',    // 5
          'Saturday',  // 6
          'Sunday'     // 7
        ];
        return gregorianDayNames[dayNumber] || 'Unknown';
      } else {
        return getDayName(dayNumber);
      }
    } catch (error) {
      console.error('Error in getDisplayDayName:', error);
      return 'Error';
    }
  };

  // Generate template data for edit mode when no personal routine exists
  const generateTemplateData = () => {
    try {
      // If we're in edit mode and logged in, always show the full template structure
      if (isEditMode && isLoggedIn) {
        // Start with the base template times
        let allTimes = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
                        '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 
                        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];
        
        // Add any intermediate times that were added via the add button (for current session)
        const addedTimes = addedTimeSlots
          .filter(time => !allTimes.includes(time))
          .sort((a, b) => convertTimeToMinutes(a) - convertTimeToMinutes(b));
        
        // Add any times that exist in the database data (for persistent intermediate times)
        const databaseTimes = new Set<string>();
        routineData.forEach(day => {
          day.routines.forEach(routine => {
            if (routine.time && !allTimes.includes(routine.time)) {
              databaseTimes.add(routine.time);
            }
          });
        });
        
        // Convert database times to array and sort
        const sortedDatabaseTimes = Array.from(databaseTimes).sort((a, b) => 
          convertTimeToMinutes(a) - convertTimeToMinutes(b)
        );
        
        // Merge all times: base template + database times + current session added times
        allTimes = [...allTimes, ...sortedDatabaseTimes, ...addedTimes];
        
        // Remove duplicates and sort chronologically
        allTimes = [...new Set(allTimes)].sort((a, b) => convertTimeToMinutes(a) - convertTimeToMinutes(b));
        
        // Remove any time slots marked for deletion
        allTimes = allTimes.filter(time => !deletedTimeSlots.includes(time));
        
        // Create template data for 7 days with all time slots
        const templateData: DayRoutine[] = [];

        // Determine the day range based on calendar mode
        let dayRange: number[];
        if (isGregorianMode) {
          // In Gregorian mode, we want to display Monday-Sunday order
          // Map the orbital day numbers to Gregorian day numbers for proper ordering
          dayRange = [1, 2, 3, 4, 5, 6, 7]; // This will be Monday through Sunday
        } else {
          // In Orbital mode, use the standard orbital day numbering
          dayRange = [1, 2, 3, 4, 5, 6, 7];
        }

        for (let dayIndex = 0; dayIndex < dayRange.length; dayIndex++) {
          const displayDay = dayRange[dayIndex];
          // For Gregorian mode, we need to map the display day to the actual orbital day
          // to find the correct routine data
          const actualDay = isGregorianMode ? getOrbitalDayNumber(displayDay) : displayDay;
          
          const dayRoutines = allTimes.map(time => {
            // Check if we have a saved routine for this time slot
            const savedRoutine = routineData.find(d => d.day === actualDay)?.routines.find(r => r.time === time);
            
            return {
              time,
              activity: savedRoutine?.activity || '',
              category: savedRoutine?.category || ''
            };
          });
          
          templateData.push({
            day: displayDay, // Use the display day for rendering
            routines: dayRoutines
          });
        }

        return templateData;
      }
      
      // If not in edit mode, return actual routine data (this applies to both logged-in and non-logged-in users)
      if (routineData.length > 0) {
        return routineData;
      }
      
      // Default: return empty array
      return [];
    } catch (error) {
      console.error('Error in generateTemplateData:', error);
      // Return empty array as fallback to prevent crashes
      return [];
    }
  };

  // Use useMemo to make displayData reactive to routineData changes
  const displayData = React.useMemo(() => {
    const result = generateTemplateData();
    return result;
  }, [routineData, isEditMode, isLoggedIn, addedTimeSlots, deletedTimeSlots, isGregorianMode]);



  // Update times to use template data when in edit mode
  const displayTimes = React.useMemo(() => {
    if (isEditMode && isLoggedIn) {
      // In edit mode, always show the full template times
      return displayData.length > 0 ? displayData[0].routines.map(r => r.time) : [];
    } else {
      // In normal mode, use the chronologically sorted times from data
      // This applies to both logged-in and non-logged-in users
      return times;
    }
  }, [isEditMode, isLoggedIn, displayData, times, addedTimeSlots, deletedTimeSlots, routineData, isGregorianMode]);

  // Generate valid intermediate times between two time slots
  const generateIntermediateTimes = (currentTime: string, nextTime: string): string[] => {
    const currentMinutes = convertTimeToMinutes(currentTime);
    const nextMinutes = convertTimeToMinutes(nextTime);
    
    if (nextMinutes <= currentMinutes) return [];
    
    const intermediateTimes: string[] = [];
    let timeInMinutes = currentMinutes + 15; // Start 15 minutes after current time
    
    while (timeInMinutes < nextMinutes) {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      
      let displayHour = hours;
      let period = 'AM';
      
      if (hours >= 12) {
        period = 'PM';
        if (hours > 12) displayHour = hours - 12;
      }
      if (hours === 0) displayHour = 12;
      
      const timeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
      intermediateTimes.push(timeString);
      
      timeInMinutes += 15; // Add 15-minute intervals
    }
    
    return intermediateTimes;
  };

  // Handle adding a new time slot
  const handleAddTimeSlot = (newTime: string) => {
    // If this timeslot was previously deleted, remove it from deletedTimeSlots
    // so it can be "restored" when saving
    if (deletedTimeSlots.includes(newTime)) {
      setDeletedTimeSlots(prev => prev.filter(time => time !== newTime));
    }
    
    // Add the new time slot to the list of added time slots
    setAddedTimeSlots(prev => {
      if (prev.includes(newTime)) {
        return prev; // Already exists
      }
      return [...prev, newTime];
    });
  };

  // Handle deleting a time slot
  const handleDeleteTimeSlot = (timeToDelete: string) => {
    // If already marked for deletion, undo it
    if (deletedTimeSlots.includes(timeToDelete)) {
      setDeletedTimeSlots(prev => prev.filter(time => time !== timeToDelete));
      return;
    }
    
    // Confirm deletion
    const confirmDelete = window.confirm(`Are you sure you want to delete the time slot "${timeToDelete}"? This will remove all activities for this time across all days.`);
    if (!confirmDelete) return;
    
    // Remove from added time slots if it was added
    setAddedTimeSlots(prev => prev.filter(time => time !== timeToDelete));
    
    // Add to deleted time slots
    setDeletedTimeSlots(prev => [...prev, timeToDelete]);
  };

  // Process routine data to calculate row spans for visual extension
  const processRoutineForDay = (routines: any[], dayNumber: number): ProcessedRoutine[] => {
    const processed: ProcessedRoutine[] = [];
    
    // If we're in edit mode, always show all slots individually without row spanning
    if (isEditMode && isLoggedIn) {
      for (let i = 0; i < routines.length; i++) {
        const routine = routines[i];
        const changeKey = `${dayNumber}-${routine.time}`;
        const pendingChange = pendingChanges[changeKey];
        
        // Check if this activity is marked for deletion
        const isDeleted = pendingChange && pendingChange.activity === '';
        
        processed.push({
          time: routine.time,
          activity: isDeleted ? '' : (pendingChange ? pendingChange.activity : (routine.activity || '')),
          category: isDeleted ? '' : (pendingChange ? pendingChange.category : (routine.category || '')),
          rowSpan: 1,
          isExtended: false
        });
      }
      return processed;
    }
    
    // Normal processing for routines with activities (non-edit mode)
    // This applies to both logged-in and non-logged-in users
    
    // Get all available times for this day
    const allTimes = displayTimes;
    
    // Process each time slot
    for (let timeIndex = 0; timeIndex < allTimes.length; timeIndex++) {
      const currentTime = allTimes[timeIndex];
      
      // Find the routine for this time slot
      const routine = routines.find(r => r.time === currentTime);
      const changeKey = `${dayNumber}-${currentTime}`;
      const pendingChange = pendingChanges[changeKey];
      
      // Check if this activity is marked for deletion
      const isDeleted = pendingChange && pendingChange.activity === '';
      const activity = isDeleted ? '' : (pendingChange ? pendingChange.activity : (routine?.activity || ''));
      
      if (activity && activity.trim() !== '') {
        // This slot has an activity, calculate how many empty slots follow
        let rowSpan = 1;
        let j = timeIndex + 1;
        
        // Count consecutive empty time slots
        while (j < allTimes.length) {
          const nextTime = allTimes[j];
          const nextRoutine = routines.find(r => r.time === nextTime);
          const nextChangeKey = `${dayNumber}-${nextTime}`;
          const nextPendingChange = pendingChanges[nextChangeKey];
          
          // Check if the next slot is empty (either no activity or marked for deletion)
          const nextActivity = nextPendingChange ? nextPendingChange.activity : (nextRoutine?.activity || '');
          const isNextEmpty = !nextActivity || nextActivity.trim() === '';
          
          if (isNextEmpty) {
            rowSpan++;
            j++;
          } else {
            break;
          }
        }
        
        processed.push({
          time: currentTime,
          activity: activity,
          category: isDeleted ? '' : (pendingChange ? pendingChange.category : (routine?.category || '')),
          rowSpan,
          isExtended: rowSpan > 1
        });
      } else {
        // This slot is empty, skip it (will be covered by the extended cell above)
        continue;
      }
    }
    
    return processed;
  };



  // Use template data or routine data from API
  const weeklyRoutine: DayRoutine[] = displayData;

  // Process each day's routine for visual extension
  // Ensure we always have all 7 days in the correct order
  const processedWeeklyRoutine = Array.from({ length: 7 }, (_, index) => {
    const dayNumber = index + 1;
    const existingDay = weeklyRoutine.find(day => day.day === dayNumber);
    
    if (existingDay) {
      // Day exists in data - process it
      return {
        day: dayNumber,
        processedRoutines: processRoutineForDay(existingDay.routines, dayNumber)
      };
    } else {
      // Day doesn't exist - create empty day structure
      return {
        day: dayNumber,
        processedRoutines: processRoutineForDay([], dayNumber)
      };
    }
  });

  const getCategoryColor = (category: string) => {
    // Check user categories first
    const userCategory = userCategories.find(cat => cat.name === category);
    if (userCategory) {
      return userCategory.color;
    }
    
    // Fall back to system categories
    const colors: { [key: string]: string } = {
      'work': '#f39c12', // Orange
      'exercise': '#e74c3c', // Red
      'meal': '#1a5f3a', // Dark green (changed from bright green)
      'meals': '#1a5f3a', // Dark green (alias for meal)
      'leisure': '#2980b9', // Darker blue (changed from bright blue)
      'chores': '#8e44ad', // Darker purple (changed from bright purple)
      'sleep': '#2c3e50', // Dark blue-grey
      'none': '#95a5a6', // Grey for None category
    };
    return colors[category] || '#95a5a6'; // Grey for no category
  };

  const getCategoryBackgroundTint = (category: string) => {
    // Check user categories first
    const userCategory = userCategories.find(cat => cat.name === category);
    if (userCategory) {
      // Convert hex color to rgba with low opacity
      const hex = userCategory.color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, 0.05)`;
    }
    
    // Fall back to system categories
    const tints: { [key: string]: string } = {
      'work': 'rgba(243, 156, 18, 0.05)', // Orange tint
      'exercise': 'rgba(231, 76, 60, 0.05)', // Red tint
      'meal': 'rgba(26, 95, 58, 0.05)', // Dark green tint (updated)
      'meals': 'rgba(26, 95, 58, 0.05)', // Dark green tint (updated)
      'leisure': 'rgba(41, 128, 185, 0.05)', // Darker blue tint (updated)
      'chores': 'rgba(142, 68, 173, 0.05)', // Darker purple tint (updated)
      'sleep': 'rgba(44, 62, 80, 0.05)', // Dark blue-grey tint
      'none': 'rgba(149, 165, 166, 0.15)', // Grey tint for None category
    };
    // Handle empty string or undefined category as "none"
    if (!category || category.trim() === '') {
      return tints['none'];
    }
    return tints[category] || tints['none'];
  };




  // Check if an activity is exercise-related based on category
  const isExerciseActivity = (category: string): boolean => {
    return category === 'exercise';
  };

  // Check if an activity is meal-related based on category
  const isMealActivity = (category: string): boolean => {
    return category === 'meal' || category === 'meals';
  };

  // Render activity with exercise links
  const renderActivity = (activity: string) => {
    return activity;
  };

  const isCurrentDay = (dayNumber: number) => {
    if (isGregorianMode) {
      // In Gregorian mode, determine current day based on actual Gregorian calendar
      const today = new Date();
      const currentGregorianDay = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // Convert to our Monday(1)-Sunday(7) system
      const currentDay = currentGregorianDay === 0 ? 7 : currentGregorianDay;
      
      return dayNumber === currentDay;
    } else {
      // In Orbital mode, use the orbital calendar's current day
      return dayNumber === currentDate.weekDay;
    }
  };

  const isCurrentCell = (dayNumber: number, time: string) => {
    // Get routines for the current day
    const currentDayRoutine = routineData.find(day => day.day === dayNumber);
    const todayRoutines = currentDayRoutine?.routines || [];
    
    const currentHour = new Date().getHours();
    
    // If it's AM hours (past midnight), check for overnight activities on the previous day
    if (currentHour < 12) { // AM hours (past midnight)
      const currentDay = orbitalCalendar.getCurrentOrbitalDate().day;
      const previousDayNumber = currentDay === 1 ? 7 : currentDay - 1; // Wrap around from day 1 to day 7
      
      // Only highlight if this is the previous day and has an ongoing overnight activity
      if (dayNumber === previousDayNumber) {
        const previousDayRoutine = routineData.find(day => day.day === previousDayNumber);
        const previousDayRoutines = previousDayRoutine?.routines || [];
        
        // Check if this time slot has an overnight activity that's still ongoing
        return isCurrentActivity(time, previousDayRoutines);
      }
      
      // Don't highlight current day during AM hours if we're highlighting the previous day
      return false;
    }
    
    // Normal case: check if this is the current day and has current activity
    return isCurrentDay(dayNumber) && isCurrentActivity(time, todayRoutines);
  };

  const handleCellClick = (dayNumber: number, time: string, currentActivity: string, currentCategory: string) => {
    if (!isEditMode) return;
    
    // Check if there are pending changes for this cell
    const changeKey = `${dayNumber}-${time}`;
    const pendingChange = pendingChanges[changeKey];
    
    setEditingCell({ day: dayNumber, time });
    setEditFormData({
      activity: pendingChange ? pendingChange.activity : (currentActivity || ''),
      category: pendingChange ? pendingChange.category : (currentCategory || '')
    });
  };

  const handleTimeHeaderClick = (time: string) => {
    if (!isEditMode) return;
    
    // Check if there are existing activities for this time slot across all days
    let existingActivity = '';
    let existingCategory = '';
    
    // Look for the first non-empty activity at this time
    for (let day = 1; day <= 7; day++) {
      const existingRoutine = routineData.find(d => d.day === day)?.routines.find(r => r.time === time);
      if (existingRoutine && existingRoutine.activity && existingRoutine.activity.trim() !== '') {
        existingActivity = existingRoutine.activity;
        existingCategory = existingRoutine.category || '';
        break; // Use the first non-empty activity we find
      }
    }
    
    // Also check for any pending changes that might override the database data
    for (let day = 1; day <= 7; day++) {
      const changeKey = `${day}-${time}`;
      const pendingChange = pendingChanges[changeKey];
      if (pendingChange && pendingChange.activity && pendingChange.activity.trim() !== '') {
        existingActivity = pendingChange.activity;
        existingCategory = pendingChange.category || '';
        break; // Pending changes take precedence
      }
    }
    
    setEditingRow(time);
    setRowEditData({
      time,
      activity: existingActivity,
      category: existingCategory,
      newTime: '' // Initialize newTime to empty
    });
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    
    // Store the change locally
    const changeKey = `${editingCell.day}-${editingCell.time}`;
    const newChanges = {
      ...pendingChanges,
      [changeKey]: {
        activity: editFormData.activity.trim(),
        category: editFormData.category
      }
    };
    
    setPendingChanges(newChanges);
    
    // Close the form
    setEditingCell(null);
    setEditFormData({ activity: '', category: '' });
  };

  const handleDeleteCell = () => {
    if (!editingCell) return;
    
    // Mark this cell for deletion by setting activity to empty string
    const changeKey = `${editingCell.day}-${editingCell.time}`;
    const newChanges = {
      ...pendingChanges,
      [changeKey]: {
        activity: '', // Empty string indicates deletion
        category: ''
      }
    };
    
    setPendingChanges(newChanges);
    
    // Close the form
    setEditingCell(null);
    setEditFormData({ activity: '', category: '' });
  };
  
  // Category management functions
  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') return;
    
    // Check if category name already exists (case-insensitive)
    const existingCategory = userCategories.find(cat => 
      cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    
    if (existingCategory) {
      alert('A category with this name already exists.');
      return;
    }
    
    const newCategory = {
      name: newCategoryName.trim(),
      color: newCategoryColor
    };
    
    setUserCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setNewCategoryColor('#3498db');
    setShowCategoryModal(false);
  };
  
  const handleDeleteCategory = (categoryName: string) => {
    // Check if category is in use
    const isInUse = routineData.some(day => 
      day.routines.some(routine => routine.category === categoryName)
    );
    
    if (isInUse) {
      alert('Cannot delete category that is currently in use. Please change all activities using this category first.');
      return;
    }
    
    setUserCategories(prev => prev.filter(cat => cat.name !== categoryName));
  };
  


  const handleSaveRow = () => {
    if (!editingRow) return;
    
    const newChanges = { ...pendingChanges };
    const currentActivity = rowEditData.activity.trim();
    const currentCategory = rowEditData.category;
    
    // If there's a new time specified, move the activity to the new time
    if (rowEditData.newTime && rowEditData.newTime !== editingRow) {
      // Check if the new time slot already exists in the current data
      const newTimeExists = routineData.some(day => 
        day.routines.some(routine => routine.time === rowEditData.newTime)
      );
      
      // If the new time doesn't exist, add it to addedTimeSlots
      if (!newTimeExists) {
        setAddedTimeSlots(prev => {
          if (prev.includes(rowEditData.newTime)) {
            return prev; // Already exists
          }
          return [...prev, rowEditData.newTime];
        });
      }
      
      // Clear all 7 days at the old time
      for (let day = 1; day <= 7; day++) {
        const oldChangeKey = `${day}-${editingRow}`;
        newChanges[oldChangeKey] = {
          activity: '', // Empty string indicates deletion
          category: ''
        };
      }
      
      // Set all 7 days at the new time
      for (let day = 1; day <= 7; day++) {
        const newChangeKey = `${day}-${rowEditData.newTime}`;
        newChanges[newChangeKey] = {
          activity: currentActivity,
          category: currentCategory
        };
      }
    } else {
      // No time change, just update the current time slot
      for (let day = 1; day <= 7; day++) {
        const changeKey = `${day}-${editingRow}`;
        newChanges[changeKey] = {
          activity: currentActivity,
          category: currentCategory
        };
      }
    }
    
    setPendingChanges(newChanges);
    
    // Close the form
    setEditingRow(null);
    setRowEditData({ time: '', activity: '', category: '', newTime: '' });
  };

  const handleChangeTime = (newTime: string) => {
    if (!editingRow || newTime === editingRow) return;
    
    // Just update the form to show the intended new time
    setRowEditData({ ...rowEditData, newTime });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingRow(null);
    setEditFormData({ activity: '', category: '' });
    setRowEditData({ time: '', activity: '', category: '', newTime: '' });
  };

  const handleSaveAll = async () => {
    if (!isLoggedIn) return;
    
      // Check if there are any changes to save (including deleted timeslots and calendar mode)
  const hasDeletedTimeslotChanges = deletedTimeSlots.length !== originalDeletedTimeSlots.length || 
    deletedTimeSlots.some(time => !originalDeletedTimeSlots.includes(time)) ||
    originalDeletedTimeSlots.some(time => !deletedTimeSlots.includes(time));
  
  const hasCalendarModeChanges = isGregorianMode !== originalCalendarMode;
  
  // Check if day overviews have changed
  const hasDayOverviewChanges = Object.keys(dayOverviews).some(day => {
    const currentTags = dayOverviews[parseInt(day)] || [];
    const originalTags = originalDayOverviews[parseInt(day)] || [];
    return currentTags.length !== originalTags.length || 
           currentTags.some(tag => !originalTags.some(origTag => 
             origTag.text === tag.text && origTag.category === tag.category
           )) ||
           originalTags.some(tag => !currentTags.some(currTag => 
             currTag.text === tag.text && currTag.category === tag.category
           ));
  }) || Object.keys(originalDayOverviews).some(day => {
    const currentTags = dayOverviews[parseInt(day)] || [];
    const originalTags = originalDayOverviews[parseInt(day)] || [];
    return currentTags.length !== originalTags.length || 
           currentTags.some(tag => !originalTags.includes(tag)) ||
           originalTags.some(tag => !currentTags.includes(tag));
  });

  // Check if user categories have changed
  const hasUserCategoryChanges = userCategories.length !== originalUserCategories.length ||
    userCategories.some((cat, index) => 
      cat.name !== originalUserCategories[index]?.name || 
      cat.color !== originalUserCategories[index]?.color
    );

  if (Object.keys(pendingChanges).length === 0 && addedTimeSlots.length === 0 && !hasDeletedTimeslotChanges && !hasCalendarModeChanges && !hasDayOverviewChanges && !hasUserCategoryChanges) {
    alert('No changes to save.');
    return;
  }
    
    try {
      // Starting to save routines
      
      // Get user ID from auth context
      if (!currentUser || !authToken) {
        console.error('No current user or auth token found');
        return;
      }
      
      const userId = currentUser.id;
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      // User ID
      
      // Convert pending changes to API format, separating saves from deletions
      const routinesToSave: Array<{
        day_number: number;
        time_slot: string;
        activity: string;
        category: string;
      }> = [];
      const routinesToDelete: Array<{
        day_number: number;
        time_slot: string;
        activity: string;
        category: string;
      }> = [];
      
      Object.entries(pendingChanges).forEach(([key, data]) => {
        const [day, time] = key.split('-');
        const routineData = {
          day_number: parseInt(day),
          time_slot: time,
          activity: data.activity.trim(),
          category: data.category || 'other'
        };
        
        if (data.activity && data.activity.trim() !== '') {
          // This is a new/updated activity - save it
          routinesToSave.push(routineData);
        } else if (data.activity === '') {
          // This is marked for deletion - add to delete list
          routinesToDelete.push(routineData);
        }
        // Note: Empty activities (intermediate time slots) won't be saved or deleted
        // They'll just remain as empty slots in the display
      });
      
      // Add routines to delete for any deleted time slots
      deletedTimeSlots.forEach(deletedTime => {
        for (let day = 1; day <= 7; day++) {
          // Check if there's an existing routine for this day and time
          const existingRoutine = routineData.find(d => d.day === day)?.routines.find(r => r.time === deletedTime);
          if (existingRoutine && existingRoutine.activity) {
            routinesToDelete.push({
              day_number: day,
              time_slot: deletedTime,
              activity: existingRoutine.activity,
              category: existingRoutine.category || 'other'
            });
          }
        }
      });
      
      // Routines to save and delete
      
      // Handle timeslot deletions and restorations FIRST
      const newlyDeletedTimeslots = deletedTimeSlots.filter(time => !originalDeletedTimeSlots.includes(time));
      const newlyRestoredTimeslots = originalDeletedTimeSlots.filter(time => !deletedTimeSlots.includes(time));
      
      // Save newly deleted timeslots
      if (newlyDeletedTimeslots.length > 0) {
        // Saving newly deleted timeslots
        const deletedTimeslotsResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/deleted-timeslots`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ timeslots: newlyDeletedTimeslots })
        });
        
        if (!deletedTimeslotsResponse.ok) {
          const errorData = await deletedTimeslotsResponse.json();
          console.error('Failed to save newly deleted timeslots:', errorData);
          alert(`Failed to save newly deleted timeslots: ${errorData.error || 'Unknown error'}`);
          return;
        }
        // Newly deleted timeslots saved successfully
      }
      
      // Remove newly restored timeslots from database
      if (newlyRestoredTimeslots.length > 0) {
        // Removing newly restored timeslots from database
        const restoreTimeslotsResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/deleted-timeslots`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ timeslots: newlyRestoredTimeslots })
        });
        
        if (!restoreTimeslotsResponse.ok) {
          const errorData = await restoreTimeslotsResponse.json();
          console.error('Failed to restore timeslots:', errorData);
          alert(`Failed to restore timeslots: ${errorData.error || 'Unknown error'}`);
          return;
        }
        // Timeslots restored successfully
      }
      
      // Then, delete any routines marked for deletion
      if (routinesToDelete.length > 0) {
        // Deleting routines
        const deleteResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/delete`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ routines: routinesToDelete })
        });
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          console.error('Routine deletion failed:', errorData);
          alert(`Failed to delete routines: ${errorData.error || 'Unknown error'}`);
          return;
        }
        // Routines deleted successfully
      }
      
      // Then, save any new/updated routines
      if (routinesToSave.length > 0) {
        // Saving routines
        const saveResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/bulk-upsert`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ routines: routinesToSave })
        });
        
        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          console.error('Routine save failed:', errorData);
          alert(`Failed to save routines: ${errorData.error || 'Unknown error'}`);
          return;
        }
        // Routines saved successfully
      }
      
      // Save calendar mode setting if it has changed
      if (isGregorianMode !== originalCalendarMode) {
        // Saving calendar mode setting
        try {
          const settingsToSave = { calendarMode: isGregorianMode ? 'gregorian' : 'orbital' };
          await saveUserSettings(settingsToSave);
          // Calendar mode setting saved successfully
        } catch (error) {
          console.error('Failed to save calendar mode setting:', error);
          // Don't fail the entire save operation for this
        }
      }

      // Save day overviews if they have changed
      if (hasDayOverviewChanges) {
        try {
          // Save day overviews to user settings as JSON string
          const overviewsToSave = { 
            dayOverviews: JSON.stringify(dayOverviews)
          };
          await saveUserSettings(overviewsToSave);
          // Day overviews saved successfully
        } catch (error) {
          console.error('Failed to save day overviews:', error);
          // Don't fail the entire save operation for this
        }
      }
      
      // Save user categories if they have changed
      if (hasUserCategoryChanges) {
        try {
          // Save user categories to user settings as JSON string
          const categoriesToSave = { 
            userCategories: JSON.stringify(userCategories)
          };
          await saveUserSettings(categoriesToSave);
          // User categories saved successfully
        } catch (error) {
          console.error('Failed to save user categories:', error);
          // Don't fail the entire save operation for this
        }
      }
      
      // Clear pending changes and refresh data
      setPendingChanges({});
      setAddedTimeSlots([]);
      // Don't clear deletedTimeSlots - they should persist
      // Update originalDeletedTimeSlots to reflect the new state
      setOriginalDeletedTimeSlots(deletedTimeSlots);
      // Update originalCalendarMode to reflect the new state
      setOriginalCalendarMode(isGregorianMode);
              // Update originalDayOverviews to reflect the new state
        setOriginalDayOverviews(dayOverviews);
        // Update originalUserCategories to reflect the new state
        setOriginalUserCategories(userCategories);
      await fetchRoutineData(true);
      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Error saving all routines:', error);
      alert('Error saving routines. Please try again.');
    }
  };

  const handleExitEditMode = () => {
    if (hasUnsavedChanges) {
      const confirmExit = window.confirm('You have unsaved changes. Are you sure you want to exit edit mode? All changes will be lost.');
      if (!confirmExit) return;
    }
    
    // Clear all pending changes and exit edit mode
    setPendingChanges({});
    setAddedTimeSlots([]);
    // Don't clear deletedTimeSlots - they should persist
    // Reset calendar mode to original state if exiting without saving
    setIsGregorianMode(originalCalendarMode);
    // Reset day overviews to original state if exiting without saving
          setDayOverviews(originalDayOverviews);
      setUserCategories(originalUserCategories);
    setEditingCell(null);
    setEditingRow(null);
    setEditFormData({ activity: '', category: '' });
    setRowEditData({ time: '', activity: '', category: '', newTime: '' });
    setIsEditMode(false);
  };

  // Always show the routine - no more login requirement
  return (
    <div className="routine-page">
      <div className="routine-header">
        <h1>Weekly Routine</h1>
        <div className="current-date">
          {isGregorianMode ? (
            <>
              <span>Current: {new Date().toLocaleDateString('en-US', { weekday: 'long' })} ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
              <span>Time: {currentTime}</span>
            </>
          ) : (
            <>
              <span>Current: {getDayName(currentDate.weekDay)} ({formatOrbitalDate(currentDate)})</span>
              <span>{formatGregorianDate(currentDate)}</span>
              <span>Time: {currentTime}</span>
            </>
          )}
        </div>
        {isLoggedIn && !isEditMode && (
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <button 
              onClick={() => setIsEditMode(true)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Edit Routine
            </button>
          </div>
        )}
        {isEditMode && (
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <button 
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: hasUnsavedChanges ? '#27ae60' : '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                marginRight: '10px'
              }}
            >
              💾 Save All Changes
            </button>
            <button 
              onClick={handleExitEditMode}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ❌ Exit Edit Mode
            </button>
            {hasUnsavedChanges && (
              <div style={{ 
                marginTop: '10px', 
                color: '#f39c12', 
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                ⚠️ You have unsaved changes
              </div>
            )}
          </div>
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#e67e22', fontWeight: 'bold' }}>
            Loading routine from database...
          </div>
        )}




        {/* Calendar Toggle - Only visible in edit mode */}
        {isEditMode && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              backgroundColor: '#2c3e50', 
              borderRadius: '25px', 
              padding: '4px',
              border: '2px solid #34495e'
            }}>
              <button
                onClick={() => {
                  setIsGregorianMode(false);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: !isGregorianMode ? '#3498db' : 'transparent',
                  color: !isGregorianMode ? 'white' : '#bdc3c7',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                Orbital
              </button>
              <button
                onClick={() => {
                  setIsGregorianMode(true);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: isGregorianMode ? '#3498db' : 'transparent',
                  color: isGregorianMode ? 'white' : '#bdc3c7',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                Gregorian
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Month/Week Header - Only show when logged in */}
      {isLoggedIn && (
        <div className="month-week-header">
          <h2>
            {isGregorianMode ? (
              <>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - 
                Week {Math.ceil(new Date().getDate() / 7)}
              </>
            ) : (
              <>
                {orbitalCalendar.getMonthName(currentDate.month)} - Week {Math.ceil(currentDate.day / 7)}
              </>
            )}
          </h2>
        </div>
      )}

      {weeklyRoutine.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
          {loading ? (
            'Loading routine...'
          ) : !isLoggedIn ? (
            <div className="no-routine-message">
              <h3 style={{ marginBottom: '20px', color: '#e67e22' }}>No Routine Found</h3>
              <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                Please <a href="/auth/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '600' }}>log in</a> to create your custom weekly routine.
              </p>
            </div>
          ) : (
            'No routine data available. Create your first routine by adding activities to different time slots.'
          )}
        </div>
      ) : (
        <div className="routine-grid-container">
          <table className="routine-grid">
            <thead>
              <tr>
                {isEditMode && <th className="add-time-header">Time Controls</th>}
                <th className="time-header">Time</th>
                {weeklyRoutine.map(day => (
                  <th key={day.day} className={`day-header ${isCurrentDay(day.day) ? 'current-day' : ''}`}>
                    <div className="day-name">
                      {getDisplayDayName(day.day)} 
                      {!isGregorianMode && (
                        <span className="orbital-date">({formatOrbitalDate(getDateForDay(day.day))})</span>
                      )}
                    </div>
                    <div className="day-date">
                      {isGregorianMode ? (
                        getDateForDay(day.day).gregorianDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      ) : (
                        formatGregorianDate(getDateForDay(day.day))
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Day Overview Row */}
              <tr className="day-overview-row">
                {isEditMode && <td className="day-overview-controls"></td>}
                <td className="day-overview-label">Day Overview</td>
                {weeklyRoutine.map(day => (
                  <td key={day.day} className="day-overview-cell">
                    {isEditMode ? (
                      <div className="day-overview-edit">
                        <div className="day-overview-tags">
                          {(dayOverviews[day.day] || []).map((tag, index) => (
                            <span key={index} className={`day-overview-tag category-${tag.category}`}>
                              {tag.text}
                              <button
                                className="remove-tag-btn"
                                onClick={() => {
                                  const newTags = (dayOverviews[day.day] || []).filter((_, i) => i !== index);
                                  setDayOverviews(prev => ({
                                    ...prev,
                                    [day.day]: newTags
                                  }));
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="add-tag-input">
                          <select 
                            className="category-select"
                            defaultValue=""
                          >
                            <option value="" disabled>Select category...</option>
                            <option value="work">Work</option>
                            <option value="exercise">Exercise</option>
                            <option value="meals">Meals</option>
                            <option value="leisure">Leisure</option>
                            <option value="chores">Chores</option>
                            <option value="sleep">Sleep</option>
                            <option value="none">None</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Add description..."
                            className="day-overview-input"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const categorySelect = e.currentTarget.parentElement?.querySelector('.category-select') as HTMLSelectElement;
                                const category = categorySelect?.value;
                                const text = e.currentTarget.value.trim();
                                
                                if (category && text) {
                                  const newTag = { text, category };
                                  const currentTags = dayOverviews[day.day] || [];
                                  setDayOverviews(prev => ({
                                    ...prev,
                                    [day.day]: [...currentTags, newTag]
                                  }));
                                  e.currentTarget.value = '';
                                  categorySelect.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="day-overview-text">
                        {(dayOverviews[day.day] || []).length > 0 ? (
                          (dayOverviews[day.day] || []).map((tag, index) => (
                            <span key={index} className={`day-overview-tag-display category-${tag.category}`}>
                              {tag.text}
                            </span>
                          ))
                        ) : (
                          'No overview set'
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
              
              {displayTimes.map((time, timeIndex) => (
                <tr 
                  key={time} 
                  className={deletedTimeSlots.includes(time) ? 'time-row-deleted' : ''}
                >
                  {isEditMode && (
                    <td className="add-time-cell">
                      <div className="add-time-controls">
                        {/* Add Time Button */}
                        <div className="add-time-dropdown">
                          <button 
                            className="add-time-btn"
                            onClick={() => {
                              // Find the next time slot
                              const nextTime = displayTimes[timeIndex + 1];
                              if (nextTime) {
                                const intermediateTimes = generateIntermediateTimes(time, nextTime);
                                if (intermediateTimes.length > 0) {
                                  // For now, just show the first available time
                                  // In a full implementation, you'd show a proper dropdown
                                  handleAddTimeSlot(intermediateTimes[0]);
                                }
                              }
                            }}
                            title="Add intermediate time slot"
                          >
                            +
                          </button>
                          {/* Show available intermediate times on hover or click */}
                          {(() => {
                            const nextTime = displayTimes[timeIndex + 1];
                            const isFirstTime = timeIndex === 0;
                            let intermediateTimes: string[] = [];
                            
                            if (isFirstTime) {
                              // Special case: at the first time slot, generate times that come before
                              // Generate times from 12:00 AM up to current time - 15 minutes
                              const currentMinutes = convertTimeToMinutes(time);
                              let timeInMinutes = convertTimeToMinutes('12:00 AM');
                              
                              while (timeInMinutes < currentMinutes) {
                                const hours = Math.floor(timeInMinutes / 60);
                                const minutes = timeInMinutes % 60;
                                
                                let displayHour = hours;
                                let period = 'AM';
                                
                                if (hours >= 12) {
                                  period = 'PM';
                                  if (hours > 12) displayHour = hours - 12;
                                }
                                if (hours === 0) displayHour = 12;
                                
                                const timeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
                                intermediateTimes.push(timeString);
                                
                                timeInMinutes += 15;
                              }
                            } else if (nextTime) {
                              // Normal case: generate intermediate times between current and next
                              intermediateTimes = generateIntermediateTimes(time, nextTime);
                            } else {
                              // Special case: at the last time slot, generate times that extend beyond
                              // Generate times from current time + 15 minutes up to 11:45 PM
                              const currentMinutes = convertTimeToMinutes(time);
                              let timeInMinutes = currentMinutes + 15;
                              
                              while (timeInMinutes <= convertTimeToMinutes('11:45 PM')) {
                                const hours = Math.floor(timeInMinutes / 60);
                                const minutes = timeInMinutes % 60;
                                
                                let displayHour = hours;
                                let period = 'AM';
                                
                                if (hours >= 12) {
                                  period = 'PM';
                                  if (hours > 12) displayHour = hours - 12;
                                }
                                if (hours === 0) displayHour = 12;
                                
                                const timeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
                                intermediateTimes.push(timeString);
                                
                                timeInMinutes += 15;
                              }
                            }
                            
                            if (intermediateTimes.length === 0) return null;
                            
                            return (
                              <div className="intermediate-times">
                                {intermediateTimes.map(intermediateTime => (
                                  <button
                                    key={intermediateTime}
                                    className="intermediate-time-btn"
                                    onClick={() => handleAddTimeSlot(intermediateTime)}
                                    title={`Add ${intermediateTime}`}
                                  >
                                    {intermediateTime}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* Delete Time Button */}
                        <button 
                          className={`delete-time-btn ${deletedTimeSlots.includes(time) ? 'deleted' : ''}`}
                          onClick={() => handleDeleteTimeSlot(time)}
                          title={deletedTimeSlots.includes(time) ? 'Click to undo deletion' : 'Delete this time slot'}
                        >
                          {deletedTimeSlots.includes(time) ? '✓' : '-'}
                        </button>
                      </div>
                    </td>
                  )}
                  <td 
                    className={`time-cell ${isCurrentTime(time, displayTimes) ? 'current-time' : ''} ${isEditMode ? 'clickable-time' : ''}`}
                    onClick={isEditMode ? () => handleTimeHeaderClick(time) : undefined}
                    style={isEditMode ? { cursor: 'pointer' } : {}}
                  >
                    {time}
                    {!isEditMode && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#95a5a6', 
                        marginTop: '2px',
                        fontWeight: 'normal'
                      }}>
                        {(() => {
                          // Show time range based on the next time slot in displayTimes
                          const currentTimeIndex = displayTimes.indexOf(time);
                          if (currentTimeIndex !== -1 && currentTimeIndex < displayTimes.length - 1) {
                            // Regular time slot - show range to next time
                            const nextTime = displayTimes[currentTimeIndex + 1];
                            return `${time} - ${nextTime}`;
                          } else if (currentTimeIndex === displayTimes.length - 1) {
                            // Last time slot - show range to first time of next day
                            const firstTime = displayTimes[0];
                            return `${time} - ${firstTime}`;
                          }
                          return time;
                        })()}
                      </div>
                    )}
                    {isEditMode && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#3498db', 
                        marginTop: '2px',
                        fontWeight: 'normal'
                      }}>
                        Click to edit all days
                      </div>
                    )}
                  </td>
                  {processedWeeklyRoutine.map((day: any) => {
                    const processedRoutine = day.processedRoutines.find((r: any) => r.time === time);
                    
                    // Check if this cell should be skipped due to rowspan from a previous row
                    const shouldSkipCell = (() => {
                      // Look through all previous times to see if any extended cell covers this position
                      for (let prevTimeIndex = 0; prevTimeIndex < timeIndex; prevTimeIndex++) {
                        const prevTime = displayTimes[prevTimeIndex];
                        const prevDayRoutine = processedWeeklyRoutine.find(d => d.day === day.day);
                        const prevProcessedRoutine = prevDayRoutine?.processedRoutines.find(r => r.time === prevTime);
                        
                        if (prevProcessedRoutine && prevProcessedRoutine.isExtended) {
                          // Check if this current time falls within the extended range
                          const prevTimeStartIndex = displayTimes.indexOf(prevTime);
                          const extendedEndIndex = prevTimeStartIndex + prevProcessedRoutine.rowSpan - 1;
                          const currentTimeIndex = displayTimes.indexOf(time);
                          
                          if (currentTimeIndex > prevTimeStartIndex && currentTimeIndex <= extendedEndIndex) {
                            return true; // This cell is covered by a previous extended cell
                          }
                        }
                      }
                      return false;
                    })();
                    
                    if (shouldSkipCell) {
                      // This cell is covered by a previous extended cell - don't render anything
                      return null;
                    }
                    
                    if (!processedRoutine) {
                      // This time slot is empty - render an invisible cell to maintain column alignment
                      return (
                        <td 
                          key={day.day} 
                          className="routine-cell empty-cell"
                          style={{ 
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 0,
                            height: '60px' // Match the height of other cells
                          }}
                        >
                          {/* Empty invisible cell - maintains column structure */}
                        </td>
                      );
                    }
                    
                    return (
                      <td 
                        key={day.day} 
                        className={`routine-cell ${isCurrentCell(day.day, time) ? 'current-cell' : ''} ${processedRoutine.isExtended ? 'extended-cell' : ''}`}
                        rowSpan={processedRoutine.rowSpan > 1 ? processedRoutine.rowSpan : undefined}
                        onClick={isEditMode ? () => handleCellClick(day.day, time, processedRoutine.activity, processedRoutine.category) : undefined}
                        style={isEditMode ? { cursor: 'pointer' } : {}}
                      >
                        {!processedRoutine.activity ? (
                          // Empty activity slot - show placeholder
                          <div 
                            className="routine-item empty-activity"
                            style={{ 
                              borderLeftColor: '#e1e5e9',
                              backgroundColor: '#1a1a1a',
                              height: '60px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isEditMode ? 'pointer' : 'default'
                            }}
                          >
                            <div className="routine-activity" style={{ color: '#95a5a6', fontStyle: 'italic' }}>
                              {isEditMode ? 'Click to add activity...' : ''}
                            </div>
                          </div>
                        ) : isExerciseActivity(processedRoutine.category) ? (
                          isEditMode ? (
                            // In edit mode, render as clickable div instead of link
                            <div 
                              className="routine-item"
                              style={{ 
                                borderLeftColor: processedRoutine.category ? getCategoryColor(processedRoutine.category) : '#e1e5e9',
                                backgroundColor: processedRoutine.category ? getCategoryBackgroundTint(processedRoutine.category) : '#1a1a1a',
                                height: processedRoutine.isExtended ? `${(processedRoutine.rowSpan * 60) + ((processedRoutine.rowSpan - 1) * 10)}px` : 'auto',
                                cursor: 'pointer'
                              }}
                            >
                              <div className="routine-activity">
                                {renderActivity(processedRoutine.activity)}
                              </div>
                            </div>
                          ) : (
                            // Normal mode - render as link
                            <a 
                              href="/lifestyle/exercise" 
                              style={{ 
                                textDecoration: 'none', 
                                display: 'block', 
                                height: '100%',
                                cursor: 'pointer'
                              }}
                            >
                              <div 
                                className="routine-item"
                                style={{ 
                                  borderLeftColor: processedRoutine.category ? getCategoryColor(processedRoutine.category) : '#e1e5e9',
                                  backgroundColor: processedRoutine.category ? getCategoryBackgroundTint(processedRoutine.category) : '#1a1a1a',
                                  height: processedRoutine.isExtended ? `${(processedRoutine.rowSpan * 60) + ((processedRoutine.rowSpan - 1) * 10)}px` : 'auto'
                                }}
                              >
                                <div className="routine-activity">
                                  {renderActivity(processedRoutine.activity)}
                                  {!isEditMode && (() => {
                                    const nextTime = getNextActivityTimeForDay(processedRoutine.time, day.day);
                                    if (nextTime) {
                                      const duration = calculateDuration(processedRoutine.time, nextTime);
                                      return duration ? (
                                        <span style={{ 
                                          fontSize: '11px', 
                                          color: '#95a5a6', 
                                          fontStyle: 'italic',
                                          fontWeight: 'normal'
                                        }}>
                                          {` (${duration})`}
                                        </span>
                                      ) : '';
                                    }
                                    return '';
                                  })()}
                                </div>
                              </div>
                            </a>
                          )
                        ) : isMealActivity(processedRoutine.category) ? (
                          isEditMode ? (
                            // In edit mode, render as clickable div instead of link
                            <div 
                              className="routine-item"
                              style={{ 
                                borderLeftColor: processedRoutine.category ? getCategoryColor(processedRoutine.category) : '#e1e5e9',
                                backgroundColor: processedRoutine.category ? getCategoryBackgroundTint(processedRoutine.category) : '#1a1a1a',
                                height: processedRoutine.isExtended ? `${(processedRoutine.rowSpan * 60) + ((processedRoutine.rowSpan - 1) * 10)}px` : 'auto',
                                cursor: 'pointer'
                              }}
                            >
                              <div className="routine-activity">
                                {renderActivity(processedRoutine.activity)}
                              </div>
                            </div>
                          ) : (
                            // Normal mode - render as link
                            <a 
                              href="/lifestyle/diet" 
                              style={{ 
                                textDecoration: 'none', 
                                display: 'block', 
                                height: '100%',
                                cursor: 'pointer'
                              }}
                            >
                              <div 
                                className="routine-item"
                                style={{ 
                                  borderLeftColor: processedRoutine.category ? getCategoryColor(processedRoutine.category) : '#e1e5e9',
                                  backgroundColor: processedRoutine.category ? getCategoryBackgroundTint(processedRoutine.category) : '#1a1a1a',
                                  height: processedRoutine.isExtended ? `${(processedRoutine.rowSpan * 60) + ((processedRoutine.rowSpan - 1) * 10)}px` : 'auto'
                                }}
                              >
                                <div className="routine-activity">
                                  {renderActivity(processedRoutine.activity)}
                                  {!isEditMode && (() => {
                                    const nextTime = getNextActivityTimeForDay(processedRoutine.time, day.day);
                                    if (nextTime) {
                                      const duration = calculateDuration(processedRoutine.time, nextTime);
                                      return duration ? (
                                        <span style={{ 
                                          fontSize: '11px', 
                                          color: '#95a5a6', 
                                          fontStyle: 'italic',
                                          fontWeight: 'normal'
                                        }}>
                                          {` (${duration})`}
                                        </span>
                                      ) : '';
                                    }
                                    return '';
                                  })()}
                                </div>
                              </div>
                            </a>
                          )
                        ) : (
                          <div 
                            className="routine-item"
                            style={{ 
                              borderLeftColor: processedRoutine.category ? getCategoryColor(processedRoutine.category) : '#e1e5e9',
                              backgroundColor: processedRoutine.category ? getCategoryBackgroundTint(processedRoutine.category) : '#1a1a1a',
                              height: processedRoutine.isExtended ? `${(processedRoutine.rowSpan * 60) + ((processedRoutine.rowSpan - 1) * 10)}px` : 'auto'
                            }}
                          >
                            <div className="routine-activity">
                              {renderActivity(processedRoutine.activity)}
                              {!isEditMode && (
                                <>
                                  {(() => {
                                    const nextTime = getNextActivityTimeForDay(processedRoutine.time, day.day);
                                    if (nextTime) {
                                      const duration = calculateDuration(processedRoutine.time, nextTime);
                                      return duration ? (
                                        <span style={{ 
                                          fontSize: '11px', 
                                          color: '#95a5a6', 
                                          fontStyle: 'italic',
                                          fontWeight: 'normal'
                                        }}>
                                          {` (${duration})`}
                                        </span>
                                      ) : '';
                                    }
                                    return '';
                                  })()}

                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Legend - Only show when logged in */}
      {isLoggedIn && (
        <div className="routine-legend">
          <h3>Activity Categories:</h3>
          <div className="legend-items">
            {/* System Categories */}
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getCategoryColor('work') }}></div>
              <span className="legend-label">Work</span>
            </div>
            {!isEditMode ? (
              <a href="/lifestyle/exercise" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="legend-item" style={{ cursor: 'pointer' }}>
                  <div className="legend-color" style={{ backgroundColor: getCategoryColor('exercise') }}></div>
                  <span className="legend-label">Exercise</span>
                </div>
              </a>
            ) : (
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: getCategoryColor('exercise') }}></div>
                <span className="legend-label">Exercise</span>
              </div>
            )}
            {!isEditMode ? (
              <a href="/lifestyle/diet" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="legend-item" style={{ cursor: 'pointer' }}>
                  <div className="legend-color" style={{ backgroundColor: getCategoryColor('meals') }}></div>
                  <span className="legend-label">Meals</span>
                </div>
              </a>
            ) : (
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: getCategoryColor('meals') }}></div>
                <span className="legend-label">Meals</span>
              </div>
            )}
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getCategoryColor('leisure') }}></div>
              <span className="legend-label">Leisure</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getCategoryColor('chores') }}></div>
              <span className="legend-label">Chores</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getCategoryColor('sleep') }}></div>
              <span className="legend-label">Sleep</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getCategoryColor('none') }}></div>
              <span className="legend-label">None</span>
            </div>
            
            {/* User Categories */}
            {userCategories.map((category, index) => (
              <div key={index} className="legend-item user-category">
                <div className="legend-color" style={{ backgroundColor: category.color }}></div>
                <span className="legend-label">{category.name}</span>
                {isEditMode && (
                  <button
                    className="delete-category-btn"
                    onClick={() => handleDeleteCategory(category.name)}
                    title={`Delete ${category.name} category`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            {/* Add Category Button - Only show in edit mode */}
            {isEditMode && (
              <button
                className="add-category-btn"
                onClick={() => setShowCategoryModal(true)}
                title="Add new category"
              >
                +
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inline Edit Form for Individual Cell */}
      {editingCell && (
        <div className="edit-overlay">
          <div className="edit-form">
            <h3>Edit Activity</h3>
            <p>Day: {getDisplayDayName(editingCell.day)} at {editingCell.time}</p>
            
            <div className="form-group">
              <label htmlFor="activity">Activity:</label>
              <input
                type="text"
                id="activity"
                value={editFormData.activity}
                onChange={(e) => setEditFormData({ ...editFormData, activity: e.target.value })}
                placeholder="Enter activity..."
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              >
                <option value="">None</option>
                <option value="work">Work</option>
                <option value="exercise">Exercise</option>
                <option value="meals">Meals</option>
                <option value="leisure">Leisure</option>
                <option value="chores">Chores</option>
                <option value="sleep">Sleep</option>
                {/* User Categories */}
                {userCategories.map((category, index) => (
                  <option key={index} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button onClick={handleSaveCell} className="save-btn">Save</button>
              <button onClick={handleDeleteCell} className="delete-btn">Delete</button>
              <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

             {/* Row Edit Form for All Days */}
       {editingRow && (
         <div className="edit-overlay">
           <div className="edit-form">
             <h3>Edit Row for All Days</h3>
             <p>Time: {editingRow}</p>
             <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '20px' }}>
               This will set the same activity and category for all 7 days. You can also change the time slot below.
             </p>
             
             <div className="form-group">
               <label htmlFor="row-activity">Activity:</label>
               <input
                 type="text"
                 id="row-activity"
                 value={rowEditData.activity}
                 onChange={(e) => setRowEditData({ ...rowEditData, activity: e.target.value })}
                 placeholder="Enter activity..."
                 autoFocus
               />
             </div>
             
             <div className="form-group">
               <label htmlFor="row-category">Category:</label>
               <select
                 id="row-category"
                 value={rowEditData.category}
                 onChange={(e) => setRowEditData({ ...rowEditData, category: e.target.value })}
               >
                 <option value="">None</option>
                 <option value="work">Work</option>
                 <option value="exercise">Exercise</option>
                 <option value="meals">Meals</option>
                 <option value="leisure">Leisure</option>
                 <option value="chores">Chores</option>
                 <option value="sleep">Sleep</option>
               </select>
             </div>
             
             <div className="form-group">
               <label>Change Time:</label>
               <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                 <select
                   value={rowEditData.newTime}
                   onChange={(e) => {
                     if (e.target.value) {
                       handleChangeTime(e.target.value);
                     } else {
                       setRowEditData({ ...rowEditData, newTime: '' });
                     }
                   }}
                   style={{ flex: 1 }}
                 >
                   {generateTimeDropdownOptions().map(option => (
                     <option key={option.value} value={option.value}>
                       {option.label}
                     </option>
                   ))}
                 </select>
               </div>
               {rowEditData.newTime && (
                 <p style={{ fontSize: '12px', color: '#3498db', marginTop: '5px', marginBottom: '0' }}>
                   Will move activity from {editingRow} to {rowEditData.newTime} for all days when saved
                 </p>
               )}
             </div>
             
             <div className="form-actions">
               <button onClick={handleSaveRow} className="save-btn">Save</button>
               <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
             </div>
           </div>
                 </div>
      )}
      
      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="edit-overlay">
          <div className="edit-form">
            <h3>Add New Category</h3>
            
            <div className="form-group">
              <label htmlFor="categoryName">Category Name:</label>
              <input
                type="text"
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name..."
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label>Category Color:</label>
              <div className="color-selection-grid">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${newCategoryColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategoryColor(color)}
                    title={`Select ${color}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button onClick={handleAddCategory} className="save-btn">Add Category</button>
              <button onClick={() => setShowCategoryModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routine;