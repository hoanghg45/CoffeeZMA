# Zalo API Proxy - Standalone Decode Service

This is a **separate, standalone service** for converting Zalo Mini App tokens to actual data (location coordinates, phone numbers).

## Why Separate?

- Your main Zalo Mini App is deployed on **Zalo Platform**
- This decode service needs to be deployed on **Vercel** (or similar) to avoid CORS issues
- Keeps your secret key secure on the server side
- Independent deployment and scaling

## Structure

```
zalo-api-proxy/
├── api/
│   ├── location/
│   │   └── convert.js       # Location token → coordinates
│   └── user/
│       └── getphone.js      # Phone token → phone number
├── vercel.json              # Vercel configuration
├── package.json             # Minimal dependencies
└── README.md                # This file
```

## Quick Start

### 1. Deploy to Vercel

```bash
cd zalo-api-proxy
vercel login
vercel
```

Or use Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import this `zalo-api-proxy` folder as a new project
3. Deploy

### 2. Set Environment Variable

In Vercel Dashboard → Settings → Environment Variables:

- **Name**: `ZALO_APP_SECRET_KEY`
- **Value**: Your secret key from https://developers.zalo.me/
- **Environment**: Production, Preview, Development

### 3. Get Your API URL

After deployment, you'll get a URL like:
```
https://your-proxy-name.vercel.app
```

### 4. Use in Your Zalo Mini App

In your main app's `.env` file:

```bash
VITE_API_URL=https://your-proxy-name.vercel.app
```

## API Endpoints

### POST `/api/location/convert`

Converts location token to coordinates.

**Request:**
```json
{
  "token": "location_token_from_zalo",
  "accessToken": "access_token_from_zalo"
}
```

**Response:**
```json
{
  "latitude": "10.758341",
  "longitude": "106.745863",
  "provider": "gps",
  "timestamp": "1666249171003"
}
```

### POST `/api/user/getphone`

Converts phone number token to phone number.

**Request:**
```json
{
  "token": "phone_token_from_zalo",
  "accessToken": "access_token_from_zalo"
}
```

**Response:**
```json
{
  "number": "849123456789"
}
```

## Testing

Test the endpoints with curl:

```bash
# Test location conversion
curl -X POST https://zalo-api-proxy.vercel.app/api/location/convert \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN","accessToken":"YOUR_ACCESS_TOKEN"}'

# Test phone conversion
curl -X POST https://zalo-api-proxy.vercel.app/api/user/getphone \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN","accessToken":"YOUR_ACCESS_TOKEN"}'
```

## Security

✅ **Secret Key**: Stored securely in Vercel environment variables  
✅ **CORS**: Configured to allow requests from your Zalo Mini App  
✅ **Error Handling**: Detailed logging without exposing sensitive data  

## Deployment

This service is designed to be deployed **separately** from your main Zalo Mini App:

- **Main App**: Deployed on Zalo Platform
- **This Service**: Deployed on Vercel (or similar serverless platform)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Zalo Open API Documentation](https://developers.zalo.me/docs/api/open-api/)

