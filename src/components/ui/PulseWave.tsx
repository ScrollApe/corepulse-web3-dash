
import React from 'react';

interface PulseWaveProps {
  color?: string;
  size?: number;
  className?: string;
}

const PulseWave: React.FC<PulseWaveProps> = ({ 
  color = 'rgba(255, 165, 0, 0.3)', 
  size = 300,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="absolute rounded-full animate-pulse-wave" 
        style={{ 
          backgroundColor: color,
          width: size,
          height: size,
          left: `calc(50% - ${size/2}px)`,
          top: `calc(50% - ${size/2}px)`,
          animationDelay: '0s',
        }}
      />
      <div 
        className="absolute rounded-full animate-pulse-wave" 
        style={{ 
          backgroundColor: color,
          width: size,
          height: size,
          left: `calc(50% - ${size/2}px)`,
          top: `calc(50% - ${size/2}px)`,
          animationDelay: '0.6s',
        }}
      />
      <div 
        className="absolute rounded-full animate-pulse-wave" 
        style={{ 
          backgroundColor: color,
          width: size,
          height: size,
          left: `calc(50% - ${size/2}px)`,
          top: `calc(50% - ${size/2}px)`,
          animationDelay: '1.2s',
        }}
      />
    </div>
  );
};

export default PulseWave;
