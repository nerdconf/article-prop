import React from 'react';

export const NerdConfLogo = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 400 400" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Background */}
    <rect width="400" height="400" fill="#060d1a" />
    
    {/* Stars/Noise (simplified) */}
    <circle cx="50" cy="80" r="1" fill="#00ff00" opacity="0.3" />
    <circle cx="350" cy="120" r="1.5" fill="#00ff00" opacity="0.4" />
    <circle cx="80" cy="300" r="1" fill="#00ff00" opacity="0.2" />
    <circle cx="320" cy="350" r="2" fill="#00ff00" opacity="0.3" />
    <circle cx="200" cy="50" r="1" fill="#00ff00" opacity="0.5" />
    
    {/* Group for all neon green elements */}
    <g fill="#00ff00">
      {/* UFO */}
      <g transform="translate(200, 110) rotate(-15)">
        {/* Dome */}
        <path d="M-30,0 C-30,-25 30,-25 30,0 Z" />
        <ellipse cx="-15" cy="-10" rx="6" ry="3" fill="#060d1a" />
        {/* Base */}
        <ellipse cx="0" cy="0" rx="60" ry="10" />
        {/* Beam */}
        <polygon points="-10,5 10,5 50,120 -30,120" opacity="0.8" />
        
        {/* Cow silhouette inside beam */}
        <g transform="translate(10, 60) rotate(20) scale(0.8)" fill="#060d1a">
          {/* Body */}
          <rect x="-15" y="-10" width="30" height="15" rx="5" />
          {/* Head */}
          <rect x="10" y="-15" width="12" height="12" rx="3" />
          {/* Legs */}
          <rect x="-12" y="2" width="4" height="12" rx="1" />
          <rect x="-6" y="4" width="4" height="10" rx="1" />
          <rect x="8" y="2" width="4" height="12" rx="1" />
          <rect x="14" y="4" width="4" height="10" rx="1" />
          {/* Tail */}
          <path d="M-15,-5 Q-25,-5 -20,5" stroke="#060d1a" strokeWidth="2" fill="none" />
          {/* Udders */}
          <rect x="-2" y="4" width="6" height="4" rx="2" />
        </g>
      </g>
      
      {/* Sparkles around UFO */}
      <path d="M150,110 L155,115 L165,115 L157,120 L160,130 L152,122 L145,130 L148,120 L140,115 L150,115 Z" transform="scale(0.5) translate(160, 90)" />
      <path d="M150,110 L155,115 L165,115 L157,120 L160,130 L152,122 L145,130 L148,120 L140,115 L150,115 Z" transform="scale(0.4) translate(550, 250)" />

      {/* NERD Text */}
      <text x="200" y="230" 
            fontFamily="Impact, sans-serif" 
            fontSize="110" 
            fontWeight="bold" 
            textAnchor="middle" 
            letterSpacing="-2">
        NERD
      </text>
      
      {/* CONF Text */}
      <text x="200" y="280" 
            fontFamily="Arial, sans-serif" 
            fontSize="45" 
            fontWeight="900" 
            textAnchor="middle" 
            letterSpacing="2">
        CONF
      </text>
      
      {/* Horizontal Lines Left */}
      <rect x="60" y="250" width="55" height="4" />
      <rect x="60" y="258" width="55" height="4" />
      <rect x="60" y="266" width="55" height="4" />
      <rect x="60" y="274" width="55" height="4" />
      
      {/* Horizontal Lines Right */}
      <rect x="285" y="250" width="55" height="4" />
      <rect x="285" y="258" width="55" height="4" />
      <rect x="285" y="266" width="55" height="4" />
      <rect x="285" y="274" width="55" height="4" />
    </g>
  </svg>
);
