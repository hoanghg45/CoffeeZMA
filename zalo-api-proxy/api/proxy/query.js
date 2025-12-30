
const { Pool } = require('pg');

// Initialize pool using environment variables
// Ensure DATABASE_URL is set in your Vercel/Server environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // For self-hosted Docker Postgres, SSL might be disabled or configured differently
    // If connection fails with "The server does not support SSL", set DB_SSL=false in env
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = async (req, res) => {
    // CORS Configuration
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Secure this in production!
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Security Check
    const authHeader = req.headers.authorization;
    const SECRET_KEY = process.env.PROXY_SECRET || 'temp_secret_key_123';

    if (!authHeader || authHeader !== `Bearer ${SECRET_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query, params } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'SQL query is required' });
    }

    let client;
    try {
        client = await pool.connect();
        const result = await client.query(query, params);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database Proxy Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    } finally {
        if (client) client.release();
    }
};
