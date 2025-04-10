
import React, { useEffect } from 'react';

/**
 * Component to add pulsing marker animation styles
 */
const PulsingStyles = () => {
  useEffect(() => {
    if (!document.getElementById('pulsing-marker-style')) {
      const style = document.createElement('style');
      style.id = 'pulsing-marker-style';
      style.innerHTML = `
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          70% {
            transform: scale(2);
            opacity: 0.3;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
        
        .user-marker-pulse {
          animation: pulse 2s infinite;
        }
        
        .user-location-marker .pulse {
          width: 16px;
          height: 16px;
          background-color: #3388ff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        /* Ensure user marker is visible above other map elements */
        .user-marker-pin {
          z-index: 1000 !important;
          pointer-events: auto !important;
        }
        
        .user-marker-pin .marker-pin {
          z-index: 1000 !important;
          position: absolute !important;
        }
        
        /* Style for the outer pulsing circle */
        .user-marker-outer {
          pointer-events: none;
          animation: pulse 2s infinite;
          z-index: 998 !important;
        }
        
        /* Style for the inner dot */
        .user-marker-inner {
          pointer-events: none;
          z-index: 999 !important;
        }
        
        /* Fix for Safari animation issues */
        @media not all and (min-resolution:.001dpcm) {
          @supports (-webkit-appearance:none) {
            .user-marker-outer {
              animation-name: pulse !important;
              animation-duration: 2s !important;
              animation-iteration-count: infinite !important;
            }
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      const styleElem = document.getElementById('pulsing-marker-style');
      if (styleElem) {
        styleElem.remove();
      }
    };
  }, []);
  
  return null; // This is a non-visual component
};

export default PulsingStyles;
