# Database Connection Guide (Zalo Mini App)

Since client-side applications (like Zalo Mini Apps) cannot make direct TCP connections to a self-hosted PostgreSQL database, we use a **Proxy API Endpoint** hosted on your main application server.

## 🔌 Connection Details

Instead of using a `postgres://` connection string (like Neon), you will send HTTP requests to the API.

| Config | Value |
| :--- | :--- |
| **Endpoint URL** | `https://muoicoffeentea.com/api/proxy/query` |
| **Method** | `POST` |
| **Auth Header** | `Authorization: Bearer temp_secret_key_123` |
| **Content-Type** | `application/json` |

---

## 💻 Code Implementation

Replace your existing `db.ts` or Neon connection logic with this `runQuery` function.

```javascript
/* src/services/db.ts */

const DB_PROXY_URL = "https://muoicoffeentea.com/api/proxy/query";
const SECRET_KEY = "temp_secret_key_123"; // ⚠️ Recommendation: Rotate this key in production

/**
 * Executes a SQL query via the secure proxy.
 * @param {string} sql - The SQL query (e.g., "SELECT * FROM users WHERE id = $1")
 * @param {any[]} params - Array of parameters for the query
 * @returns {Promise<any[]>} - Array of rows returned by the database
 */
export async function runQuery(sql, params = []) {
  try {
    const response = await fetch(DB_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SECRET_KEY}`,
      },
      body: JSON.stringify({
        query: sql,
        params: params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Database Query Failed");
    }

    return await response.json();
  } catch (error) {
    console.error("DB Proxy Error:", error);
    throw error;
  }
}
```

### Usage Example

```javascript
import { runQuery } from './services/db';

async function getProducts() {
  // Select all products
  const products = await runQuery('SELECT * FROM products');
  console.log(products);

  // Select with parameters (safe against SQL injection)
  const user = await runQuery('SELECT * FROM users WHERE id = $1', [123]);
  console.log(user);
}
```

---

## 🛡 Security Note

*   **Secret Key:** The current key is `temp_secret_key_123`.
*   **Rotation:** You can change this key by updating `PROXY_SECRET` in your `.env` file on the server and redeploying. Don't forget to update your client app if you do!
