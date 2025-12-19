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

## Backward Compatibility

For backward compatibility, the code still supports the generic `VITE_N8N_WEBHOOK` variable as a fallback:

- **Location service**: Uses `VITE_N8N_WEBHOOK_LOCATION` first, falls back to `VITE_N8N_WEBHOOK` if not set
- **Phone service**: Uses `VITE_N8N_WEBHOOK_PHONE` first, falls back to `VITE_N8N_WEBHOOK` if not set

However, **we recommend migrating to the specific variables** to avoid conflicts.

## Priority Order

Each service checks environment variables in this order:

### Location Service
1. `VITE_N8N_WEBHOOK_LOCATION` (preferred)
2. `VITE_N8N_WEBHOOK` (fallback)

### Phone Number Service
1. `VITE_N8N_WEBHOOK_PHONE` (preferred)
2. `VITE_N8N_WEBHOOK` (fallback)

**Note:** Vercel serverless function support has been removed. Only N8N webhooks are supported.

## Example Configuration

```env
# N8N Webhooks (required - specific per service)
VITE_N8N_WEBHOOK_LOCATION=https://n8n.r2.coool.cafe/webhook/location/convert
VITE_N8N_WEBHOOK_PHONE=https://n8n.r2.coool.cafe/webhook/user/convert

# Optional: Generic webhook (fallback for backward compatibility)
# VITE_N8N_WEBHOOK=https://n8n.r2.coool.cafe/webhook/generic
```

**Important Notes:**
- At least one webhook must be configured for each service
- Either use specific webhooks (`VITE_N8N_WEBHOOK_LOCATION` and `VITE_N8N_WEBHOOK_PHONE`) or the generic webhook (`VITE_N8N_WEBHOOK`)
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

### Issue: Both services using the same webhook

**Cause:** You're still using `VITE_N8N_WEBHOOK` instead of the specific variables.

**Solution:** Migrate to specific variables as shown in Step 1.

## Benefits of Separate Variables

1. **No Conflicts**: Each service has its own webhook
2. **Flexibility**: Can use different N8N instances for different services
3. **Clarity**: Clear which webhook is used for which service
4. **Maintainability**: Easier to debug and maintain

## Related Documentation

- [N8N Phone Conversion Setup](./N8N_PHONE_CONVERSION_SETUP.md)
- [Location Fix Summary](./LOCATION_FIX_SUMMARY.md)
- [User Info Fix Summary](./USER_INFO_FIX_SUMMARY.md)

