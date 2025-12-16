# User Information API Fix Summary

## Problem

Similar to location, user information APIs (phone number, user ID, user info) may return tokens that need conversion, or they may return data directly depending on the API version.

## APIs Fixed

### 1. Phone Number (`getPhoneNumber`)
- **Returns**: Token that must be converted via Zalo Open API
- **Reference**: https://miniapp.zaloplatforms.com/documents/api/getPhoneNumber/

### 2. User ID (`getUserID`)
- **Returns**: User ID string directly (no conversion needed)
- **Reference**: https://miniapp.zaloplatforms.com/documents/api/getUserID/

### 3. User Info (`getUserInfo`)
- **Returns**: User information object directly (no conversion needed)
- **Reference**: https://miniapp.zaloplatforms.com/documents/api/getUserInfo/

## Changes Made

### 1. Created User Info Service (`src/services/user-info.ts`)

New service that handles all user information APIs:

- **`getCurrentPhoneNumber()`**: 
  - Gets phone number token from `getPhoneNumber()`
  - Converts token to actual phone number using Zalo Open API
  - Returns phone number string

- **`getCurrentUserID()`**: 
  - Gets user ID directly (no conversion needed)
  - Returns user ID string

- **`getCurrentUserInfo()`**: 
  - Gets user info directly (no conversion needed)
  - Returns user info object

### 2. Updated State Management (`src/state.ts`)

- **`userState`**: Now uses `getCurrentUserInfo()` service
- **`phoneState`**: Now uses `getCurrentPhoneNumber()` service with proper token conversion

## Setup Required

### ⚠️ IMPORTANT: Add Zalo Secret Key

The phone number conversion requires your Zalo App's secret key (same as location):

1. **Get Your Secret Key:**
   - Go to https://developers.zalo.me/
   - Navigate to your app → Quản lý ứng dụng
   - Copy the **Secret Key**

2. **Add to Environment Variables:**
   
   Create or update your `.env` file:
   ```bash
   VITE_ZALO_SECRET_KEY=your_secret_key_here
   ```

   ⚠️ **Security Note**: Since this uses `VITE_` prefix, the secret key will be embedded in the frontend bundle. This is acceptable for Zalo Mini Apps as they run in a controlled environment.

## How It Works

### Phone Number Flow:
1. User grants phone number permission
2. App calls `getPhoneNumber()` → receives `token`
3. App calls `getAccessToken()` → receives `accessToken`
4. App calls Zalo Open API: `https://openapi.zalo.me/v2.0/user/getphone`
5. Uses token, accessToken, and secret_key
6. Returns actual phone number

### User ID Flow:
1. App calls `getUserID()` → receives user ID directly ✅
2. No conversion needed

### User Info Flow:
1. App calls `getUserInfo()` → receives user info directly ✅
2. No conversion needed

## Testing

1. **Phone Number:**
   - Add `VITE_ZALO_SECRET_KEY` to your `.env` file
   - Restart dev server
   - Request phone number permission in the app
   - Verify phone number is retrieved correctly

2. **User ID:**
   - Should work immediately (no setup needed)
   - Verify user ID is retrieved correctly

3. **User Info:**
   - Should work immediately (no setup needed)
   - Verify user info (name, avatar, etc.) is retrieved correctly

## Troubleshooting

### "Zalo secret key not found" warning (Phone Number)

- Make sure you've added `VITE_ZALO_SECRET_KEY` to your `.env` file
- Restart your dev server after adding the environment variable
- Verify the secret key is correct in Zalo Developer Console

### Phone number still not working

- Check browser console for detailed error messages
- Verify phone number permission is granted in Zalo app settings
- Check if the token conversion API call is successful (check network tab)

## References

- [Zalo Mini App getPhoneNumber Documentation](https://miniapp.zaloplatforms.com/documents/api/getPhoneNumber/)
- [Zalo Mini App getUserID Documentation](https://miniapp.zaloplatforms.com/documents/api/getUserID/)
- [Zalo Mini App getUserInfo Documentation](https://miniapp.zaloplatforms.com/documents/api/getUserInfo/)



