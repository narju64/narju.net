import React, { useState } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import './DateConverter.css';

const DateConverter: React.FC = () => {
  const [gregorianDate, setGregorianDate] = useState(new Date().toISOString().split('T')[0]);
  const [orbitalDate, setOrbitalDate] = useState<OrbitalDate>(orbitalCalendar.getCurrentOrbitalDate());

  // When Gregorian changes, update Orbital
  const handleGregorianChange = (dateString: string) => {
    setGregorianDate(dateString);
    // Parse as local date
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const orbital = orbitalCalendar.gregorianToOrbital(date);
    setOrbitalDate(orbital);
  };

  // When Orbital changes, update Gregorian
  const handleOrbitalChange = (field: 'year' | 'month' | 'day', value: number) => {
    let newOrbitalDate = { ...orbitalDate };

    if (field === 'month') {
      newOrbitalDate.month = value;
      if (value === 0) {
        // Special month: always reset to Urobor
        newOrbitalDate.day = 1;
        newOrbitalDate.isSpecialDay = true;
        newOrbitalDate.specialDayType = 'urobor';
      } else {
        // Regular month: clear special flags
        newOrbitalDate.isSpecialDay = false;
        newOrbitalDate.specialDayType = undefined;
        // Clamp day to 28 if needed
        if (newOrbitalDate.day > 28) newOrbitalDate.day = 28;
      }
    } else if (field === 'day') {
      newOrbitalDate.day = value;
      if (newOrbitalDate.month === 0) {
        if (value === 1) {
          newOrbitalDate.isSpecialDay = true;
          newOrbitalDate.specialDayType = 'urobor';
        } else if (value === 2 && (newOrbitalDate.year + 1) % 4 === 0) {
          newOrbitalDate.isSpecialDay = true;
          newOrbitalDate.specialDayType = 'leap-day';
        } else {
          // Invalid day for special month, reset to 1
          newOrbitalDate.day = 1;
          newOrbitalDate.isSpecialDay = true;
          newOrbitalDate.specialDayType = 'urobor';
        }
      } else {
        newOrbitalDate.isSpecialDay = false;
        newOrbitalDate.specialDayType = undefined;
      }
    } else if (field === 'year') {
      newOrbitalDate.year = value;
      // If currently on Leap Day, but new year is not leap, reset to Urobor
      if (newOrbitalDate.month === 0 && newOrbitalDate.day === 2 && (value + 1) % 4 !== 0) {
        newOrbitalDate.day = 1;
        newOrbitalDate.isSpecialDay = true;
        newOrbitalDate.specialDayType = 'urobor';
      } else if (newOrbitalDate.month === 0) {
        // Update special flags for special month
        if (newOrbitalDate.day === 1) {
          newOrbitalDate.isSpecialDay = true;
          newOrbitalDate.specialDayType = 'urobor';
        } else if (newOrbitalDate.day === 2 && (value + 1) % 4 === 0) {
          newOrbitalDate.isSpecialDay = true;
          newOrbitalDate.specialDayType = 'leap-day';
        } else {
          newOrbitalDate.day = 1;
          newOrbitalDate.isSpecialDay = true;
          newOrbitalDate.specialDayType = 'urobor';
        }
      }
    }

    setOrbitalDate(newOrbitalDate);
    const gregorian = orbitalCalendar.orbitalToGregorian(newOrbitalDate);
    setGregorianDate(gregorian.toISOString().split('T')[0]);
  };

  return (
    <div className="date-converter">
      <h3 className="date-converter-title">Date Converter</h3>
      <p className="date-converter-note">Changing either date will update the other automatically.</p>
      <div className="date-converter-cols">
        {/* Gregorian Date Input */}
        <div className="date-col">
          <label className="date-label">Gregorian Date</label>
          <input
            type="date"
            value={gregorianDate}
            onChange={(e) => handleGregorianChange(e.target.value)}
            className="date-input"
          />
          <div className="date-preview">
            {(() => {
              const [year, month, day] = gregorianDate.split('-').map(Number);
              const localDate = new Date(year, month - 1, day);
              return localDate.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              });
            })()}
          </div>
        </div>
        {/* Orbital Date Input */}
        <div className="date-col">
          <label className="date-label">Orbital Date</label>
          <div className="orbital-inputs-row">
            <div>
              <label className="date-label">Month</label>
              <select
                name="month"
                value={orbitalDate.month}
                onChange={(e) => handleOrbitalChange('month', parseInt(e.target.value))}
                className="date-input"
              >
                <option value={0}>00. Special</option>
                {Array.from({ length: 13 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {month.toString().padStart(2, '0')}. {orbitalCalendar.getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="date-label">Day</label>
              <select
                name="day"
                value={orbitalDate.day}
                onChange={(e) => handleOrbitalChange('day', parseInt(e.target.value))}
                className="date-input"
              >
                {orbitalDate.month === 0 ? (
                  <>
                    <option value={1}>1</option>
                    {(orbitalDate.year + 1) % 4 === 0 && <option value={2}>2</option>}
                  </>
                ) : (
                  Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="date-label">Year</label>
              <select
                name="year"
                value={orbitalDate.year}
                onChange={(e) => handleOrbitalChange('year', parseInt(e.target.value))}
                className="date-input"
              >
                {Array.from({ length: 201 }, (_, i) => 1900 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="date-preview">
            {orbitalCalendar.formatOrbitalDate(orbitalDate, false)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateConverter; 