
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

### Troubleshooting Blank Screens

If you experience a blank screen or non-functioning navigation:

1. **Ensure Environment Variables are Set**:
   - Make sure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your Lovable Project Settings
   - These must be set exactly as named above (they are case-sensitive)

2. **After Setting Variables**:
   - Save all changes in project settings
   - Redeploy your application using the Publish button
   - The app will use fallback development values if these are not set, but with limited functionality

3. **If Still Experiencing Issues**:
   - Clear your browser cache or try in an incognito window
   - Check the browser console for specific error messages
   - Verify that your Supabase project is active and the API keys are correct

### Development vs. Production

- In development mode, the app includes fallback values for Supabase to prevent crashes
- In production, proper environment variables must be set for full functionality
- Lovable handles environment variable injection during the build process, no .env files are needed

