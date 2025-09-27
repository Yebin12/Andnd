# Google Maps Integration Setup

## Prerequisites

1. **Google Cloud Console Account**: You need a Google Cloud account to access the Google Maps API.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud project:

1. **Maps JavaScript API** - For displaying the interactive map
2. **Geocoding API** - For converting addresses to coordinates and vice versa
3. **Places API** (optional) - For enhanced location search functionality

### How to enable APIs:

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for each API and click "Enable"

## Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 4: Secure Your API Key (Important!)

1. Click on your API key to edit it
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domain(s):
   - For development: `http://localhost:*`
   - For production: `https://yourdomain.com/*`
4. Under "API restrictions", select "Restrict key" and choose:
   - Maps JavaScript API
   - Geocoding API
   - Places API (if enabled)

## Step 5: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your API key:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important**:

- Replace `your_actual_api_key_here` with your actual API key
- Never commit your `.env` file to version control
- The `.env` file should be in your `.gitignore`

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Post Creation page
3. Select "In-person" location type
4. You should see the Google Maps component with:
   - Interactive map
   - Search functionality
   - Current location button
   - Click-to-select location

## Troubleshooting

### Map not loading

- Check that your API key is correctly set in the `.env` file
- Verify that the Maps JavaScript API is enabled
- Check browser console for error messages
- Ensure your domain is added to the API key restrictions

### Location search not working

- Verify that the Geocoding API is enabled
- Check that your API key has access to the Geocoding API

### Current location not working

- Ensure your site is served over HTTPS (required for geolocation)
- Check that the user has granted location permissions
- Verify that the browser supports geolocation

## Cost Considerations

- Google Maps API has usage limits and costs
- For development, you get $200 in free credits per month
- Monitor your usage in the Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## Security Best Practices

1. **Always restrict your API key** to specific domains
2. **Use environment variables** for API keys
3. **Never expose API keys** in client-side code
4. **Monitor usage** regularly
5. **Rotate keys** periodically

## Support

If you encounter issues:

1. Check the [Google Maps JavaScript API documentation](https://developers.google.com/maps/documentation/javascript)
2. Review the [@vis.gl/react-google-maps documentation](https://visgl.github.io/react-google-maps/)
3. Check browser console for error messages
