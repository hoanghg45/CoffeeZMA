# Serverless Location API Handler

Since Zalo blocks direct browser calls to their Open API, you need a "Serverless Function" to act as a secure bridge. This is free and easy to host on Vercel.

## 1. Create a `api/location.js` file (for Vercel)

If you are deploying to Vercel, simply create a folder named `api` in your project root and add this file:

```javascript
// api/location.js
export default async function handler(request, response) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  const { token, accessToken } = request.body;
  const secretKey = process.env.ZALO_APP_SECRET_KEY; // Add this in Vercel Settings

  if (!token || !accessToken) {
    return response.status(400).json({ error: 'Missing token or accessToken' });
  }

  try {
    // Call Zalo Open API from the SERVER side (allows CORS)
    const zaloUrl = `https://openapi.zalo.me/v2.0/location/getlocation?access_token=${accessToken}&code=${token}&secret_key=${secretKey}`;
    
    const zaloResponse = await fetch(zaloUrl);
    const data = await zaloResponse.json();

    if (data.error !== 0) {
      return response.status(400).json({ error: data.message });
    }

    return response.status(200).json({
      latitude: data.data.latitude,
      longitude: data.data.longitude
    });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
```

## 2. Deploy

1.  Push your code to GitHub.
2.  Import project to [Vercel](https://vercel.com).
3.  Add Environment Variable in Vercel: `ZALO_APP_SECRET_KEY`.
4.  Get your Vercel URL (e.g., `https://my-coffee-app.vercel.app`).

## 3. Update Client Config

In your project `.env`:

```bash
# Point to your Vercel serverless function
VITE_API_URL=https://my-coffee-app.vercel.app/api
```

This solves the "Serverless" requirement while respecting Zalo's security architecture.



