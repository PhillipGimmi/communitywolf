# PWA Icons for Safety News App

This directory contains all the Progressive Web App (PWA) icons for the Safety News App.

## Icon Design
- **Background**: Dark gray/black (`#111827`) matching the navbar logo
- **Icon**: White shield with checkmark, based on the Lucide React Shield icon used in the navbar
- **Style**: Rounded corners with a professional, safety-focused design

## Available Sizes
The following icon sizes are available for optimal PWA support across all devices:

- `icon-16x16.svg` - Favicon and small displays
- `icon-32x32.svg` - Windows taskbar
- `icon-48x48.svg` - Android home screen
- `icon-72x72.svg` - Android home screen (72dpi)
- `icon-96x96.svg` - Android home screen (96dpi)
- `icon-128x128.svg` - Chrome Web Store
- `icon-144x144.svg` - Android home screen (144dpi)
- `icon-152x152.svg` - iOS home screen
- `icon-192x192.svg` - Android home screen (192dpi)
- `icon-384x384.svg` - High-resolution displays
- `icon-512x512.svg` - High-resolution displays and app stores

## PWA Features
- **Installable**: Users can add to home screen
- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Standalone display mode
- **Responsive Design**: Optimized for all screen sizes

## Usage
These icons are automatically referenced in:
- `public/manifest.json` - PWA manifest
- `src/app/layout.tsx` - App metadata
- Service worker for offline caching

## Testing PWA Installation
1. Open the app in Chrome/Edge
2. Look for the install button in the address bar
3. Or use the browser menu: "Install Safety News App"
4. The app should appear on your home screen/desktop
