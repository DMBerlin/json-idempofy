# json-idempofy Usage Guide

## Quick Start

```bash
pnpm add json-idempofy
```

```javascript
import { Idempofy } from 'json-idempofy';

// Basic usage
const payload = { userId: 123, amount: 100, currency: 'USD' };
const fingerprint = Idempofy.strict(payload);
console.log(fingerprint); // SHA-256 hash
```

## Strategies Overview

### 1. Strict Strategy (Default)

Full payload normalization with SHA-256 hashing.

```javascript
const fingerprint = Idempofy.strict(payload);
// or
const fingerprint = Idempofy.this(payload, { strategy: 'strict' });
```

**Use when:** You need complete payload integrity checking.

### 2. Selective Strategy

Only include specified fields in the fingerprint.

```javascript
const fingerprint = Idempofy.selective(payload, ['userId', 'amount']);
// or
const fingerprint = Idempofy.this(payload, {
  strategy: 'selective',
  fields: ['userId', 'amount'],
});
```

**Use when:** You want to ignore certain fields (like timestamps, metadata).

### 3. Semantic Strategy

Smart normalization for business logic.

```javascript
const fingerprint = Idempofy.semantic(payload);
// or
const fingerprint = Idempofy.this(payload, {
  strategy: 'semantic',
  options: {
    normalizeDates: true,
    precision: 2,
    excludeNulls: true,
  },
});
```

**Use when:** You need intelligent handling of dates, numbers, and edge cases.

### 4. Custom Strategy

Full control with field transformations.

```javascript
const fingerprint = Idempofy.custom(payload, ['email', 'name'], {
  email: { $lower: 'email' },
  name: { $trim: 'name' },
});
// or
const fingerprint = Idempofy.this(payload, {
  strategy: 'custom',
  fields: ['email', 'name'],
  transformations: {
    email: { $lower: 'email' },
    name: { $trim: 'name' },
  },
});
```

**Use when:** You need complex field transformations.

## Field Transformations

### Available Operators

```javascript
// String transformations
{ $lower: 'fieldName' }        // Convert to lowercase
{ $upper: 'fieldName' }        // Convert to uppercase
{ $trim: 'fieldName' }         // Trim whitespace
{ $replace: { from: 'old', to: 'new' } } // String replacement

// Number transformations
{ $round: 2 }                  // Round to N decimal places

// Date transformations
{ $date: 'fieldName' }         // Convert to ISO date string

// Conditional logic
{ $if: { condition: 'field', then: 'value', else: 'default' } }
{ $exists: 'fieldName' }       // Check if field exists
{ $default: 'value' }          // Default value if null/undefined
```

### Example Transformations

```javascript
const transformations = {
  // Normalize email
  email: { $lower: 'email' },

  // Clean name
  name: { $trim: 'name' },

  // Round currency
  amount: { $round: 2 },

  // Convert date
  date: { $date: 'timestamp' },

  // Conditional discount
  discount: {
    $if: {
      condition: 'type',
      then: 'discount',
      else: '0',
    },
  },

  // Default status
  status: { $default: 'pending' },
};
```

## Normalization Options

```javascript
const options = {
  normalizeDates: true, // Convert dates to ISO strings
  precision: 2, // Round numbers to N decimal places
  excludeNulls: true, // Remove null/undefined values
  excludeEmptyStrings: true, // Remove empty strings
  sortKeys: true, // Sort object keys
  trimStrings: true, // Remove whitespace
  caseSensitive: false, // Case-insensitive string comparison
};
```

## Advanced Usage

### Compare Payloads

```javascript
const payload1 = { userId: 123, amount: 100, city: 'New York' };
const payload2 = { userId: 123, amount: 100, city: 'Boston' };

// Check if they would produce the same fingerprint
const isSame = Idempofy.compare(payload1, payload2, {
  strategy: 'selective',
  fields: ['userId', 'amount'],
});
// Returns: true (ignoring city)
```

### Detailed Results

```javascript
const result = Idempofy.detailed(payload, config);
console.log(result.fingerprint); // The hash
console.log(result.strategy); // Strategy used
console.log(result.includedFields); // Fields included
console.log(result.warnings); // Any warnings
```

### Collision Risk Assessment

```javascript
const result = Idempofy.detailed(payload);
const risk = Idempofy.getCollisionRisk(result.fingerprint);
// Returns: 'low' | 'medium' | 'high'
```

## Common Patterns

### API Request Idempotency

```javascript
// Ensure the same API request doesn't get processed twice
const requestFingerprint = Idempofy.selective(request, [
  'userId',
  'amount',
  'currency',
  'timestamp',
]);

// Store in database to check for duplicates
await checkDuplicateRequest(requestFingerprint);
```

### Payment Processing

```javascript
// Create idempotency key for payments
const paymentFingerprint = Idempofy.custom(payment, ['userId', 'amount'], {
  amount: { $round: 2 }, // Round to cents
  userId: { $toString: 'userId' }, // Ensure string format
});
```

### Data Synchronization

```javascript
// Sync data between systems
const syncFingerprint = Idempofy.semantic(data, {
  normalizeDates: true,
  excludeNulls: true,
  sortKeys: true,
});
```

## Best Practices

1. **Choose the right strategy** for your use case
2. **Use selective strategy** when you want to ignore certain fields
3. **Use semantic strategy** for business logic with smart normalization
4. **Use custom strategy** when you need complex transformations
5. **Always test** your fingerprinting logic with real data
6. **Consider collision risk** for high-volume applications
7. **Document your strategy** for team consistency

## Error Handling

```javascript
try {
  const fingerprint = Idempofy.this(payload, config);
} catch (error) {
  if (error.message.includes('Unknown strategy')) {
    // Handle invalid strategy
  } else if (error.message.includes('requires fields')) {
    // Handle missing required fields
  }
}
```

## Performance Considerations

- **Strict strategy** is fastest for simple payloads
- **Selective strategy** is fastest for large payloads with few fields
- **Semantic strategy** has overhead for smart normalization
- **Custom strategy** has overhead for transformations

Choose the strategy that best fits your performance requirements.
