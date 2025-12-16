# ✅ Vercel Serverless Functions Setup Complete

## What Was Created

### 1. Serverless Functions (`/api` directory)

- **`api/location/convert.ts`**: Converts Zalo location token to coordinates
- **`api/user/getphone.ts`**: Converts Zalo phone number token to phone number

Both functions:
- ✅ Handle CORS properly
- ✅ Keep your secret key secure (server-side only)
- ✅ Provide detailed error messages
- ✅ Follow Vercel serverless function conventions

### 2. Configuration Files

- **`vercel.json`**: Vercel deployment configuration
- **`.env.example`**: Template for environment variables

### 3. Updated Services

- **`src/services/location.ts`**: Now calls Vercel API instead of direct Zalo API
- **`src/services/user-info.ts`**: Now calls Vercel API instead of direct Zalo API

## Next Steps to Deploy

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add Vercel serverless functions for Zalo API"
git push
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - Framework: **Other** (or leave auto-detect)
   - Root Directory: `./`
   - Build Command: Leave empty
   - Output Directory: Leave empty

### Step 3: Add Environment Variable

In Vercel Dashboard → Your Project → Settings → Environment Variables:

- **Name**: `ZALO_APP_SECRET_KEY`
- **Value**: Your secret key from https://developers.zalo.me/
- **Environment**: Production, Preview, Development (select all)

### Step 4: Deploy

Click **"Deploy"** and wait for deployment to complete.

### Step 5: Get Your Vercel URL

After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 6: Update Local Environment

Create `.env` file in project root:

```bash
VITE_API_URL=https://your-app.vercel.app
```

Replace `your-app.vercel.app` with your actual Vercel URL.

### Step 7: Test

1. Restart your dev server: `npm start`
2. Test location functionality in your Zalo Mini App
3. Location should now work! 🎉

## File Structure

```
CoffeeZMA/
├── api/                          # ← NEW: Vercel serverless functions
│   ├── location/
│   │   └── convert.ts            # Location token → coordinates
│   └── user/
│       └── getphone.ts           # Phone token → phone number
├── src/
│   └── services/
│       ├── location.ts           # ← UPDATED: Uses Vercel API
│       └── user-info.ts         # ← UPDATED: Uses Vercel API
├── vercel.json                   # ← NEW: Vercel config
├── docs/
│   └── VERCEL_DEPLOYMENT.md     # ← NEW: Detailed deployment guide
└── .env                          # ← CREATE: Add VITE_API_URL here
```

## How It Works

1. **User clicks location icon** → Zalo Mini App calls `getLocation()`
2. **Zalo returns token** → App calls `getCurrentLocation()` service
3. **Service calls Vercel API** → `POST /api/location/convert` with token
4. **Vercel function calls Zalo Open API** → Converts token using secret key
5. **Returns coordinates** → App receives lat/long ✅

## Troubleshooting

### Still getting CORS errors?

- ✅ Check `VITE_API_URL` is set correctly in `.env`
- ✅ Verify Vercel deployment is successful
- ✅ Test API endpoint: `https://your-app.vercel.app/api/location/convert`

### "ZALO_APP_SECRET_KEY not configured"?

- ✅ Go to Vercel Dashboard → Settings → Environment Variables
- ✅ Add `ZALO_APP_SECRET_KEY` with your secret key
- ✅ Redeploy after adding environment variable

### Function returns 404?

- ✅ Check files are in correct location: `api/location/convert.ts`
- ✅ Verify `vercel.json` exists in project root
- ✅ Check Vercel build logs for errors

## Security Notes

✅ **Secret Key**: Stored securely in Vercel environment variables (never in code)  
✅ **CORS**: Properly configured to allow requests from your Zalo Mini App  
✅ **Error Handling**: Detailed logging without exposing sensitive data  

## Support

- 📖 [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md) - Detailed step-by-step
- 🔗 [Vercel Documentation](https://vercel.com/docs)
- 🔗 [Zalo Mini App Docs](https://miniapp.zaloplatforms.com/)

---

**Status**: ✅ Ready to deploy! Follow the steps above to get location working.



