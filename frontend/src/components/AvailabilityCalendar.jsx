import React, { useState } from 'react';
import '../styles/AvailabilityCalendar.css';

const AvailabilityCalendar = ({ availabilityList, onToggleAvailability }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const formatDate = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const isDateAvailable = (dateString) => {
    return availabilityList.some(a => a.date === dateString);
  };

  const isPastDate = (year, month, day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (isPastDate(year, month, day)) return;

    const dateString = formatDate(year, month, day);
    onToggleAvailability(dateString);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const days = [];
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    weekDays.forEach(day => {
      days.push(
        <div key={`weekday-${day}`} className="calendar-weekday">
          {day}
        </div>
      );
    });

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(year, month, day);
      const available = isDateAvailable(dateString);
      const past = isPastDate(year, month, day);

      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${available ? 'available' : ''} ${past ? 'past' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth}>
          ←
        </button>
        <h3 className="calendar-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button type="button" className="calendar-nav-btn" onClick={handleNextMonth}>
          →
        </button>
      </div>

      <div className="calendar-grid">
        {renderCalendar()}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color unavailable"></span>
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <span className="legend-color past"></span>
          <span>Past date</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
