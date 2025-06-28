import React, { useState } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';

const DateConverter: React.FC = () => {
  const [gregorianDate, setGregorianDate] = useState(new Date().toISOString().split('T')[0]);
  const [orbitalDate, setOrbitalDate] = useState<OrbitalDate>(orbitalCalendar.getCurrentOrbitalDate());
  const [conversionMode, setConversionMode] = useState<'gregorian-to-orbital' | 'orbital-to-gregorian'>('gregorian-to-orbital');

  const handleGregorianChange = (dateString: string) => {
    setGregorianDate(dateString);
    if (conversionMode === 'gregorian-to-orbital') {
      const date = new Date(dateString);
      const orbital = orbitalCalendar.gregorianToOrbital(date);
      setOrbitalDate(orbital);
    }
  };

  const handleOrbitalChange = (field: 'year' | 'month' | 'day', value: number) => {
    const newOrbitalDate = { 
      ...orbitalDate, 
      [field]: value,
      isSpecialDay: value === 0 // If month is 0, it's a special day
    };
    setOrbitalDate(newOrbitalDate);
    
    if (conversionMode === 'orbital-to-gregorian') {
      const gregorian = orbitalCalendar.orbitalToGregorian(newOrbitalDate);
      setGregorianDate(gregorian.toISOString().split('T')[0]);
    }
  };

  const handleSpecialDayChange = (specialDayType: 'urobor' | 'leap-day') => {
    const newOrbitalDate = {
      ...orbitalDate,
      month: 0,
      day: specialDayType === 'urobor' ? 1 : 2,
      weekDay: 0,
      isSpecialDay: true,
      specialDayType
    };
    setOrbitalDate(newOrbitalDate);
    
    if (conversionMode === 'orbital-to-gregorian') {
      const gregorian = orbitalCalendar.orbitalToGregorian(newOrbitalDate);
      setGregorianDate(gregorian.toISOString().split('T')[0]);
    }
  };

  const convertDate = () => {
    if (conversionMode === 'gregorian-to-orbital') {
      const date = new Date(gregorianDate);
      const orbital = orbitalCalendar.gregorianToOrbital(date);
      setOrbitalDate(orbital);
    } else {
      const gregorian = orbitalCalendar.orbitalToGregorian(orbitalDate);
      setGregorianDate(gregorian.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="date-converter bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Date Converter</h3>
      
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setConversionMode('gregorian-to-orbital')}
            className={`px-4 py-2 rounded transition-all ${
              conversionMode === 'gregorian-to-orbital'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Gregorian → Orbital
          </button>
          <button
            onClick={() => setConversionMode('orbital-to-gregorian')}
            className={`px-4 py-2 rounded transition-all ${
              conversionMode === 'orbital-to-gregorian'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Orbital → Gregorian
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gregorian Date Input */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Gregorian Date</h4>
          <input
            type="date"
            value={gregorianDate}
            onChange={(e) => handleGregorianChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-600 mt-1">
            {new Date(gregorianDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Orbital Date Input */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Orbital Date</h4>
          
          {/* Special Day Selection */}
          <div className="mb-3">
            <label className="text-sm text-gray-600">Special Days:</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => handleSpecialDayChange('urobor')}
                className={`px-3 py-1 text-sm rounded border transition-all ${
                  orbitalDate.isSpecialDay && orbitalDate.specialDayType === 'urobor'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                Urobor (00/01)
              </button>
              <button
                onClick={() => handleSpecialDayChange('leap-day')}
                className={`px-3 py-1 text-sm rounded border transition-all ${
                  orbitalDate.isSpecialDay && orbitalDate.specialDayType === 'leap-day'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                Leap Day (00/02)
              </button>
            </div>
          </div>

          {/* Regular Date Inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-sm text-gray-600">Year</label>
              <input
                type="number"
                value={orbitalDate.year}
                onChange={(e) => handleOrbitalChange('year', parseInt(e.target.value) || 2024)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Month</label>
              <select
                value={orbitalDate.month}
                onChange={(e) => handleOrbitalChange('month', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Special Days (00)</option>
                {Array.from({ length: 13 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {month.toString().padStart(2, '0')}. {orbitalCalendar.getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Day</label>
              <input
                type="number"
                min="1"
                max="28"
                value={orbitalDate.day}
                onChange={(e) => handleOrbitalChange('day', parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={orbitalDate.isSpecialDay}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {orbitalCalendar.formatOrbitalDate(orbitalDate, false)}
          </p>
        </div>
      </div>

      <button
        onClick={convertDate}
        className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        Convert Date
      </button>
    </div>
  );
};

export default DateConverter; 