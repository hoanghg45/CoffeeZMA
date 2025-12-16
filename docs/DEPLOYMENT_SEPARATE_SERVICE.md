# Deployment Guide: Separate Decode Service

Since your main app is deployed on **Zalo Platform**, you need a **separate service** for token conversion deployed on Vercel.

## Architecture

```
┌─────────────────────┐         ┌──────────────────┐
│  Zalo Mini App      │         │  Decode Service   │
│  (Zalo Platform)    │────────▶│  (Vercel)         │
│                     │         │                   │
│  - Frontend Code    │         │  - Token → Data   │
│  - UI Components    │         │  - Secret Key     │
│  - Business Logic   │         │  - API Proxy      │
└─────────────────────┘         └──────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  Zalo Open API   │
                              │  (External)      │
                              └──────────────────┘
```

## Step 1: Deploy Decode Service to Vercel

### Option A: Using Vercel CLI

```bash
cd zalo-api-proxy
vercel login
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → `zalo-api-proxy` (or your choice)
- **Directory?** → `./`

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. **Import Git Repository**:
   - If you pushed `zalo-api-proxy` to GitHub, import it
   - Or drag & drop the `zalo-api-proxy` folder
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `zalo-api-proxy` (if importing from monorepo)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
5. Click **"Deploy"**

## Step 2: Configure Environment Variable

After deployment, go to **Settings → Environment Variables**:

- **Key**: `ZALO_APP_SECRET_KEY`
- **Value**: Your secret key from https://developers.zalo.me/
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

Click **"Save"** and **redeploy** if needed.

## Step 3: Get Your Service URL

After deployment, Vercel will show your URL:
```
https://zalo-api-proxy.vercel.app
```
or
```
https://your-custom-name.vercel.app
```

**Copy this URL** - you'll need it for the next step.

## Step 4: Configure Main App

In your **main Zalo Mini App** (the one deployed on Zalo Platform):

1. Create or update `.env` file:
```bash
VITE_API_URL=https://zalo-api-proxy.vercel.app
```

2. Replace `zalo-api-proxy.vercel.app` with your actual Vercel URL.

3. **Important**: Make sure `.env` is in `.gitignore` (it should be already).

## Step 5: Test

### Test Decode Service

```bash
# Test location endpoint
curl -X POST https://your-proxy.vercel.app/api/location/convert \
  -H "Content-Type: application/json" \
  -d '{"token":"test","accessToken":"test"}'

# Should return an error (expected), but NOT a CORS error
```

### Test in Zalo Mini App

1. Deploy your main app to Zalo Platform
2. Open the app in Zalo
3. Try to get location - it should work now! ✅

## File Structure

### Main App (Zalo Platform)
```
CoffeeZMA/
├── src/
│   └── services/
│       ├── location.ts      # Calls Vercel API
│       └── user-info.ts     # Calls Vercel API
├── .env                     # VITE_API_URL=https://your-proxy.vercel.app
└── ... (rest of your app)
```

### Decode Service (Vercel)
```
zalo-api-proxy/
├── api/
│   ├── location/
│   │   └── convert.ts      # Token → Coordinates
│   └── user/
│       └── getphone.ts     # Token → Phone
├── vercel.json
└── package.json
```

## Troubleshooting

### Main App Can't Connect to Service

- ✅ Check `VITE_API_URL` is set correctly
- ✅ Verify Vercel deployment is successful
- ✅ Test service URL directly: `https://your-proxy.vercel.app/api/location/convert`

### "ZALO_APP_SECRET_KEY not configured"

- ✅ Go to Vercel Dashboard → Settings → Environment Variables
- ✅ Add `ZALO_APP_SECRET_KEY`
- ✅ Redeploy after adding environment variable

### CORS Errors

- ✅ Check `vercel.json` has CORS headers configured
- ✅ Verify service is deployed correctly
- ✅ Check browser console for specific CORS error

### Service Returns 404

- ✅ Verify files are in `api/location/convert.ts` (not `api/location.ts`)
- ✅ Check `vercel.json` exists in service root
- ✅ Review Vercel build logs

## Separate Repositories (Optional)

For better separation, you can:

1. **Create separate GitHub repo** for `zalo-api-proxy`
2. **Deploy independently** from Vercel
3. **Update main app** to use the service URL

This way:
- Main app changes don't affect the service
- Service can be updated independently
- Better separation of concerns

## Summary

✅ **Decode Service**: Deployed on Vercel  
✅ **Main App**: Deployed on Zalo Platform  
✅ **Connection**: Main app calls decode service via `VITE_API_URL`  
✅ **Security**: Secret key stays on Vercel, never exposed to client  

Your main app stays on Zalo Platform, and the decode service runs separately on Vercel! 🎉



