const fs = require('fs');
const content = `import React from 'react';

export const WhatsAppBrandIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.373 0 12c0 2.122.553 4.12 1.528 5.864L0 24l6.302-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill="#25D366"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M17.472 14.304c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.882-.788-1.477-1.761-1.65-2.059-.173-.298-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.074-.149-.669-1.611-.916-2.206-.241-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.793.371-.272.298-1.04 1.016-1.04 2.478s1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.307 1.264.49 1.695.627.712.227 1.36.195 1.871.118.572-.086 1.758-.718 2.006-1.412.248-.694.248-1.288.173-1.412-.074-.124-.272-.198-.57-.347z" fill="#FFF"/>
  </svg>
);

export const FacebookBrandIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="12" fill="#1877F2"/>
    <path d="M14.939 12l.48-3.13h-3.01V6.84c0-.86.406-1.7 1.77-1.7h1.366V2.463A16.892 16.892 0 0013.085 2c-2.485 0-4.148 1.503-4.148 4.275V8.87H6.183V12h2.754v7.556c.995.156 2.02.156 3.015 0V12h2.987z" fill="#FFF"/>
  </svg>
);

export const LinkedInBrandIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="24" height="24" rx="4" fill="#0A66C2"/>
    <path d="M7.12 20H3.56V9h3.56v11zM5.34 7.5c-1.14 0-2.06-.92-2.06-2.06S4.2 3.38 5.34 3.38s2.06.92 2.06 2.06c0 1.14-.92 2.06-2.06 2.06zM20.44 20h-3.56v-5.36c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V20h-3.56V9h3.42v1.5h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45V20z" fill="#FFF"/>
  </svg>
);

export const TelegramBrandIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="12" fill="#24A1DE"/>
    <path d="M17.834 6.304l-2.613 12.302c-.2.86-.707 1.074-1.428.667l-3.95-2.91-1.905 1.834c-.211.21-.388.387-.796.387l.282-4.032 7.34-6.626c.32-.284-.07-.442-.495-.157L5.19 13.125 1.28 11.9c-.85-.266-.867-.85.178-1.26L16.48 4.842c.694-.257 1.305.153 1.176 1.462z" fill="#FFF"/>
  </svg>
);

export const XBrandIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="24" height="24" rx="4" fill="#000" stroke="#FFF" strokeWidth="1" />
    <path d="M18.9 4.2h-3.41L11 8.8 6.5 4.2H3l5.53 7.82L3 19.8h3.4l4.7-5.11 4.67 5.11h3.5L13.52 11.7l5.37-7.5zm-4.7 13.9H12.3l-6.8-9.8H7.3l6.8 9.8z" fill="#FFF"/>
  </svg>
);
`
fs.writeFileSync('components/icons/BrandIcons.tsx', content);
console.log("Created BrandIcons");