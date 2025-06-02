# Weather App Image Assets

This folder contains all the required image assets for the Farcaster Mini App.

## Image Files and Their Usage:

### `weather-icon.svg` (200x200px)
- **Used for**: App icon in Farcaster clients
- **Purpose**: Main branding icon shown in app stores and mini app listings
- **Features**: Sun with clouds on sky gradient background

### `weather-splash.svg` (200x200px)  
- **Used for**: Splash screen when app is loading
- **Purpose**: Shown while the mini app initializes
- **Features**: Branded loading screen with app name and weather icon

### `weather-preview.svg` (600x400px, 3:2 ratio)
- **Used for**: Social media embeds and preview cards
- **Purpose**: Shown when someone shares the app in a cast or social post
- **Features**: App showcase with mockup interface

### `weather-hero.svg` (800x600px)
- **Used for**: App store hero image and promotional materials
- **Purpose**: Main promotional image for app discovery
- **Features**: Feature highlights and prominent branding

### `weather-og.svg` (1200x630px)
- **Used for**: Open Graph social sharing
- **Purpose**: Image shown when app URL is shared on social platforms
- **Features**: Optimized for Facebook, Twitter, Discord, etc.

## When You Deploy:

Replace the relative URLs (e.g., `/weather-icon.svg`) in `farcaster.json` with your deployed domain URLs:

```json
{
  "iconUrl": "https://yourdomain.com/weather-icon.svg",
  "homeUrl": "https://yourdomain.com",
  "imageUrl": "https://yourdomain.com/weather-preview.svg",
  "splashImageUrl": "https://yourdomain.com/weather-splash.svg",
  "heroImageUrl": "https://yourdomain.com/weather-hero.svg",
  "ogImageUrl": "https://yourdomain.com/weather-og.svg"
}
```

## Notes:
- All images use SVG format for crisp scaling and small file sizes
- Images follow Farcaster Mini App specification requirements
- Consistent branding with app's gradient colors (#667eea to #764ba2)
- Weather-themed icons and professional typography 