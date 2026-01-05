/**
 * Database Service
 * 
 * Provides a secure bridge to the self-hosted PostgreSQL database via a Proxy API.
 * Optimized for Zalo Mini App environment where direct TCP connections are restricted.
 */

// Configuration - Preferably moved to .env in production
const DB_CONFIG = {
  PROXY_URL: import.meta.env.VITE_DB_PROXY_URL || (import.meta.env.DEV ? "http://localhost:3000/api/proxy/query" : "https://muoicoffeentea.com/api/proxy/query"),
  SECRET_KEY: import.meta.env.VITE_PROXY_SECRET || "temp_secret_key_123",
  TIMEOUT: 15000,
};

/**
 * Executes a SQL query via the secure API proxy.
 * 
 * @template T The expected row type
 * @param {string} sql The SQL query string (use $1, $2 for parameters)
 * @param {any[]} params Parameters to prevent SQL injection
 * @returns {Promise<T[]>} Array of result rows
 */
export async function runQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DB_CONFIG.TIMEOUT);

  try {
    const response = await fetch(DB_CONFIG.PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DB_CONFIG.SECRET_KEY}`,
      },
      body: JSON.stringify({
        query: sql,
        params,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Database Query Failed";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Database query timed out after ${DB_CONFIG.TIMEOUT}ms`);
    }
    console.error(`[DB Service Error]:`, error.message || error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * compatibility layer for existing codebases expecting a 'pg' like interface.
 * Matches the interface of @neondatabase/serverless or pg Pool.
 * 
 * NOTE: The proxy API is stateless and doesn't support true transactions.
 * BEGIN/COMMIT/ROLLBACK are no-ops, but queries will still execute.
 */
export const pool = {
  /**
   * Mock of pg.Pool.query
   */
  query: async <T = any>(text: string, values?: any[]) => {
    const rows = await runQuery<T>(text, values || []);
    return {
      rows,
      rowCount: rows.length,
      command: text.split(' ')[0].toUpperCase(),
      oid: 0,
      fields: []
    };
  },
  /**
   * Mock of pg.Pool.connect() - returns a client-like object
   * Since the proxy API is stateless, transactions (BEGIN/COMMIT/ROLLBACK) are no-ops
   */
  connect: async () => {
    return {
      /**
       * Client query method - wraps pool.query
       * Transaction commands (BEGIN/COMMIT/ROLLBACK) are silently ignored
       * since the proxy API doesn't support transactions
       */
      query: async <T = any>(text: string, values?: any[]) => {
        const upperText = text.trim().toUpperCase();
        // Ignore transaction commands (no-op for stateless proxy)
        if (upperText === 'BEGIN' || upperText === 'COMMIT' || upperText === 'ROLLBACK') {
          return {
            rows: [],
            rowCount: 0,
            command: upperText,
            oid: 0,
            fields: []
          };
        }
        // Execute actual queries
        return pool.query<T>(text, values);
      },
      /**
       * Release method - no-op for stateless proxy
       */
      release: () => {
        // No-op: stateless proxy doesn't maintain connections
      }
    };
  }
};

export default {
  runQuery,
  pool,
};
