/**
 * JSON Canonicalization Scheme (JCS) implementation
 * Based on RFC 8785: https://datatracker.ietf.org/doc/html/rfc8785
 *
 * JCS ensures deterministic JSON serialization by:
 * - Sorting object keys lexicographically
 * - Using consistent number representation
 * - Standardized string escaping
 * - No whitespace between tokens
 */

/**
 * Canonicalizes a JSON value according to JCS
 */
export function canonicalize(value: any): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return canonicalizeNumber(value);
  }

  if (typeof value === 'string') {
    return canonicalizeString(value);
  }

  if (Array.isArray(value)) {
    return canonicalizeArray(value);
  }

  if (typeof value === 'object') {
    return canonicalizeObject(value);
  }

  // Handle other types (functions, symbols, etc.)
  return 'null';
}

/**
 * Canonicalizes numbers according to JCS
 */
function canonicalizeNumber(num: number): string {
  if (!isFinite(num)) {
    if (isNaN(num)) return 'null';
    return 'null'; // Infinity and -Infinity become null in JCS
  }

  // Use JSON.stringify for consistent number representation
  return JSON.stringify(num);
}

/**
 * Canonicalizes strings according to JCS
 */
function canonicalizeString(str: string): string {
  // Use JSON.stringify for proper escaping
  return JSON.stringify(str);
}

/**
 * Canonicalizes arrays according to JCS
 */
function canonicalizeArray(arr: any[]): string {
  if (arr.length === 0) {
    return '[]';
  }

  const elements = arr.map(canonicalize);
  return '[' + elements.join(',') + ']';
}

/**
 * Canonicalizes objects according to JCS
 */
function canonicalizeObject(obj: Record<string, any>): string {
  const keys = Object.keys(obj);

  if (keys.length === 0) {
    return '{}';
  }

  // Sort keys lexicographically (JCS requirement)
  const sortedKeys = keys.sort();

  const pairs = sortedKeys.map((key) => {
    const value = canonicalize(obj[key]);
    return canonicalizeString(key) + ':' + value;
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Creates a JCS-compliant canonical string from any JSON value
 */
export function toJCSString(value: any): string {
  return canonicalize(value);
}

/**
 * Validates if a string is JCS-compliant
 */
export function isJCSCompliant(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    const canonicalized = toJCSString(parsed);
    return str === canonicalized;
  } catch {
    return false;
  }
}
