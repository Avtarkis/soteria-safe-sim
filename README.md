
# Soteria Safety Platform

## Important: Environment Variables Setup

For the app to work correctly in both development and production, you need to set the following environment variables:

```
VITE_SUPABASE_URL = your-supabase-project-url
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
```

### Setting Environment Variables in Lovable

1. In the Lovable editor, click on the gear icon (⚙️) in the top right to open Project Settings
2. Navigate to the "Environment Variables" tab
3. Add both variables with your Supabase project values
4. Save your changes
5. Redeploy your application for the changes to take effect

If you don't have a Supabase project yet, you can create one at [https://supabase.com](https://supabase.com) or use Lovable's built-in Supabase integration.

### Troubleshooting

If you're still experiencing a blank screen or navigation issues after setting environment variables:

1. Clear your browser cache or try in an incognito window
2. Check the browser console for any errors
3. Verify that your Supabase project is active and the API keys are correct
4. Try rebuilding and redeploying the application

The app includes fallback values for development, but these won't work optimally in production.
