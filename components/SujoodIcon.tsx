import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface SujoodIconProps {
  size?: number;
  color?: string;
}

/**
 * Islamic prayer icon — person in sujood (prostration) position, facing right.
 * Shows head on ground, arched back, angled thigh, and legs folded on ground.
 */
export default function SujoodIcon({ size = 24, color = '#9c27b0' }: SujoodIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Head touching the ground (right side) */}
      <Circle cx={56} cy={46} r={5} fill={color} />
      {/* Hands placed flat on ground in front of head */}
      <Path
        d="M59 49 L63 47"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Back — curving from behind head up to hips */}
      <Path
        d="M51 44 C52 10, 34 6, 28 22"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      {/* Thigh — angled from hips down to knees on ground */}
      <Path
        d="M28 22 L22 46"
        stroke={color}
        strokeWidth={6.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Lower legs / feet — folded back on the ground */}
      <Path
        d="M22 46 L6 44"
        stroke={color}
        strokeWidth={5.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Ground line */}
      <Path
        d="M3 53 L61 53"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.2}
      />
    </Svg>
  );
}
