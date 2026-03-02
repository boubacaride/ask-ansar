import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DuaHandsIconProps {
  size?: number;
  color?: string;
}

/**
 * Islamic-style dua (supplication) hands icon — two open palms raised upward
 * with visible individual fingers, matching the classic dua icon style.
 */
export default function DuaHandsIcon({ size = 24, color = '#00796b' }: DuaHandsIconProps) {
  const sw = 2.4; // stroke width
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* ===== LEFT HAND ===== */}
      {/* Left pinky */}
      <Path
        d="M7 34 L7 22 C7 19, 8 17.5, 9.5 17.5 C11 17.5, 12 19, 12 22 L12 34"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill={color} fillOpacity={0.15}
      />
      {/* Left ring finger */}
      <Path
        d="M12 34 L12 17 C12 14, 13 12.5, 14.5 12.5 C16 12.5, 17 14, 17 17 L17 34"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill={color} fillOpacity={0.15}
      />
      {/* Left middle finger */}
      <Path
        d="M17 34 L17 14 C17 11, 18 9, 19.5 9 C21 9, 22 11, 22 14 L22 34"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill={color} fillOpacity={0.15}
      />
      {/* Left index finger */}
      <Path
        d="M22 34 L22 16 C22 13, 23 11.5, 24.5 11.5 C26 11.5, 27 13, 27 16 L27 34"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill={color} fillOpacity={0.15}
      />
      {/* Left palm */}
      <Path
        d="M7 34 L27 34 L27 44 C27 48, 23 52, 17 52 C11 52, 7 48, 7 44 Z"
        stroke={color} strokeWidth={sw} strokeLinejoin="round" fill={color} fillOpacity={0.15}
      />
      {/* Left thumb */}
      <Path
        d="M27 38 C29 36, 30.5 35, 31 37 C31.5 39, 29 42, 27 43"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />

      {/* ===== RIGHT HAND ===== */}
      {/* Right pinky */}
      <Path
        d="M57 34 L57 22 C57 19, 56 17.5, 54.5 17.5 C53 17.5, 52 19, 52 22 L52 34"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill={color} fillOpacity={0.15}
      />
      {/* Right ring finger */}
      <Path
        d="M52 34 L52 17 C52 14, 51 12.5, 49.5 12.5 C48 12.5, 47 14, 47 17 L47 34"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill={color} fillOpacity={0.15}
      />
      {/* Right middle finger */}
      <Path
        d="M47 34 L47 14 C47 11, 46 9, 44.5 9 C43 9, 42 11, 42 14 L42 34"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill={color} fillOpacity={0.15}
      />
      {/* Right index finger */}
      <Path
        d="M42 34 L42 16 C42 13, 41 11.5, 39.5 11.5 C38 11.5, 37 13, 37 16 L37 34"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill={color} fillOpacity={0.15}
      />
      {/* Right palm */}
      <Path
        d="M57 34 L37 34 L37 44 C37 48, 41 52, 47 52 C53 52, 57 48, 57 44 Z"
        stroke={color} strokeWidth={sw} strokeLinejoin="round" fill={color} fillOpacity={0.15}
      />
      {/* Right thumb */}
      <Path
        d="M37 38 C35 36, 33.5 35, 33 37 C32.5 39, 35 42, 37 43"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"
      />
    </Svg>
  );
}
