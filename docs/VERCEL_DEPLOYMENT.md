# Vercel Deployment Guide for Zalo Mini App

This guide will help you deploy your Zalo Mini App with serverless functions to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier is sufficient)
3. Your Zalo App Secret Key (from https://developers.zalo.me/)

## Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## Step 2: Push Your Code to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Add Vercel serverless functions for location and phone conversion"
```

2. Create a new repository on GitHub and push:
```bash
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other (or Vite if available)
   - **Root Directory**: `./` (root)
   - **Build Command**: Leave empty (Vercel will auto-detect)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - Click **"Environment Variables"**
   - Add: `ZALO_APP_SECRET_KEY` = `your_secret_key_here`
   - Make sure it's available for **Production**, **Preview**, and **Development**

6. Click **"Deploy"**

### Option B: Via Vercel CLI

```bash
vercel login
vercel
```

Follow the prompts, then add environment variable:
```bash
vercel env add ZALO_APP_SECRET_KEY
# Paste your secret key when prompted
```

## Step 4: Get Your Vercel URL

After deployment, Vercel will provide you with a URL like:
```
https://your-app-name.vercel.app
```

## Step 5: Update Your Local Environment

Create or update your `.env` file:

```bash
# Replace with your actual Vercel deployment URL
VITE_API_URL=https://your-app-name.vercel.app
```

**Important**: Don't commit `.env` to git. Add it to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

## Step 6: Test the Deployment

1. **Test Location API**:
   ```bash
   curl -X POST https://your-app-name.vercel.app/api/location/convert \
     -H "Content-Type: application/json" \
     -d '{"token":"test_token","accessToken":"test_access_token"}'
   ```

2. **Test Phone API**:
   ```bash
   curl -X POST https://your-app-name.vercel.app/api/user/getphone \
     -H "Content-Type: application/json" \
     -d '{"token":"test_token","accessToken":"test_access_token"}'
   ```

   Note: These will fail with actual errors (expected), but should return proper error messages, not CORS errors.

## Step 7: Update Your Zalo Mini App

1. Restart your local dev server:
   ```bash
   npm start
   ```

2. Test location functionality in your Zalo Mini App
3. The app should now successfully convert location tokens to coordinates!

## Troubleshooting

### CORS Errors Still Occurring

- Make sure `VITE_API_URL` is set correctly
- Check that your Vercel deployment URL is correct
- Verify the API routes are accessible: `https://your-app.vercel.app/api/location/convert`

### "ZALO_APP_SECRET_KEY not configured" Error

- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify `ZALO_APP_SECRET_KEY` is set
- Redeploy after adding environment variables

### Function Not Found (404)

- Check that files are in correct location: `api/location/convert.ts` and `api/user/getphone.ts`
- Verify `vercel.json` is in project root
- Check Vercel build logs for any errors

### TypeScript Errors

- Make sure `@vercel/node` is installed: `npm install -D @vercel/node`
- Vercel should auto-detect TypeScript, but you may need to configure `tsconfig.json`

## File Structure

Your project should now have:

```
CoffeeZMA/
├── api/
│   ├── location/
│   │   └── convert.ts      # Location token conversion
│   └── user/
│       └── getphone.ts      # Phone number conversion
├── src/
│   └── services/
│       ├── location.ts      # Updated to use Vercel API
│       └── user-info.ts     # Updated to use Vercel API
├── vercel.json              # Vercel configuration
├── .env                     # Local environment (not committed)
└── package.json
```

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Update `.env` with Vercel URL
4. ✅ Test location functionality
5. ✅ Test phone number functionality

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Zalo Mini App Documentation](https://miniapp.zaloplatforms.com/)

