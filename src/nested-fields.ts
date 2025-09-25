/**
 * Optimized nested field access utilities
 * Combines the best performance with edge case handling
 */

type PathKey = string | number;

/**
 * Parses a dot-notation path string into an array of keys,
 * handling array indices in bracket notation.
 * E.g., "user.address.street" -> ["user", "address", "street"]
 * E.g., "items[0].product.id" -> ["items", 0, "product", "id"]
 */
export function parsePath(path: string): PathKey[] {
  const result: PathKey[] = [];
  let current = '';
  let inBrackets = false;

  for (let i = 0; i < path.length; i++) {
    const char = path[i];

    if (char === '[') {
      if (current) {
        result.push(current);
      }
      current = '';
      inBrackets = true;
    } else if (char === ']') {
      if (inBrackets) {
        result.push(parseInt(current, 10));
        current = '';
        inBrackets = false;
      }
    } else if (char === '.') {
      if (current) {
        result.push(current);
      }
      current = '';
    } else {
      current += char;
    }
  }

  if (current) {
    result.push(current);
  }

  return result;
}

/**
 * Gets a nested value from an object using dot notation and array indexing.
 * Optimized for performance with minimal overhead.
 */
export function getNestedValue(obj: Record<string, any>, path: string): any {
  if (!path || !obj) return undefined;

  const keys = parsePath(path);
  let current: any = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    if (Array.isArray(current)) {
      // Handle array access
      if (typeof key === 'number' && key >= 0 && key < current.length) {
        current = current[key];
      } else {
        return undefined; // Invalid array index or non-numeric key for array
      }
    } else {
      // Handle object access
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        current = current[key];
      } else {
        return undefined; // Key not found
      }
    }
  }

  return current;
}

/**
 * Enhanced nested value access that handles keys with dots.
 * First tries nested access, then falls back to direct key access.
 * Use this only when you need to handle keys that contain dots.
 */
export function getNestedValueEnhanced(obj: Record<string, any>, path: string): any {
  if (!path || !obj) return undefined;

  // First try nested access (optimized path)
  const nestedResult = getNestedValue(obj, path);
  if (nestedResult !== undefined) {
    return nestedResult;
  }

  // Fallback: try direct key access for keys with dots
  if (path.includes('.')) {
    return obj[path];
  }

  return undefined;
}

/**
 * Checks if a nested value exists in an object using dot notation.
 */
export function hasNestedValue(obj: Record<string, any>, path: string): boolean {
  return getNestedValue(obj, path) !== undefined;
}

/**
 * Extracts multiple nested values at once.
 */
export function extractNestedValues(
  obj: Record<string, any>,
  paths: string[]
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const path of paths) {
    const value = getNestedValue(obj, path);
    if (value !== undefined) {
      result[path] = value;
    }
  }

  return result;
}

/**
 * Flattens a nested object into a single-level object with dot-notation keys.
 */
export function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Gets all possible nested paths from an object.
 */
export function getAllNestedPaths(obj: Record<string, any>, prefix = ''): string[] {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    paths.push(currentPath);

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      paths.push(...getAllNestedPaths(value, currentPath));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === 'object') {
          paths.push(...getAllNestedPaths(item, `${currentPath}[${index}]`));
        } else {
          paths.push(`${currentPath}[${index}]`);
        }
      });
    }
  }

  return paths;
}
