
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
            transform: scale(0.95);
            opacity: 0.8;
          }
          70% {
            transform: scale(2);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.8;
          }
        }
        
        /* Fix to ensure user marker is always visible and on top */
        .leaflet-marker-icon.user-marker-pin,
        .leaflet-marker-icon.user-marker-pin * {
          z-index: 1000 !important;
        }
        
        /* Important styles for marker positioning and visibility */
        .user-marker-pin {
          z-index: 1000 !important;
          pointer-events: auto !important;
        }
        
        .user-marker-pin .marker-pin {
          z-index: 1000 !important;
          position: absolute !important;
          transform: translate(-50%, -50%);
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
        
        /* Pulse animation for all browsers */
        .user-marker-pulse {
          animation: pulse 2s infinite;
        }
        
        /* Safari-specific fixes */
        @media not all and (min-resolution:.001dpcm) {
          @supports (-webkit-appearance:none) {
            .user-marker-outer {
              animation-name: pulse !important;
              animation-duration: 2s !important;
              animation-iteration-count: infinite !important;
            }
          }
        }
        
        /* Firefox-specific fixes */
        @-moz-document url-prefix() {
          .user-marker-outer {
            animation: pulse 2s infinite;
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
