import { useState, useEffect } from 'react';

/**
 * Custom hook to animate counting from 0 to a target number
 * @param {number} targetValue - The target value to count up to
 * @param {number} duration - Duration of the animation in milliseconds
 * @param {boolean} enabled - Whether to start the animation
 * @param {string} storageKey - Unique key for sessionStorage to track if animation has been shown
 * @returns {number} The current animated count value
 */
const useCountAnimation = (targetValue, duration = 2000, enabled = true, storageKey = null) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check if we've already animated for this session
    if (storageKey) {
      const hasShownBefore = sessionStorage.getItem(storageKey) === 'true';
      if (hasShownBefore) {
        setCount(targetValue);
        setHasAnimated(true);
        return;
      }
    }

    if (!enabled || hasAnimated) return;

    let start = null;
    let animationFrameId = null;

    // Parse the target value to remove any commas or '+' symbols
    const parsedTargetValue = parseInt(String(targetValue).replace(/,|\+/g, ''));

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      
      // Use easeOutQuad easing function for smoother ending
      const easing = 1 - Math.pow(1 - percentage, 2);
      
      setCount(Math.floor(easing * parsedTargetValue));
      
      if (progress < duration) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(parsedTargetValue);
        setHasAnimated(true);
        
        // Mark this animation as shown in this session
        if (storageKey) {
          sessionStorage.setItem(storageKey, 'true');
        }
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration, enabled, storageKey, hasAnimated]);

  return count;
};

export default useCountAnimation;
