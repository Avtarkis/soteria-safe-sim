
import React, { useEffect } from 'react';

/**
 * Component to add pulsing marker animation styles
 */
const PulsingStyles = () => {
  useEffect(() => {
    // Check if styles are already applied
    if (!document.getElementById('pulsing-marker-style')) {
      const style = document.createElement('style');
      style.id = 'pulsing-marker-style';
      style.innerHTML = `
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
            opacity: 0.9;
          }
          70% {
            transform: scale(1.8);
            box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
            opacity: 0.9;
          }
        }
        
        /* Ensure z-index for all marker elements */
        .leaflet-marker-icon.user-marker-pin {
          z-index: 1000 !important;
        }
        
        .leaflet-marker-icon.user-marker-pin * {
          z-index: 1000 !important;
        }
        
        /* User marker container styling */
        .user-marker-pin {
          z-index: 1000 !important;
          pointer-events: auto !important;
        }
        
        .user-marker-pin .marker-pin {
          z-index: 1000 !important;
          position: absolute !important;
          transform: translate(-50%, -50%);
        }
        
        /* Pulse animation for all elements with pulse-animation class */
        .pulse-animation {
          animation: pulse 2s infinite !important;
        }
        
        /* Outer circle styling */
        .user-marker-outer {
          z-index: 998 !important;
          pointer-events: none;
        }
        
        /* Inner dot styling */
        .user-marker-inner {
          z-index: 999 !important;
          pointer-events: none;
        }
        
        /* Safari-specific fixes */
        @media not all and (min-resolution:.001dpcm) {
          @supports (-webkit-appearance:none) {
            .user-marker-outer, .pulse-animation {
              animation-name: pulse !important;
              animation-duration: 2s !important;
              animation-iteration-count: infinite !important;
            }
          }
        }
        
        /* Firefox-specific fixes */
        @-moz-document url-prefix() {
          .user-marker-outer, .pulse-animation {
            animation: pulse 2s infinite !important;
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
