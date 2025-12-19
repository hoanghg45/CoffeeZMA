# N8N Phone Number Conversion Setup

This guide explains how to set up N8N workflow for converting Zalo phone number tokens to actual phone numbers, similar to the location conversion flow.

## Overview

The phone number conversion flow allows you to use N8N webhooks instead of Vercel serverless functions for converting phone number tokens. This provides flexibility in your infrastructure setup.

## N8N Workflow Setup

### 1. Import the Workflow

1. Open your N8N instance
2. Click **"Workflows"** → **"Import from File"**
3. Select `docs/n8n-phone-convert-workflow.json`
4. The workflow will be imported with two nodes:
   - **Webhook2**: Receives POST requests at `/user/convert`
   - **HTTP Request1**: Calls Zalo Open API to convert token

### 2. Configure Environment Variables

In your N8N instance, set the following environment variable:

```bash
ZALO_APP_SECRET_KEY=your_secret_key_here
```

**To get your Secret Key:**
1. Go to https://developers.zalo.me/
2. Navigate to your app → **Quản lý ứng dụng**
3. Copy the **Secret Key**

### 3. Activate the Workflow

1. Click the **"Active"** toggle in the top right
2. Copy the **Webhook URL** (it will look like: `https://your-n8n-instance.com/webhook/user/convert`)

### 4. Configure Frontend

Add the N8N webhook URL to your `.env` file:

```env
# Specific webhook for phone number conversion
VITE_N8N_WEBHOOK_PHONE=https://your-n8n-instance.com/webhook/user/convert

# Optional: Generic webhook (fallback for backward compatibility)
# VITE_N8N_WEBHOOK=https://your-n8n-instance.com/webhook/user/convert
```

**Note:** 
- `VITE_N8N_WEBHOOK_PHONE` is the preferred variable for phone number conversion
- For backward compatibility, `VITE_N8N_WEBHOOK` can be used as a fallback
- **N8N webhook is required** - Vercel serverless function support has been removed

## How It Works

### Request Flow

1. **Frontend** (`src/services/user-info.ts`):
   - Calls `getPhoneNumber()` from Zalo SDK to get token
   - Gets access token using `getAccessToken()`
   - Sends POST request to N8N webhook with:
     ```json
     {
       "token": "phone_number_token",
       "accessToken": "zalo_access_token"
     }
     ```

2. **N8N Webhook**:
   - Receives the request
   - Extracts `token` and `accessToken` from request body

3. **N8N HTTP Request**:
   - Makes GET request to `https://openapi.zalo.me/v2.0/user/getphone`
   - Adds query parameters:
     - `access_token`: From request body
     - `code`: Phone number token from request body
     - `secret_key`: From N8N environment variable

4. **Zalo API Response**:
   ```json
   {
     "error": 0,
     "message": "Success",
     "data": {
       "number": "0123456789"
     }
   }
   ```

5. **Response to Frontend**:
   - N8N returns the response directly
   - Frontend parses the phone number from response

## Response Format Handling

The frontend service (`user-info.ts`) handles multiple response formats:

- **N8N Array Format**: `[{"data": {"number": "..."}}]`
- **N8N Object Format**: `{"data": {"number": "..."}}`
- **Flat Format**: `{"number": "..."}`

## Architecture

This implementation uses **N8N webhooks exclusively** for token conversion. This provides:

- **Visual Workflow**: Easy to configure and modify workflows
- **Flexibility**: Can handle multiple response formats
- **Centralized Management**: All webhooks managed in one N8N instance
- **Secret Management**: Secure handling via N8N environment variables

## Troubleshooting

### Issue: "Access token not available"
- Ensure `getAccessToken()` is called successfully
- Check Zalo app permissions

### Issue: "Secret key not configured"
- Verify `ZALO_APP_SECRET_KEY` is set in N8N environment variables
- Restart N8N after setting environment variable

### Issue: "Invalid phone number data received"
- Check Zalo API response format
- Verify token is valid and not expired
- Check N8N workflow execution logs

### Issue: CORS errors
- N8N webhooks don't require CORS configuration (handled automatically)
- If using custom domain, ensure CORS headers are configured

## Testing

Test the workflow using curl:

```bash
curl -X POST https://your-n8n-instance.com/webhook/user/convert \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test_token",
    "accessToken": "test_access_token"
  }'
```

**Note:** Replace with actual tokens from Zalo SDK for real testing.

## Related Files

- `src/services/user-info.ts` - Frontend service with N8N support
- `docs/n8n-phone-convert-workflow.json` - N8N workflow definition
- `zalo-api-proxy/api/user/getphone.js` - Vercel serverless alternative

