import { createHash, createHmac, randomBytes } from 'crypto';

/**
 * Hashing algorithms supported by json-idempofy
 */
export type HashingAlgorithm = 'sha256' | 'sha512' | 'hmac-sha256' | 'hmac-sha512';

/**
 * Hashing configuration
 */
export interface HashingConfig {
  /** Hashing algorithm to use */
  algorithm?: HashingAlgorithm;

  /** Secret key for HMAC (required for HMAC algorithms) */
  secretKey?: string;

  /** Key ID for key rotation (optional) */
  keyId?: string;

  /** Generate a random key if none provided (for HMAC) */
  generateKey?: boolean;
}

/**
 * Default hashing configuration
 */
const DEFAULT_HASHING_CONFIG: Required<HashingConfig> = {
  algorithm: 'sha256',
  secretKey: '',
  keyId: 'default',
  generateKey: false,
};

/**
 * Generates a secure random key for HMAC
 */
export function generateSecretKey(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Creates a hash using the specified algorithm and configuration
 */
export function createHashWithConfig(
  data: string,
  config: HashingConfig = {}
): { hash: string; keyId?: string; algorithm: string } {
  const finalConfig = { ...DEFAULT_HASHING_CONFIG, ...config };

  // Generate key if requested and none provided
  if (finalConfig.generateKey && !finalConfig.secretKey) {
    finalConfig.secretKey = generateSecretKey();
  }

  let hash: string;
  let algorithm: string;

  switch (finalConfig.algorithm) {
    case 'sha256':
      hash = createHash('sha256').update(data).digest('hex');
      algorithm = 'sha256';
      break;

    case 'sha512':
      hash = createHash('sha512').update(data).digest('hex');
      algorithm = 'sha512';
      break;

    case 'hmac-sha256':
      if (!finalConfig.secretKey) {
        throw new Error('Secret key is required for HMAC-SHA256');
      }
      hash = createHmac('sha256', finalConfig.secretKey).update(data).digest('hex');
      algorithm = 'hmac-sha256';
      break;

    case 'hmac-sha512':
      if (!finalConfig.secretKey) {
        throw new Error('Secret key is required for HMAC-SHA512');
      }
      hash = createHmac('sha512', finalConfig.secretKey).update(data).digest('hex');
      algorithm = 'hmac-sha512';
      break;

    default:
      throw new Error(`Unsupported hashing algorithm: ${finalConfig.algorithm}`);
  }

  return {
    hash,
    keyId: finalConfig.keyId,
    algorithm,
  };
}

/**
 * Validates a hash using the same configuration
 */
export function validateHash(data: string, expectedHash: string, config: HashingConfig): boolean {
  try {
    const result = createHashWithConfig(data, config);
    return result.hash === expectedHash;
  } catch {
    return false;
  }
}

/**
 * Gets collision risk assessment for different algorithms
 */
export function getCollisionRisk(algorithm: HashingAlgorithm): 'low' | 'medium' | 'high' {
  switch (algorithm) {
    case 'sha256':
    case 'hmac-sha256':
      return 'low';
    case 'sha512':
    case 'hmac-sha512':
      return 'low';
    default:
      return 'medium';
  }
}
