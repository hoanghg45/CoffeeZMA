/**
 * Zalo Location Token Conversion Service (JavaScript version for Vercel)
 * 
 * Endpoint: POST /api/location/convert
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { token, accessToken } = req.body;

    // Validate required parameters
    if (!token || !accessToken) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: 'Both token and accessToken are required'
      });
    }

    // Get secret key from Vercel environment variables
    const secretKey = process.env.ZALO_APP_SECRET_KEY;

    if (!secretKey) {
      console.error('ZALO_APP_SECRET_KEY is not set in Vercel environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'ZALO_APP_SECRET_KEY environment variable is not configured'
      });
    }

    // Call Zalo Open API to convert token to coordinates
    const zaloApiUrl = new URL('https://openapi.zalo.me/v2.0/location/getlocation');
    zaloApiUrl.searchParams.set('access_token', accessToken);
    zaloApiUrl.searchParams.set('code', token);
    zaloApiUrl.searchParams.set('secret_key', secretKey);

    // Call Zalo Open API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let zaloResponse;
    try {
      zaloResponse = await fetch(zaloApiUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ 
          error: 'Request timeout',
          details: 'Zalo API request timed out after 10 seconds'
        });
      }
      throw fetchError;
    }

    if (!zaloResponse.ok) {
      const errorText = await zaloResponse.text();
      console.error('Zalo API error:', errorText);
      return res.status(zaloResponse.status).json({ 
        error: 'Zalo API request failed',
        details: errorText
      });
    }

    const zaloData = await zaloResponse.json();

    if (zaloData.error !== 0) {
      return res.status(400).json({ 
        error: 'Zalo API returned an error',
        details: zaloData.message || 'Unknown error',
        errorCode: zaloData.error
      });
    }

    if (!zaloData.data || !zaloData.data.latitude || !zaloData.data.longitude) {
      return res.status(400).json({ 
        error: 'Invalid response from Zalo API',
        details: 'Missing latitude or longitude in response'
      });
    }

    // Return coordinates to the client
    return res.status(200).json({
      latitude: zaloData.data.latitude,
      longitude: zaloData.data.longitude,
      provider: zaloData.data.provider,
      timestamp: zaloData.data.timestamp
    });

  } catch (error) {
    console.error('Error in location conversion:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error occurred'
    });
  }
}

