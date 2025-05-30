# 🌤️ Weather Mini App for Farcaster

A beautiful, real-time weather forecasting mini app built specifically for the Farcaster ecosystem. Get current weather conditions, hourly and daily forecasts for any location worldwide with gorgeous visualizations.

![Weather Mini App Preview](https://your-domain.com/weather-preview.png)

## ✨ Features

- **🌍 Location Services**: Automatic location detection and city search
- **📊 Comprehensive Forecasts**: Current conditions, 24-hour, and 7-day forecasts
- **🎨 Beautiful UI**: Modern glassmorphism design with weather-themed gradients
- **📱 Mobile Optimized**: Perfect for Farcaster mobile clients (424x695px desktop)
- **🔄 Real-time Updates**: Powered by Open-Meteo API (free, no API key required)
- **⚡ Fast Performance**: React Query caching and optimistic updates
- **🛡️ Error Handling**: Robust error handling with retry logic

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup

No environment variables required! The app uses the free Open-Meteo API.

## 📋 Publishing to Farcaster

### Prerequisites

1. **Domain**: You need a domain where you'll host your mini app
2. **Farcaster Account**: With custody address for signing the manifest
3. **Hosting**: Any web hosting service (Vercel, Netlify, etc.)

### Step 1: Update Configuration

1. **Update manifest file** (`public/.well-known/farcaster.json`):
   ```json
   {
     "frame": {
       "version": "1",
       "name": "Weather App",
       "iconUrl": "https://YOUR-DOMAIN.com/weather-icon.png",
       "homeUrl": "https://YOUR-DOMAIN.com",
       "imageUrl": "https://YOUR-DOMAIN.com/weather-preview.png",
       "buttonTitle": "🌤️ Check Weather",
       "splashImageUrl": "https://YOUR-DOMAIN.com/weather-splash.png",
       "splashBackgroundColor": "#667eea"
     }
   }
   ```

2. **Update meta tags** in `index.html`:
   Replace all instances of `https://your-domain.com` with your actual domain.

### Step 2: Create Required Images

Create these images and place them in your `public` folder:

- **App Icon** (`weather-icon.png`): 200x200px app icon
- **Preview Image** (`weather-preview.png`): 3:2 aspect ratio (e.g., 600x400px)
- **Splash Image** (`weather-splash.png`): 200x200px splash screen image
- **Hero Image** (`weather-hero.png`): Large promotional image
- **OG Image** (`weather-og.png`): 1200x630px for social sharing
- **Screenshots** (`screenshot1.png`, `screenshot2.png`): App screenshots

### Step 3: Deploy Your App

Deploy to your hosting provider:

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build the app
npm run build

# Deploy dist folder to Netlify
```

### Step 4: Verify Domain Ownership

1. Go to [Warpcast Mini App Manifest Tool](https://farcaster.xyz/~/developers/new)
2. Enter your domain (e.g., `weather-app.your-domain.com`)
3. Sign the account association with your Farcaster custody address
4. Copy the generated `accountAssociation` object
5. Add it to your `farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
    "payload": "eyJkb21haW4iOiJyZXdhcmRzLndhcnBjYXN0LmNvbSJ9",
    "signature": "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
  },
  "frame": {
    // ... your frame config
  }
}
```

### Step 5: Test Your Mini App

1. Use the [Mini App Debug Tool](https://farcaster.xyz/~/developers/mini-apps/debug)
2. Enter your app URL
3. Test in Warpcast desktop/mobile

### Step 6: Make It Discoverable

1. **Share in casts**: Use the `fc:frame` meta tag for rich embeds
2. **App stores**: Verified apps appear in Farcaster app stores
3. **Social sharing**: Optimized Open Graph tags for social platforms

## 🔧 Customization

### Adding Features

1. **Weather Alerts**: Integrate with weather alert APIs
2. **Multiple Locations**: Add location bookmarking
3. **Units**: Add temperature/speed unit preferences
4. **Themes**: Add dark/light mode toggle

### Styling

- Modify CSS variables in `src/index.css`
- Update weather condition icons in `src/utils/weatherUtils.ts`
- Customize gradients and colors for different weather conditions

## 🛠️ Technical Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: React Query (TanStack Query)
- **Weather API**: Open-Meteo (free)
- **Styling**: CSS with custom properties
- **Icons**: Lucide React + weather emojis
- **Farcaster**: Frame SDK

## 📱 Farcaster Integration

- **Proper sizing**: 424x695px for desktop Farcaster clients
- **Safe area handling**: Respects mobile safe area insets
- **Context aware**: Adapts to Farcaster environment
- **Social sharing**: Rich embeds with `fc:frame` meta tags
- **Performance**: Optimized for mobile Farcaster apps

## 🔒 Privacy & Data

- **No tracking**: No analytics or user tracking
- **API usage**: Only Open-Meteo for weather data
- **Local storage**: Location preferences stored locally
- **No accounts**: No user accounts or personal data collection

## 📄 License

MIT License - feel free to use this as a template for your own Farcaster mini apps!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/weather-mini-app/issues)
- **Farcaster**: Follow [@your-username](https://warpcast.com/your-username)
- **Email**: your-email@domain.com

## 🎯 Roadmap

- [ ] Weather alerts integration
- [ ] Multiple location bookmarks
- [ ] Push notifications
- [ ] Weather radar/maps
- [ ] Air quality index
- [ ] Sunrise/sunset times
- [ ] Weather widgets for different locations

---

Built with ❤️ for the Farcaster community
