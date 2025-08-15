import React, { useState, useRef, useEffect } from 'react';
import CurrentTask from './CurrentTask';
import DailyMealsWidget from './DailyMealsWidget';
import './SwipeableWidgets.css';

const SwipeableWidgets: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const widgets = [
    { id: 'schedule', component: <CurrentTask />, title: 'Schedule' },
    { id: 'diet', component: <DailyMealsWidget />, title: 'Diet' }
  ];

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < widgets.length - 1) {
        // Swipe left - go to next widget
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - go to previous widget
        setCurrentIndex(currentIndex - 1);
      }
    }
    
    setIsDragging(false);
  };

  // Mouse event handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < widgets.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
    
    setIsDragging(false);
  };

  // Prevent text selection during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div className="swipeable-widgets">
      {/* Mobile: Swipeable interface */}
      <div className="swipeable-widgets-mobile">
        <div
          ref={containerRef}
          className="widget-swipe-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="widget-swipe-content"
            style={{
              transform: `translateX(-${currentIndex * 50}%)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="widget-slide">
                {widget.component}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Original layout */}
      <div className="widgets-container-desktop">
        <CurrentTask />
        <DailyMealsWidget />
      </div>
    </div>
  );
};

export default SwipeableWidgets; 