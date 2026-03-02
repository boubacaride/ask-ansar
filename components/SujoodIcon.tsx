import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface SujoodIconProps {
  size?: number;
  color?: string;
}

/**
 * Islamic prayer icon — person in sujood (prostration) position.
 * Bold, simple silhouette optimized for small icon sizes.
 */
export default function SujoodIcon({ size = 24, color = '#9c27b0' }: SujoodIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Head on ground */}
      <Circle cx={10} cy={48} r={6} fill={color} />
      {/* Body arc — single bold curved back from head up to hips */}
      <Path
        d="M15 45 Q28 14, 50 30"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      {/* Legs — folded back from hips */}
      <Path
        d="M50 30 Q58 22, 56 34"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      {/* Ground line */}
      <Path
        d="M3 55 L61 55"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.3}
      />
    </Svg>
  );
}
