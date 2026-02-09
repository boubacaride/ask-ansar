const fs = require('fs');
const path = require('path');

const iconSVG = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#grad)"/>
  <text x="512" y="650" font-family="Arial" font-size="500" font-weight="bold" fill="white" text-anchor="middle">A</text>
</svg>`;

const faviconSVG = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="10" fill="url(#grad2)"/>
  <text x="24" y="34" font-family="Arial" font-size="24" font-weight="bold" fill="white" text-anchor="middle">A</text>
</svg>`;

console.log('Icon SVG:', iconSVG);
console.log('Favicon SVG:', faviconSVG);
