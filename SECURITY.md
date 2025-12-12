# Security Policy & Known Vulnerabilities

## Current Security Status

**Last Audit Date:** 2024-12-12

### Resolved Vulnerabilities

The following vulnerabilities have been fixed:

1. ✅ **PostCSS & postcss-preset-env** (40 vulnerabilities) - Upgraded from v6.7.0 to v10.x
2. ✅ **glob** (1 high severity) - Fixed via npm audit fix
3. ✅ **XSS via dangerouslySetInnerHTML** - Added HTML sanitization utility
4. ✅ **Wildcard CORS Policy** - Restricted to specific allowed origins
5. ✅ **Overly Permissive CSP** - Tightened Content Security Policy

### Known Unfixable Vulnerabilities

The following vulnerabilities exist in third-party dependencies and cannot be fixed without breaking changes:

| Package | Severity | Issue | Reason |
|---------|----------|-------|--------|
| `@sentry/browser` via `zmp-sdk` | Moderate | Prototype Pollution gadget | Zalo SDK dependency - waiting for Zalo to update |
| `esbuild` via `vite` → `zmp-vite-plugin` | Moderate | Dev server request vulnerability | No fix available yet; **only affects development** |

**Note:** The `esbuild` vulnerability only affects the development server and does not impact production builds.

---

## Security Measures Implemented

### 1. HTML Sanitization

All user-generated or database-sourced HTML content is sanitized before rendering:

```typescript
import { sanitizeHtml } from "utils/sanitize";

// Before:
dangerouslySetInnerHTML={{ __html: product.description }}

// After (secure):
dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
```

The sanitizer removes:
- `<script>` tags
- Event handlers (onclick, onerror, etc.)
- JavaScript URLs
- Dangerous HTML elements (iframe, object, embed, form, etc.)

### 2. CORS Configuration

API endpoints use origin whitelisting instead of wildcards:

```javascript
const allowedOrigins = [
  'https://h5.zaloplatforms.com',
  'https://h5.zdn.vn',
  'http://localhost:3000',
  'http://localhost:5173',
];
```

To add custom origins, set the `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://your-domain.com,https://another-domain.com
```

### 3. Content Security Policy

The CSP has been tightened to:
- Restrict script sources to trusted domains
- Block object/embed elements
- Restrict frame sources
- Block unsafe-eval (where possible)

### 4. Environment Variable Security

Sensitive keys are stored server-side only:
- `ZALO_APP_SECRET_KEY` (Vercel environment variable)
- `VITE_DATABASE_URL` (Neon DB connection string)
- `VITE_AHAMOVE_TOKEN` (AhaMove API token)

**Important:** Never commit `.env` files to version control.

### 5. SQL Injection Prevention

All database queries use parameterized queries:

```typescript
// ✅ Safe - parameterized query
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ Unsafe - string concatenation (never do this)
await pool.query(`SELECT * FROM users WHERE id = '${userId}'`);
```

---

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** open a public GitHub issue
2. Contact the maintainer directly
3. Allow time for a fix before public disclosure

---

## Dependency Update Checklist

When updating dependencies, always:

1. Run `npm audit` before and after
2. Test the application thoroughly
3. Check for breaking changes in major version updates
4. Update this document with any new findings
