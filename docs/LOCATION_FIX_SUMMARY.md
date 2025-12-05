# Location API Fix Summary

## Problem

When creating an address in "Sổ địa chỉ" (Address Book), the app couldn't retrieve latitude/longitude coordinates even though location permission was granted in Zalo app.

## Root Cause

The previous implementation was incorrectly trying to destructure `{ latitude, longitude }` directly from `getLocation()`. 

Zalo's `getLocation()` API behavior can vary:
- **Newer versions**: May return coordinates directly `{ latitude, longitude }`
- **Older versions**: Returns a token `{ token }` that needs conversion via Zalo Open API

## Changes Made

### 1. Created Location Service (`src/services/location.ts`)

- New service that handles **both** direct coordinates and token-based flows
- `getCurrentLocation()`: 
  - First tries to get coordinates directly
  - If token is returned, converts it using Zalo Open API directly from the mini app
- No separate backend required!

### 2. Updated Address Picker (`src/components/address-picker.tsx`)

- Fixed import: Changed from `zmp-sdk` to use new `getCurrentLocation` service
- Updated `handleGetCurrentLocation()` to use the new service
- Now properly handles both direct coordinates and token conversion

### 3. Updated State Management (`src/state.ts`)

- Updated `locationState` selector to use new `getCurrentLocation` service
- Removed incorrect direct usage of `getLocation()`

## Setup Required

### ⚠️ IMPORTANT: Add Zalo Secret Key

If `getLocation()` returns a token (instead of direct coordinates), you need to add your Zalo App's secret key:

1. **Get Your Secret Key:**
   - Go to https://developers.zalo.me/
   - Navigate to your app → Quản lý ứng dụng
   - Copy the **Secret Key**

2. **Add to Environment Variables:**
   
   Create or update your `.env` file:
   ```bash
   VITE_ZALO_SECRET_KEY=your_secret_key_here
   ```

   ⚠️ **Security Note**: Since this uses `VITE_` prefix, the secret key will be embedded in the frontend bundle. This is acceptable for Zalo Mini Apps as they run in a controlled environment, but be aware that anyone with access to your built code can see it.

   **Alternative**: If Zalo Platform provides secure environment variables or serverless functions, use those instead.

## How It Works Now

1. User clicks location icon in address form
2. App calls `getCurrentLocation()` which:
   - Calls `getLocation()` from Zalo SDK
   - **If coordinates are returned directly**: Uses them immediately ✅
   - **If token is returned**: 
     - Gets access token
     - Calls Zalo Open API directly with token, accessToken, and secret_key
     - Converts token to coordinates
3. App updates form with coordinates

## Testing

1. Open the app in Zalo
2. Go to "Sổ địa chỉ" → "Thêm mới"
3. Click the location icon next to "Địa chỉ" field
4. Grant location permission if prompted
5. Verify that lat/long are populated in the form

## Troubleshooting

### "Zalo secret key not found" warning

- Make sure you've added `VITE_ZALO_SECRET_KEY` to your `.env` file
- Restart your dev server after adding the environment variable
- Verify the secret key is correct in Zalo Developer Console

### Location still not working

- Check browser console for detailed error messages
- Verify location permission is granted in Zalo app settings
- Check if `getLocation()` is returning a token or direct coordinates (check console logs)

## References

- [Zalo Mini App getLocation Documentation](https://miniapp.zaloplatforms.com/documents/api/getLocation/)

