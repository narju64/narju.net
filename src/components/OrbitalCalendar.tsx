import React, { useState, useEffect } from 'react';
import { orbitalCalendar, OrbitalDate } from '../utils/orbitalCalendar';
import DateConverter from './DateConverter';
import './OrbitalCalendar.css';

const OrbitalCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<OrbitalDate>(orbitalCalendar.getCurrentOrbitalDate());
  const [selectedYear, setSelectedYear] = useState(currentDate.year);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.month);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(orbitalCalendar.getCurrentOrbitalDate());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getDaysInSelectedMonth = () => {
    const regularDays = orbitalCalendar.getDaysInMonth(selectedYear, selectedMonth);
    if (selectedMonth === 10) {
      const urobor = orbitalCalendar.getDaysInMonth(selectedYear, 0).find(day => day.specialDayType === 'urobor');
      if (urobor) {
        return [...regularDays, urobor];
      }
    } else if (selectedMonth === 13) {
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

  const getGregorianWeekDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="orbital-calendar-container">
      {/* Current Date Display */}
      <div className="calendar-current-date-container">
        <h2 className="calendar-current-date-title">Current Orbital Date</h2>
        <div className="calendar-current-date-line">
          <span className="calendar-current-date-label">Orbital:</span> {orbitalCalendar.formatOrbitalDate(currentDate, false)}
          <div style={{ fontSize: '1.1em', color: '#bdbdbd', marginTop: '0.2em' }}>
            {currentDate.month.toString().padStart(2, '0')}/
            {currentDate.day.toString().padStart(2, '0')}/
            {currentDate.year.toString().slice(-2)}
          </div>
        </div>
        <div className="calendar-current-date-line">
          <span className="calendar-current-date-label">Gregorian:</span> {currentDate.gregorianDate.toLocaleDateString()}
        </div>
      </div>

      {/* Calendar Navigation and Grid */}
      <div className="calendar-section">
        <div className="calendar-header-row">
          <div>
            <label className="calendar-current-date-label">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="calendar-dropdown"
            >
              {Array.from({ length: 201 }, (_, i) => 1900 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="calendar-current-date-label">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="calendar-dropdown"
            >
              {Array.from({ length: 13 }, (_, i) => i + 1).map(month => {
                const monthName = orbitalCalendar.getMonthName(month);
                let displayName = `${month.toString().padStart(2, '0')}. ${monthName}`;
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
        <div className="calendar-grid">
          {/* Day headers */}
          {['Unyom', 'Tuyom', 'Triyom', 'Foyom', 'Phiyom', 'Seyom', 'Sabbath'].map((dayName) => (
            <div key={dayName} className="calendar-grid-header">{dayName}</div>
          ))}
          {/* Regular calendar days only */}
          {getDaysInSelectedMonth()
            .filter(date => !date.isSpecialDay)
            .map((date, index) => (
              <div
                key={index}
                className={
                  'calendar-tile' +
                  (isToday(date)
                    ? ' calendar-tile-current'
                    : isSelected(date)
                    ? ' calendar-tile-selected'
                    : '')
                }
              >
                <div className="calendar-tile-day">
                  {date.day}
                </div>
                <div className="calendar-tile-weekday">
                  {getGregorianWeekDayName(date.gregorianDate)}
                </div>
                {date.isSpecialDay && (
                  <div className="calendar-tile-gregorian">
                    {date.specialDayType === 'urobor' ? 'Urobor' : 'Leap Day'}
                  </div>
                )}
              </div>
            ))}
          {/* Special Days - directly in the grid, full width */}
          {getDaysInSelectedMonth().filter(date => date.isSpecialDay).map((date, idx) => (
            <div key={`special-${idx}`} className="calendar-tile calendar-tile-special">
              <div className="calendar-tile-day">
                {date.specialDayType === 'urobor' ? 'Urobor' : 'Leap Day'}
              </div>
              <div className="calendar-tile-weekday">
                {getGregorianWeekDayName(date.gregorianDate)}
              </div>
              {date.isSpecialDay && (
                <div className="calendar-tile-gregorian">
                  {date.gregorianDate.toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Date Converter */}
      <div className="calendar-section">
        <DateConverter />
      </div>
    </div>
  );
};

export default OrbitalCalendarPage; 