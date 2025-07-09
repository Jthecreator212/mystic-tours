# TripAdvisor API Setup Guide

## Overview
Your Jamaica slideshow now pulls live destination data from TripAdvisor's Content API, including real photos, ratings, and reviews from actual travelers.

## Getting Your TripAdvisor API Key

### 1. Visit TripAdvisor Developer Portal
Go to: https://developer-tripadvisor.com/content-api/

### 2. Create a Developer Account
- Sign up for a free TripAdvisor developer account
- Complete the application process
- Wait for approval (usually 1-2 business days)

### 3. Get Your API Key
- Once approved, log in to your developer dashboard
- Create a new application
- Copy your API key

## Setting Up Your Environment Variables

### 1. Create Environment File
Create a `.env.local` file in your project root with:

```bash
# TripAdvisor Content API Configuration
NEXT_PUBLIC_TRIPADVISOR_API_KEY=your_actual_api_key_here

# Your existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Add to Production Environment
Don't forget to add the `NEXT_PUBLIC_TRIPADVISOR_API_KEY` to your production environment variables in your hosting platform (Vercel, Netlify, etc.).

## How It Works

### API Features
- **Live Data**: Pulls real attractions and resorts in Jamaica
- **High-Quality Photos**: Professional images from TripAdvisor's database  
- **Ratings & Reviews**: Shows star ratings and review counts
- **Smart Categorization**: Automatically categorizes as "resort" or "attraction"
- **Fallback System**: Uses your existing slideshow data if API fails

### Data Sources
The slideshow searches for:
- Tourist attractions within 50km of Jamaica's center
- Restaurants and hotels with high ratings
- Popular destinations with verified photos
- Real traveler reviews and ratings

### Automatic Updates
- Data refreshes each time the page loads
- No manual content management needed
- Always shows current information
- Handles API failures gracefully

## Customization Options

### API Parameters
You can modify these in `lib/tripadvisor.ts`:
- **Search radius**: Currently 50km from Jamaica's center
- **Result count**: Currently limited to 10 destinations
- **Categories**: Currently focuses on attractions
- **Language**: Currently set to English

### Fallback Content
If the API fails, it uses the destinations in `fallbackDestinations` array in the TripAdvisor library file.

## API Limits & Pricing

### Free Tier
- 500 calls per month
- Rate limited to 10 calls per minute
- Basic location data and photos

### Paid Tiers
- Higher rate limits
- More detailed data
- Priority support

## Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Check your `.env.local` file exists
   - Verify the key name is exactly `NEXT_PUBLIC_TRIPADVISOR_API_KEY`
   - Restart your development server after adding the key

2. **No destinations loading**
   - Check browser console for API errors
   - Verify your API key is valid
   - Check if you've exceeded rate limits

3. **Images not loading**
   - TripAdvisor images are hosted on their CDN
   - Check if the URLs are valid in the API response
   - Fallback images will be used if TripAdvisor images fail

### Getting Support
- TripAdvisor Developer Forum: https://developer-tripadvisor.com/
- API Documentation: https://developer-tripadvisor.com/content-api/documentation/

## Benefits Over Static Content

✅ **Always Current**: Data automatically updates  
✅ **Professional Photos**: High-quality images from verified businesses  
✅ **Social Proof**: Real ratings and reviews from travelers  
✅ **No Maintenance**: No need to manually update content  
✅ **Credibility**: Data from trusted TripAdvisor database  
✅ **Rich Information**: Detailed descriptions and location data  

Your slideshow now provides a much more dynamic and trustworthy experience for your visitors! 