import React, { useState, useEffect } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import DateConverter from './DateConverter';

const OrbitalCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<OrbitalDate>(orbitalCalendar.getCurrentOrbitalDate());
  const [selectedYear, setSelectedYear] = useState(currentDate.year);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.month);
  const [showGregorian, setShowGregorian] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(orbitalCalendar.getCurrentOrbitalDate());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleDateSelect = (date: OrbitalDate) => {
    setCurrentDate(date);
    // Don't change the selected month when clicking special days
    // They should stay within their respective month view
  };

  const getDaysInSelectedMonth = () => {
    const regularDays = orbitalCalendar.getDaysInMonth(selectedYear, selectedMonth);
    
    // Add special days to December and March
    if (selectedMonth === 10) { // December
      const urobor = orbitalCalendar.getDaysInMonth(selectedYear, 0).find(day => day.specialDayType === 'urobor');
      if (urobor) {
        return [...regularDays, urobor];
      }
    } else if (selectedMonth === 13) { // March
      const leapDay = orbitalCalendar.getDaysInMonth(selectedYear, 0).find(day => day.specialDayType === 'leap-day');
      if (leapDay) {
        return [...regularDays, leapDay];
      }
    }
    
    return regularDays;
  };

  const isToday = (date: OrbitalDate) => {
    const today = orbitalCalendar.getCurrentOrbitalDate();
    return date.year === today.year && date.month === today.month && date.day === today.day;
  };

  const isSelected = (date: OrbitalDate) => {
    return date.year === currentDate.year && date.month === currentDate.month && date.day === currentDate.day;
  };

  // Get Gregorian day of week name
  const getGregorianWeekDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="orbital-calendar-page">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Orbital Calendar</h1>
          <p className="text-xl text-gray-600 mb-6">
            A fixed 13-month calendar system beginning on the Spring Equinox
          </p>
          
          {/* Current Date Display */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-2">Current Orbital Date</h2>
            <p className="text-lg">
              {orbitalCalendar.formatOrbitalDate(currentDate, showGregorian)}
            </p>
            <button
              onClick={() => setShowGregorian(!showGregorian)}
              className="mt-2 text-sm bg-white bg-opacity-20 px-3 py-1 rounded hover:bg-opacity-30 transition-all"
            >
              {showGregorian ? 'Hide' : 'Show'} Gregorian Reference
            </button>
          </div>
        </div>

        {/* Date Converter */}
        <div className="mb-12">
          <DateConverter />
        </div>

        {/* Calendar System Explanation */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Calendar Structure</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>13 Months</strong> per year (364 days total)</li>
              <li>• <strong>28 Days</strong> per month (4 weeks of 7 days)</li>
              <li>• <strong>Urobor</strong> - Special day on December 25</li>
              <li>• <strong>Leap Day</strong> - Additional day in leap years</li>
              <li>• Begins on <strong>Spring Equinox</strong> (March 20)</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Philosophy</h3>
            <p className="text-gray-600 mb-4">
              This fixed 13-month calendar offers a more organized, consistent, and predictable 
              structure compared to the traditional Gregorian calendar.
            </p>
            <p className="text-gray-600">
              Each month contains exactly 4 weeks, making planning and scheduling more harmonious 
              and aligned with natural cycles.
            </p>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 10 }, (_, i) => currentDate.year - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 13 }, (_, i) => i + 1).map(month => {
                  const monthName = orbitalCalendar.getMonthName(month);
                  let displayName = `${month.toString().padStart(2, '0')}. ${monthName}`;
                  
                  // Add special day indicators
                  if (month === 10) {
                    displayName += ' & Urobor';
                  } else if (month === 13) {
                    displayName += ' & Leap Day';
                  }
                  
                  return (
                    <option key={month} value={month}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Monday', 'Tuesday', 'Gaiday', 'Quaday', 'Friday', 'Kinday', 'Sunday'].map((dayName) => (
              <th key={dayName}>{dayName}</th>
            ))}
            
            {/* Regular calendar days only */}
            {getDaysInSelectedMonth()
              .filter(date => !date.isSpecialDay)
              .map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`
                  p-3 text-center rounded-lg transition-all hover:shadow-md
                  ${isToday(date) 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold' 
                    : isSelected(date)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <div className="text-lg font-semibold">
                  {date.day}
                </div>
                <div className="text-xs opacity-75">
                  {getGregorianWeekDayName(date.gregorianDate)}
                </div>
                {showGregorian && (
                  <div className="text-xs opacity-60 mt-1">
                    {date.gregorianDate.toLocaleDateString()}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Special Days - after the grid, full width in the same container */}
          {getDaysInSelectedMonth().filter(date => date.isSpecialDay).map((date, idx) => (
            <div key={`special-${idx}`} className="grid grid-cols-1 mt-4">
              <button
                onClick={() => handleDateSelect(date)}
                className={`
                  w-full block p-8 text-center rounded-lg transition-all hover:shadow-md
                  ${isToday(date)
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold'
                    : isSelected(date)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <div className="text-3xl font-semibold mb-3">
                  {date.specialDayType === 'urobor' ? 'Urobor' : 'Leap Day'}
                </div>
                <div className="text-lg opacity-75">
                  {getGregorianWeekDayName(date.gregorianDate)} • {date.gregorianDate.toLocaleDateString()}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Selected Date Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Selected Date Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Orbital Information</h4>
              {currentDate.isSpecialDay ? (
                <p className="text-gray-600">
                  <strong>Day:</strong> {currentDate.specialDayType === 'urobor' ? 'Urobor' : 'Leap Day'}<br/>
                  <strong>Year:</strong> {currentDate.year}<br/>
                  <strong>Type:</strong> Special Day
                </p>
              ) : (
                <p className="text-gray-600">
                  <strong>Day:</strong> {currentDate.day}<br/>
                  <strong>Week Day:</strong> {orbitalCalendar.getWeekDayName(currentDate.weekDay)}<br/>
                  <strong>Month:</strong> {orbitalCalendar.getMonthName(currentDate.month)}<br/>
                  <strong>Year:</strong> {currentDate.year}
                </p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Gregorian Reference</h4>
              <p className="text-gray-600">
                <strong>Date:</strong> {currentDate.gregorianDate.toLocaleDateString()}<br/>
                <strong>Day:</strong> {currentDate.gregorianDate.toLocaleDateString('en-US', { weekday: 'long' })}<br/>
                <strong>Month:</strong> {currentDate.gregorianDate.toLocaleDateString('en-US', { month: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* Month Reference Table */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Month Reference</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Month Names & Gregorian Dates</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>01. April - March 20 - April 16</div>
                <div>02. Ceres - April 17 - May 14</div>
                <div>03. May - May 15 - June 11</div>
                <div>04. June - June 12 - July 9</div>
                <div>05. July - July 10 - August 6</div>
                <div>06. Hexember - August 7 - September 3</div>
                <div>07. September - September 4 - October 1</div>
                <div>08. October - October 2 - 29</div>
                <div>09. November - October 30 - November 26</div>
                <div>10. December & Urobor - November 27 - December 25</div>
                <div>11. January - December 26 - January 22</div>
                <div>12. February - January 23 - February 19</div>
                <div>13. March & Leap Day - February 20 - March 19</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Week Days</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>1. Monday</div>
                <div>2. Tuesday</div>
                <div>3. Gaiday</div>
                <div>4. Quaday</div>
                <div>5. Friday</div>
                <div>6. Kinday</div>
                <div>7. Sunday</div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Features Preview */}
        <div className="mt-12 bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Coming Soon: Routines Integration</h3>
          <p className="mb-4">
            The Orbital Calendar will soon integrate with a personal routines system, 
            allowing you to plan daily, weekly, and monthly activities that align with 
            the natural cycles and energy of each period.
          </p>
          <ul className="space-y-1 text-sm opacity-90">
            <li>• Daily routines synchronized with week day themes</li>
            <li>• Monthly planning based on month characteristics</li>
            <li>• Special day observances and traditions</li>
            <li>• Progress tracking through orbital time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrbitalCalendarPage; 