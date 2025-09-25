import { IdempotencyConfig, FingerprintResult } from './types';
import { strictStrategy, selectiveStrategy, semanticStrategy, customStrategy } from './strategies';

/**
 * Main Idempofy class following the pattern of your existing packages
 */
export class Idempofy {
  /**
   * Main method to generate fingerprint from payload and configuration
   * Following the pattern: Idempofy.this(payload, config)
   */
  static this(payload: any, config: IdempotencyConfig = {}): FingerprintResult {
    const strategy = config.strategy || 'strict';

    switch (strategy) {
      case 'strict':
        return strictStrategy(payload, config);
      case 'selective':
        return selectiveStrategy(payload, config);
      case 'semantic':
        return semanticStrategy(payload, config);
      case 'custom':
        return customStrategy(payload, config);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  /**
   * Quick method for strict fingerprinting (full payload)
   */
  static strict(payload: any): string {
    return this.this(payload, { strategy: 'strict' }).fingerprint;
  }

  /**
   * Quick method for selective fingerprinting (specific fields)
   */
  static selective(payload: any, fields: string[]): string {
    return this.this(payload, { strategy: 'selective', fields }).fingerprint;
  }

  /**
   * Quick method for semantic fingerprinting (smart normalization)
   */
  static semantic(payload: any, options?: IdempotencyConfig['options']): string {
    return this.this(payload, {
      strategy: 'semantic',
      ...(options && { options }),
    }).fingerprint;
  }

  /**
   * Quick method for custom fingerprinting (with transformations)
   */
  static custom(payload: any, fields: string[], transformations?: Record<string, any>): string {
    return this.this(payload, {
      strategy: 'custom',
      fields,
      ...(transformations && { transformations }),
    }).fingerprint;
  }

  /**
   * Generate fingerprint with detailed result information
   */
  static detailed(payload: any, config: IdempotencyConfig = {}): FingerprintResult {
    return this.this(payload, config);
  }

  /**
   * Validate that two payloads would produce the same fingerprint
   */
  static compare(payload1: any, payload2: any, config: IdempotencyConfig = {}): boolean {
    const fingerprint1 = this.this(payload1, config).fingerprint;
    const fingerprint2 = this.this(payload2, config).fingerprint;
    return fingerprint1 === fingerprint2;
  }

  /**
   * Get collision probability estimate (very basic)
   */
  static getCollisionRisk(fingerprint: string): 'low' | 'medium' | 'high' {
    // SHA-256 produces 64-character hex strings
    // This is a very basic estimation
    if (fingerprint.length < 32) return 'high';
    if (fingerprint.length < 48) return 'medium';
    return 'low';
  }
}

// Export the main class as default
export default Idempofy;

// Export types for TypeScript users
export * from './types';

// Export JCS functions for advanced usage
export { canonicalize, toJCSString, isJCSCompliant } from './jcs';

// Export hashing functions for advanced usage
export { createHashWithConfig, generateSecretKey, validateHash, getCollisionRisk } from './hashing';

// Export nested field functions for advanced usage
export {
  getNestedValue,
  hasNestedValue,
  extractNestedValues,
  flattenObject,
  getAllNestedPaths,
  getNestedValueEnhanced,
  parsePath,
} from './nested-fields';
