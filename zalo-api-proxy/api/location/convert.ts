/**
 * Zalo Location Token Conversion Service
 * 
 * Standalone serverless function to convert Zalo location tokens to coordinates.
 * Deploy this separately from your main Zalo Mini App.
 * 
 * Endpoint: POST /api/location/convert
 * 
 * Request Body:
 * {
 *   "token": "location_token_from_zalo",
 *   "accessToken": "access_token_from_zalo"
 * }
 * 
 * Response:
 * {
 *   "latitude": "10.758341",
 *   "longitude": "106.745863"
 * }
 */

interface VercelRequest {
  method: string;
  body: any;
  query: Record<string, string>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Enable CORS for Zalo Mini App
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { token, accessToken } = request.body;

    // Validate required parameters
    if (!token || !accessToken) {
      return response.status(400).json({ 
        error: 'Missing required parameters',
        details: 'Both token and accessToken are required'
      });
    }

    // Get secret key from Vercel environment variables
    const secretKey = process.env.ZALO_APP_SECRET_KEY;

    if (!secretKey) {
      console.error('ZALO_APP_SECRET_KEY is not set in Vercel environment variables');
      return response.status(500).json({ 
        error: 'Server configuration error',
        details: 'ZALO_APP_SECRET_KEY environment variable is not configured'
      });
    }

    // Call Zalo Open API to convert token to coordinates
    const zaloApiUrl = new URL('https://openapi.zalo.me/v2.0/location/getlocation');
    zaloApiUrl.searchParams.set('access_token', accessToken);
    zaloApiUrl.searchParams.set('code', token);
    zaloApiUrl.searchParams.set('secret_key', secretKey);

    const zaloResponse = await fetch(zaloApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!zaloResponse.ok) {
      const errorText = await zaloResponse.text();
      console.error('Zalo API error:', errorText);
      return response.status(zaloResponse.status).json({ 
        error: 'Zalo API request failed',
        details: errorText
      });
    }

    const zaloData = await zaloResponse.json();

    // Zalo API response structure:
    // {
    //   "data": {
    //     "provider": "gps",
    //     "latitude": "10.758341",
    //     "longitude": "106.745863",
    //     "timestamp": "1666249171003"
    //   },
    //   "error": 0,
    //   "message": "Success"
    // }

    if (zaloData.error !== 0) {
      return response.status(400).json({ 
        error: 'Zalo API returned an error',
        details: zaloData.message || 'Unknown error',
        errorCode: zaloData.error
      });
    }

    if (!zaloData.data || !zaloData.data.latitude || !zaloData.data.longitude) {
      return response.status(400).json({ 
        error: 'Invalid response from Zalo API',
        details: 'Missing latitude or longitude in response'
      });
    }

    // Return coordinates to the client
    return response.status(200).json({
      latitude: zaloData.data.latitude,
      longitude: zaloData.data.longitude,
      provider: zaloData.data.provider,
      timestamp: zaloData.data.timestamp
    });

  } catch (error) {
    console.error('Error in location conversion:', error);
    return response.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

