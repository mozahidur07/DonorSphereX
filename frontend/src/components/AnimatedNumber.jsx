import React, { useEffect, useState, useRef } from 'react';
import useCountAnimation from '../js/useCountAnimation';

/**
 * A component that displays an animated number counting up to a target value
 * 
 * @param {Object} props
 * @param {string|number} props.value - The target value to count up to (can include formatting like '10,000+')
 * @param {number} props.duration - Duration of the animation in milliseconds
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.storageKey - Unique key for sessionStorage to track if animation has been shown
 * @returns {React.ReactElement} The animated number component
 */
const AnimatedNumber = ({ 
  value, 
  duration = 2000, 
  className = '', 
  storageKey = null 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  
  // Extract numeric value and suffix
  const numericValue = parseInt(String(value).replace(/,|\+/g, ''));
  const hasSuffix = String(value).includes('+');
  
  // Get animated count
  const animatedValue = useCountAnimation(
    numericValue,
    duration,
    isVisible,
    storageKey
  );
  
  // Format the number with commas
  const formattedValue = animatedValue.toLocaleString();

  // Use Intersection Observer to detect when element is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <span ref={elementRef} className={className}>
      {formattedValue}{hasSuffix ? '+' : ''}
    </span>
  );
};

export default AnimatedNumber;
