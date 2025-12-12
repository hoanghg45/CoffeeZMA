/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing HTML content before rendering
 */

// List of allowed HTML tags for product descriptions
const ALLOWED_TAGS = [
    'p', 'br', 'strong', 'b', 'i', 'em', 'u', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a'
];

// List of allowed attributes
const ALLOWED_ATTRS = ['href', 'class', 'style', 'target', 'rel'];

// Dangerous patterns to remove
const DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload, onerror, etc.
    /vbscript:/gi,
    /data:/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /<input\b[^>]*>/gi,
    /<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi,
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /<base\b[^>]*>/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
];

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - The raw HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
    if (!html || typeof html !== 'string') {
        return '';
    }

    let sanitized = html;

    // Remove all dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
    }

    // Decode HTML entities that could be used for obfuscation
    sanitized = decodeHtmlEntities(sanitized);

    // Re-check after decoding
    for (const pattern of DANGEROUS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
    }

    // Strip dangerous attributes from remaining tags
    sanitized = sanitized.replace(/<(\w+)([^>]*)>/gi, (match, tagName, attrs) => {
        const tag = tagName.toLowerCase();

        // Remove disallowed tags entirely
        if (!ALLOWED_TAGS.includes(tag)) {
            return '';
        }

        // Filter attributes
        const cleanAttrs = attrs.replace(/(\w+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
            (attrMatch: string, attrName: string, attrValue: string) => {
                const attr = attrName.toLowerCase();

                // Only keep allowed attributes
                if (!ALLOWED_ATTRS.includes(attr)) {
                    return '';
                }

                // For href attributes, validate they don't contain javascript:
                if (attr === 'href') {
                    const cleanValue = attrValue.replace(/["']/g, '').toLowerCase().trim();
                    if (cleanValue.startsWith('javascript:') || cleanValue.startsWith('vbscript:')) {
                        return '';
                    }
                }

                return attrMatch;
            }
        );

        return `<${tag}${cleanAttrs}>`;
    });

    // Handle closing tags for disallowed elements
    sanitized = sanitized.replace(/<\/(\w+)>/gi, (match, tagName) => {
        return ALLOWED_TAGS.includes(tagName.toLowerCase()) ? match : '';
    });

    return sanitized;
};

/**
 * Decode common HTML entities used for obfuscation
 */
const decodeHtmlEntities = (html: string): string => {
    const entities: Record<string, string> = {
        '&#60;': '<',
        '&#62;': '>',
        '&#34;': '"',
        '&#39;': "'",
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': "'",
        '&amp;': '&',
    };

    let decoded = html;
    for (const [entity, char] of Object.entries(entities)) {
        decoded = decoded.replace(new RegExp(entity, 'gi'), char);
    }

    // Handle numeric entities (&#x3C; etc.)
    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );
    decoded = decoded.replace(/&#(\d+);/g, (_, dec) =>
        String.fromCharCode(parseInt(dec, 10))
    );

    return decoded;
};

/**
 * Escape HTML to plain text (for contexts where no HTML should be allowed)
 */
export const escapeHtml = (text: string | null | undefined): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export default sanitizeHtml;
