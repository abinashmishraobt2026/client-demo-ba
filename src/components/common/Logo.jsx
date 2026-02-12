import React from 'react';

const Logo = ({ 
  size = 'md', 
  showText = true, 
  className = '', 
  textClassName = '',
  variant = 'default' 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  // Main logo component with proper error handling
  const LogoImage = () => (
    <div className={`${sizeClasses[size]} ${className} relative flex-shrink-0`}>
      <img
        src="/logo-offbeat.png"
        alt="OffbeatTrips Logo"
        className="w-full h-full object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
          const fallback = e.target.nextElementSibling;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }}
      />
      {/* Fallback logo */}
      <div className="hidden w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg items-center justify-center">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-3/4 h-3/4 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" 
            fill="currentColor"
          />
          <path 
            d="M12 7l-3 3v6l3-3 3 3V10l-3-3z" 
            fill="white" 
            fillOpacity="0.8"
          />
        </svg>
      </div>
    </div>
  );

  if (variant === 'icon-only') {
    return <LogoImage />;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoImage />
      {showText && (
        <div className={textClassName}>
          <h1 className={`${textSizeClasses[size]} font-bold text-gray-900`}>
            OffbeatTrips
          </h1>
          {size !== 'xs' && size !== 'sm' && (
            <p className={`text-xs ${size === 'md' ? 'text-xs' : 'text-sm'} text-gray-500`}>
              Business Associate Portal
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;