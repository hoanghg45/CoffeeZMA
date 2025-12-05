# Fixed: Vercel Deployment Error

## What Was Fixed

The error `Function Runtimes must have a valid version` was caused by an invalid runtime configuration in `vercel.json`.

**Fixed:**
- ✅ Removed invalid `functions` configuration
- ✅ Added `tsconfig.json` for TypeScript support
- ✅ Updated `package.json` with Node.js engine spec
- ✅ Vercel will now auto-detect TypeScript serverless functions

## Redeploy Steps

### Option 1: Redeploy via CLI

```bash
cd zalo-api-proxy
vercel --prod
```

### Option 2: Redeploy via Dashboard

1. Go to https://vercel.com/hphlongs-projects/zalo-api-proxy
2. Click **"Redeploy"** button
3. Wait for deployment to complete

## Important: Set Environment Variable

Before testing, make sure you've set the environment variable:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Key**: `ZALO_APP_SECRET_KEY`
   - **Value**: Your secret key from https://developers.zalo.me/
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
3. Click **"Save"**
4. **Redeploy** after adding the variable

## Test After Deployment

After successful deployment, test the endpoint:

```bash
curl -X POST https://zalo-api-proxy-1790mdtc4-hphlongs-projects.vercel.app/api/location/convert \
  -H "Content-Type: application/json" \
  -d '{"token":"test","accessToken":"test"}'
```

You should get an error response (expected), but **NOT** a CORS error or 404.

## Update Main App

Once deployment is successful, update your main app's `.env`:

```bash
VITE_API_URL=https://zalo-api-proxy-1790mdtc4-hphlongs-projects.vercel.app
```

Replace with your actual Vercel URL from the deployment.

