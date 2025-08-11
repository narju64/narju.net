import React, { useState } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import { 
  formatOrbitalDate, 
  formatGregorianDate, 
  getDayName,
  DayRoutine
} from '../utils/routineLogic';
import { isCurrentTime } from '../utils/routineLogic';
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
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  // Load user settings from database
  const loadUserSettings = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        console.log('No current user found in localStorage, skipping user settings load');
        return;
      }

      const userData = JSON.parse(currentUser);
      const userId = userData.id || userData.userId;
      
      if (!userId) {
        console.log('No valid user ID found in current user data');
        return;
      }

      console.log('Loading user settings for userId:', userId);

      const response = await fetch(buildApiUrl(`/api/users/${userId}/settings`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Settings load response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Settings load response data:', data);
        if (data.settings && data.settings.calendarMode) {
          console.log('Setting calendar mode from loaded settings:', data.settings.calendarMode);
          setIsGregorianMode(data.settings.calendarMode === 'gregorian');
          setOriginalCalendarMode(data.settings.calendarMode === 'gregorian'); // Initialize original
        } else {
          console.log('No calendar mode setting found in loaded settings');
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
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        console.error('No current user found in localStorage');
        return;
      }

      const userData = JSON.parse(currentUser);
      const userId = userData.id || userData.userId;
      
      if (!userId) {
        console.error('No valid user ID found in current user data');
        return;
      }

      console.log('Attempting to save user settings:', { userId, settings });

      const response = await fetch(buildApiUrl(`/api/users/${userId}/settings`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });

      console.log('Settings save response status:', response.status);
      console.log('Settings save response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save user settings. Status:', response.status, 'Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Settings saved successfully:', responseData);
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error; // Re-throw so the caller can handle it
    }
  };

  // Check if user is logged in and fetch appropriate routine data
  React.useEffect(() => {
    const loggedIn = !!(localStorage.getItem('currentUser') && localStorage.getItem('authToken'));
    setIsLoggedIn(loggedIn);
    
    // Always fetch routine data - system routine for non-logged-in, user routine for logged-in
    fetchRoutineData(loggedIn);
    
    // If logged in, load user settings including calendar preference
    if (loggedIn) {
      loadUserSettings();
    }
  }, []);

  // Automatically update hasUnsavedChanges when any changes are made
  React.useEffect(() => {
    // Check if there are actual changes in deleted timeslots (not just if they exist)
    const hasDeletedTimeslotChanges = deletedTimeSlots.length !== originalDeletedTimeSlots.length || 
      deletedTimeSlots.some((time: string) => !originalDeletedTimeSlots.includes(time)) ||
      originalDeletedTimeSlots.some((time: string) => !deletedTimeSlots.includes(time));
    
    // Check if calendar mode has changed
    const hasCalendarModeChanges = isGregorianMode !== originalCalendarMode;
    
    const hasChanges = Object.keys(pendingChanges).length > 0 || 
                      addedTimeSlots.length > 0 || 
                      hasDeletedTimeslotChanges ||
                      hasCalendarModeChanges;
    
    setHasUnsavedChanges(hasChanges);
  }, [pendingChanges, addedTimeSlots, deletedTimeSlots, originalDeletedTimeSlots, isGregorianMode, originalCalendarMode]);

  const fetchRoutineData = async (isUserLoggedIn: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = '/api/lists/routine'; // Default system routine endpoint
      let headers: HeadersInit = {};
      
      if (isUserLoggedIn) {
        // Get user ID from localStorage (assuming it's stored there)
        const currentUser = localStorage.getItem('currentUser');
        const authToken = localStorage.getItem('authToken');
        
        if (currentUser && authToken) {
          try {
            const userData = JSON.parse(currentUser);
            const userId = userData.id || userData.userId;
            if (userId) {
              endpoint = `/api/users/${userId}/routines`;
              headers = {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              };
            }
          } catch (parseError) {
            console.error('Error parsing current user data:', parseError);
            // Fallback to system routine if parsing fails
            endpoint = '/api/lists/routine';
          }
        }
      }
      
      console.log('Fetching routine data from:', endpoint);
      console.log('Headers:', headers);
      
      const response = await fetch(buildApiUrl(endpoint), { headers });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        // Don't treat 401 (no user routines) as an error - it's expected
        if (isUserLoggedIn && response.status === 401) {
          // User is logged in but has no personal routines yet
          console.log('User has no personal routines yet, setting empty data');
          setRoutineData([]);
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('Received data:', data);
      
      if (data.list && data.list.items_json && data.list.items_json.length > 0) {
        console.log('Using system routine data');
        setRoutineData(data.list.items_json);
      } else if (data.routines && data.routines.length > 0) {
        // Handle user routines response format
        console.log('Using user routine data');
        setRoutineData(data.routines);
      } else {
        console.log('No routine data found, setting empty array');
        setRoutineData([]);
      }
      
      // If user is logged in, also fetch their deleted timeslots
      if (isUserLoggedIn) {
        try {
          const currentUser = localStorage.getItem('currentUser');
          const authToken = localStorage.getItem('authToken');
          
          if (currentUser && authToken) {
            const userData = JSON.parse(currentUser);
            const userId = userData.id || userData.userId;
            
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
                console.log('Loaded deleted timeslots:', deletedTimes);
              } else {
                console.log('No deleted timeslots found or error occurred');
                setDeletedTimeSlots([]);
                setOriginalDeletedTimeSlots([]);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching deleted timeslots:', error);
          setDeletedTimeSlots([]);
        }
      }
    } catch (err) {
      console.error('Error fetching routine data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
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
    console.log('Original times from data:', times);
    
    // Sort times chronologically by converting to comparable values
    const sortedTimes = times.sort((a, b) => {
      const timeA = convertTimeToMinutes(a);
      const timeB = convertTimeToMinutes(b);
      console.log(`Comparing ${a} (${timeA}) vs ${b} (${timeB})`);
      return timeA - timeB;
    });
    
    console.log('Sorted times:', sortedTimes);
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

  // Generate all available times in 15-minute intervals for the Change Time dropdown
  const generateAllAvailableTimes = (): string[] => {
    const allTimes: string[] = [];
    
    // Generate times from 6:00 AM to 10:00 PM in 15-minute intervals
    for (let hour = 6; hour <= 22; hour++) {
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
      
      // If not in edit mode or not logged in, return actual routine data
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
    for (let i = 0; i < routines.length; i++) {
      const routine = routines[i];
      const changeKey = `${dayNumber}-${routine.time}`;
      const pendingChange = pendingChanges[changeKey];
      
      // Check if this activity is marked for deletion
      const isDeleted = pendingChange && pendingChange.activity === '';
      const activity = isDeleted ? '' : (pendingChange ? pendingChange.activity : (routine.activity || ''));
      
      if (activity) {
        // This slot has an activity, calculate how many empty slots follow
        let rowSpan = 1;
        let j = i + 1;
        
        // Count consecutive empty slots
        while (j < routines.length && !routines[j].activity) {
          rowSpan++;
          j++;
        }
        
        processed.push({
          time: routine.time,
          activity: activity,
          category: isDeleted ? '' : (pendingChange ? pendingChange.category : (routine.category || '')),
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
  const processedWeeklyRoutine = weeklyRoutine.map(day => ({
    day: day.day,
    processedRoutines: processRoutineForDay(day.routines, day.day)
  }));

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'health': '#27ae60',
      'leisure': '#3498db',
      'meal': '#e74c3c',
      'meals': '#e74c3c', // Alias for meal
      'chores': '#9b59b6',
      'work': '#f39c12',
      'exercise': '#27ae60',
      'sleep': '#8e44ad',
      'other': '#95a5a6'
    };
    return colors[category] || '#95a5a6';
  };

  const getCategoryBackgroundTint = (category: string) => {
    const tints: { [key: string]: string } = {
      'health': 'rgba(39, 174, 96, 0.05)',
      'leisure': 'rgba(52, 152, 219, 0.05)',
      'meal': 'rgba(231, 76, 60, 0.05)',
      'meals': 'rgba(231, 76, 60, 0.05)', // Alias for meal
      'chores': 'rgba(155, 89, 182, 0.05)',
      'work': 'rgba(243, 156, 18, 0.05)',
      'exercise': 'rgba(39, 174, 96, 0.05)',
      'sleep': 'rgba(142, 68, 173, 0.05)',
      'other': 'rgba(149, 165, 166, 0.05)'
    };
    return tints[category] || 'transparent';
  };




  // Check if an activity is exercise-related
  const isExerciseActivity = (activity: string): boolean => {
    const exerciseKeywords = ['exercise', 'upper body', 'vert', 'core', 'workout'];
    return exerciseKeywords.some(keyword => 
      activity.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Check if an activity is meal-related
  const isMealActivity = (activity: string): boolean => {
    const mealKeywords = ['breakfast', 'lunch', 'dinner', 'meal', 'eat', 'food'];
    return mealKeywords.some(keyword => 
      activity.toLowerCase().includes(keyword.toLowerCase())
    );
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
    return isCurrentDay(dayNumber) && isCurrentTime(time);
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
  
  if (Object.keys(pendingChanges).length === 0 && addedTimeSlots.length === 0 && !hasDeletedTimeslotChanges && !hasCalendarModeChanges) {
    alert('No changes to save.');
    return;
  }
    
    try {
      console.log('Starting to save routines...');
      console.log('Pending changes:', pendingChanges);
      console.log('Deleted timeslots changes:', hasDeletedTimeslotChanges);
      console.log('Current deletedTimeSlots:', deletedTimeSlots);
      console.log('Original deletedTimeSlots:', originalDeletedTimeSlots);
      
      // Get user ID from localStorage
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        console.error('No current user data found');
        return;
      }
      
      const userData = JSON.parse(currentUser);
      const userId = userData.id || userData.userId;
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      console.log('User ID:', userId);
      
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
      
      console.log('Routines to save:', routinesToSave);
      console.log('Routines to delete:', routinesToDelete);
      
      // Handle timeslot deletions and restorations FIRST
      const newlyDeletedTimeslots = deletedTimeSlots.filter(time => !originalDeletedTimeSlots.includes(time));
      const newlyRestoredTimeslots = originalDeletedTimeSlots.filter(time => !deletedTimeSlots.includes(time));
      
      // Save newly deleted timeslots
      if (newlyDeletedTimeslots.length > 0) {
        console.log('Saving newly deleted timeslots:', newlyDeletedTimeslots);
        const deletedTimeslotsResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/deleted-timeslots`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ timeslots: newlyDeletedTimeslots })
        });
        
        if (!deletedTimeslotsResponse.ok) {
          const errorData = await deletedTimeslotsResponse.json();
          console.error('Failed to save newly deleted timeslots:', errorData);
          alert(`Failed to save newly deleted timeslots: ${errorData.error || 'Unknown error'}`);
          return;
        }
        console.log('Newly deleted timeslots saved successfully');
      }
      
      // Remove newly restored timeslots from database
      if (newlyRestoredTimeslots.length > 0) {
        console.log('Removing newly restored timeslots from database:', newlyRestoredTimeslots);
        const restoreTimeslotsResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/deleted-timeslots`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ timeslots: newlyRestoredTimeslots })
        });
        
        if (!restoreTimeslotsResponse.ok) {
          const errorData = await restoreTimeslotsResponse.json();
          console.error('Failed to restore timeslots:', errorData);
          alert(`Failed to restore timeslots: ${errorData.error || 'Unknown error'}`);
          return;
        }
        console.log('Timeslots restored successfully');
      }
      
      // Then, delete any routines marked for deletion
      if (routinesToDelete.length > 0) {
        console.log('Deleting routines...');
        const deleteResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/delete`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ routines: routinesToDelete })
        });
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          console.error('Routine deletion failed:', errorData);
          alert(`Failed to delete routines: ${errorData.error || 'Unknown error'}`);
          return;
        }
        console.log('Routines deleted successfully');
      }
      
      // Then, save any new/updated routines
      if (routinesToSave.length > 0) {
        console.log('Saving routines...');
        const saveResponse = await fetch(buildApiUrl(`/api/users/${userId}/routines/bulk-upsert`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ routines: routinesToSave })
        });
        
        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          console.error('Routine save failed:', errorData);
          alert(`Failed to save routines: ${errorData.error || 'Unknown error'}`);
          return;
        }
        console.log('Routines saved successfully');
      }
      
      // Save calendar mode setting if it has changed
      if (isGregorianMode !== originalCalendarMode) {
        console.log('Saving calendar mode setting...');
        console.log('Current isGregorianMode:', isGregorianMode);
        console.log('Current originalCalendarMode:', originalCalendarMode);
        try {
          const settingsToSave = { calendarMode: isGregorianMode ? 'gregorian' : 'orbital' };
          console.log('Settings to save:', settingsToSave);
          await saveUserSettings(settingsToSave);
          console.log('Calendar mode setting saved successfully');
        } catch (error) {
          console.error('Failed to save calendar mode setting:', error);
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
        {error && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#e53e3e' }}>
            Error loading routine: {error}
          </div>
        )}

        {!isLoggedIn && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#3498db', fontWeight: 'bold' }}>
            Viewing system routine - log in to customize your own
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

      {weeklyRoutine.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#95a5a6' }}>
          {loading ? 'Loading routine...' : 'No routine data available'}
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
                            if (!nextTime) return null;
                            
                            const intermediateTimes = generateIntermediateTimes(time, nextTime);
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
                    className={`time-cell ${isCurrentTime(time) ? 'current-time' : ''} ${isEditMode ? 'clickable-time' : ''}`}
                    onClick={isEditMode ? () => handleTimeHeaderClick(time) : undefined}
                    style={isEditMode ? { cursor: 'pointer' } : {}}
                  >
                    {time}
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
                  {processedWeeklyRoutine.map(day => {
                    const processedRoutine = day.processedRoutines.find(r => r.time === time);
                    
                    if (!processedRoutine) {
                      // This time slot is empty and covered by an extended cell above
                      return (
                        <td 
                          key={day.day} 
                          className="routine-cell hidden-cell"
                          onClick={isEditMode ? () => handleCellClick(day.day, time, '', 'health') : undefined}
                          style={isEditMode ? { cursor: 'pointer', backgroundColor: 'rgba(52, 152, 219, 0.1)' } : {}}
                        >
                          {isEditMode && (
                            <div style={{ 
                              textAlign: 'center', 
                              color: '#3498db', 
                              fontSize: '12px',
                              padding: '4px'
                            }}>
                              + Add
                            </div>
                          )}
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
                        ) : isExerciseActivity(processedRoutine.activity) ? (
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
                                </div>
                              </div>
                            </a>
                          )
                        ) : isMealActivity(processedRoutine.activity) ? (
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

      {/* Category Legend */}
      <div className="routine-legend">
        <h3>Activity Categories</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getCategoryColor('work') }}></div>
            <span className="legend-label">Work</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getCategoryColor('exercise') }}></div>
            <span className="legend-label">Exercise</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getCategoryColor('health') }}></div>
            <span className="legend-label">Health</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getCategoryColor('meals') }}></div>
            <span className="legend-label">Meals</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getCategoryColor('leisure') }}></div>
            <span className="legend-label">Leisure</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getCategoryColor('sleep') }}></div>
            <span className="legend-label">Sleep</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getCategoryColor('chores') }}></div>
            <span className="legend-label">Chores</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: getCategoryColor('other') }}></div>
            <span className="legend-label">Other</span>
          </div>
        </div>
      </div>

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
                <option value="health">Health</option>
                <option value="meals">Meals</option>
                <option value="leisure">Leisure</option>
                <option value="sleep">Sleep</option>
                <option value="chores">Chores</option>
                <option value="other">Other</option>
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
                 <option value="health">Health</option>
                 <option value="meals">Meals</option>
                 <option value="leisure">Leisure</option>
                 <option value="sleep">Sleep</option>
                 <option value="chores">Chores</option>
                 <option value="other">Other</option>
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
    </div>
  );
};

export default Routine;