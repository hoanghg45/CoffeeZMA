# N8N Webhook Configuration Migration Guide

## Overview

Previously, both location and phone number conversion services shared a single `VITE_N8N_WEBHOOK` environment variable. This caused conflicts when you need separate webhooks for each service.

## Solution

We've introduced **separate environment variables** for each service:

- `VITE_N8N_WEBHOOK_LOCATION` - For location token conversion
- `VITE_N8N_WEBHOOK_PHONE` - For phone number token conversion

## Migration Steps

### Step 1: Update Your `.env` File

**Before:**
```env
VITE_N8N_WEBHOOK=https://n8n.r2.coool.cafe/webhook/location/convert
```

**After:**
```env
# Location conversion webhook
VITE_N8N_WEBHOOK_LOCATION=https://n8n.r2.coool.cafe/webhook/location/convert

# Phone number conversion webhook
VITE_N8N_WEBHOOK_PHONE=https://n8n.r2.coool.cafe/webhook/user/convert
```

### Step 2: Verify Your N8N Workflows

Make sure you have both workflows set up in N8N:

1. **Location Conversion Workflow**
   - Webhook path: `/location/convert`
   - Endpoint: `https://openapi.zalo.me/v2.0/location/getlocation`

2. **Phone Number Conversion Workflow**
   - Webhook path: `/user/convert`
   - Endpoint: `https://openapi.zalo.me/v2.0/user/getphone`

### Step 3: Test Both Services

1. **Test Location Conversion:**
   - Try adding a new address in the app
   - Verify location coordinates are retrieved correctly

2. **Test Phone Number Conversion:**
   - Go to checkout flow
   - Request phone number permission
   - Verify phone number is displayed correctly

## Configuration

Each service requires its own specific webhook variable:

- **Location service**: Requires `VITE_N8N_WEBHOOK_LOCATION`
- **Phone service**: Requires `VITE_N8N_WEBHOOK_PHONE`

No fallback is provided - each service must have its own webhook configured.

## Required Configuration

Each service requires its own specific webhook:

### Location Service
- **Required**: `VITE_N8N_WEBHOOK_LOCATION`

### Phone Number Service
- **Required**: `VITE_N8N_WEBHOOK_PHONE`

**Note:** 
- Each service requires its own webhook - no fallback is provided
- Vercel serverless function support has been removed
- Only N8N webhooks are supported

## Example Configuration

```env
# Location conversion webhook (required)
VITE_N8N_WEBHOOK_LOCATION=https://n8n.r2.coool.cafe/webhook/location/convert

# Phone number conversion webhook (required)
VITE_N8N_WEBHOOK_PHONE=https://n8n.r2.coool.cafe/webhook/user/convert
```

**Important Notes:**
- Both webhooks are required - no fallback is provided
- Each service uses its own specific webhook variable
- **Vercel serverless function support has been removed** - only N8N webhooks are supported

## Troubleshooting

### Issue: Location conversion not working

**Check:**
1. Is `VITE_N8N_WEBHOOK_LOCATION` set correctly?
2. Is the N8N workflow active?
3. Check browser console for error messages

**Solution:**
```env
VITE_N8N_WEBHOOK_LOCATION=https://n8n.r2.coool.cafe/webhook/location/convert
```

### Issue: Phone number conversion not working

**Check:**
1. Is `VITE_N8N_WEBHOOK_PHONE` set correctly?
2. Is the N8N workflow active?
3. Check browser console for error messages

**Solution:**
```env
VITE_N8N_WEBHOOK_PHONE=https://n8n.r2.coool.cafe/webhook/user/convert
```

### Issue: Service not working

**Cause:** Missing required webhook configuration.

**Solution:** Ensure both `VITE_N8N_WEBHOOK_LOCATION` and `VITE_N8N_WEBHOOK_PHONE` are set in your `.env` file.

## Benefits of Separate Variables

1. **No Conflicts**: Each service has its own webhook
2. **Flexibility**: Can use different N8N instances for different services
3. **Clarity**: Clear which webhook is used for which service
4. **Maintainability**: Easier to debug and maintain

## Related Documentation

- [N8N Phone Conversion Setup](./N8N_PHONE_CONVERSION_SETUP.md)
- [Location Fix Summary](./LOCATION_FIX_SUMMARY.md)
- [User Info Fix Summary](./USER_INFO_FIX_SUMMARY.md)

