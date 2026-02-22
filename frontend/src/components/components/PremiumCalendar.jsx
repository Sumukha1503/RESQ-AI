import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Calendar, Clock } from 'lucide-react';

const PremiumCalendar = ({ onDateTimeSelect, selectedDateTime, className = "" }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(selectedDateTime ? new Date(selectedDateTime) : null);
  const [selectedTime, setSelectedTime] = useState(selectedDateTime ? new Date(selectedDateTime).toTimeString().substring(0, 5) : '');

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const totalCells = 42; // 6 rows x 7 days
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (selectedTime) {
      const dateTime = new Date(date);
      const [hours, minutes] = selectedTime.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      onDateTimeSelect(dateTime.toISOString());
    }
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    if (selectedDate) {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = time.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      onDateTimeSelect(dateTime.toISOString());
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const formatTime = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigateMonth(-1)}
          className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
        >
          ←
        </Button>
        <h3 className="text-lg font-semibold text-center">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigateMonth(1)}
          className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
        >
          →
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-white/70 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays().map((day, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleDateSelect(day.date)}
            className={`
              h-10 w-10 p-0 rounded-full transition-all duration-300
              ${day.isCurrentMonth 
                ? isSelected(day.date) 
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg transform scale-110' 
                  : isToday(day.date)
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                : 'text-white/40 hover:bg-white/10'
              }
              ${!day.isCurrentMonth ? 'opacity-50' : ''}
            `}
          >
            {day.date.getDate()}
          </Button>
        ))}
      </div>

      {/* Time Selection */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-emerald-300" />
            <h4 className="font-medium text-white">Select Time</h4>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map(hour => (
              <Button
                key={hour}
                variant="outline"
                size="sm"
                onClick={() => handleTimeChange(`${hour.toString().padStart(2, '0')}:00`)}
                className={`
                  bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300
                  ${selectedTime && selectedTime.startsWith(hour.toString().padStart(2, '0')) 
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-transparent shadow-lg' 
                    : ''
                  }
                `}
              >
                {formatTime(hour)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected DateTime Display */}
      {selectedDate && selectedTime && (
        <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border-emerald-400/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="font-medium text-white">Selected Date & Time</p>
                <p className="text-sm text-white/80">
                  {selectedDate.toLocaleDateString()} at {selectedTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar UI Description */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20">
        <p className="text-sm text-white/90">
          <span className="font-medium">Premium UX:</span> Glassmorphism cards with emerald gradients, 
          smooth animations, and responsive design.
        </p>
      </div>
    </div>
  );
};

export default PremiumCalendar;