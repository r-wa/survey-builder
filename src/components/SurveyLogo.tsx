import React from 'react';

export function SurveyLogo({ className = "", size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) {
  // Size mapping
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48
  };
  
  const logoSize = sizeMap[size];
  
  return (
    <div className={`relative ${className}`} style={{ width: logoSize, height: logoSize }}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        {/* Paper background */}
        <rect x="2" y="2" width="20" height="20" fill="#4f46e5" />
        <rect x="4" y="4" width="16" height="16" fill="white" />
        
        {/* Row 1 */}
        <rect x="6" y="7" width="4" height="4" fill="#4f46e5" /> {/* Checked box */}
        <rect x="12" y="8" width="6" height="2" fill="#c7d2fe" /> {/* Text */}
        
        {/* Row 2 */}
        <rect x="6" y="13" width="4" height="4" stroke="#4f46e5" strokeWidth="2" /> {/* Empty box */}
        <rect x="12" y="14" width="6" height="2" fill="#c7d2fe" /> {/* Text */}
      </svg>
    </div>
  );
} 