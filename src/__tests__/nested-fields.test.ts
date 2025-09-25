import {
  getNestedValue,
  hasNestedValue,
  extractNestedValues,
  flattenObject,
  getAllNestedPaths,
  getNestedValueEnhanced,
} from '../nested-fields';

describe('Nested Fields', () => {
  const testObj = {
    user: {
      id: 123,
      name: 'John Doe',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
      },
    },
    items: [
      { id: 1, name: 'Item 1', price: 10.99 },
      { id: 2, name: 'Item 2', price: 20.99 },
    ],
    metadata: {
      tags: ['urgent', 'important'],
      created: '2023-01-01T00:00:00Z',
    },
  };

  describe('getNestedValue', () => {
    it('should get simple nested values', () => {
      expect(getNestedValue(testObj, 'user.name')).toBe('John Doe');
      expect(getNestedValue(testObj, 'user.id')).toBe(123);
      expect(getNestedValue(testObj, 'user.email')).toBe('john@example.com');
    });

    it('should get deeply nested values', () => {
      expect(getNestedValue(testObj, 'user.address.street')).toBe('123 Main St');
      expect(getNestedValue(testObj, 'user.address.city')).toBe('New York');
      expect(getNestedValue(testObj, 'user.address.country')).toBe('USA');
    });

    it('should get array values with index notation', () => {
      expect(getNestedValue(testObj, 'items[0].id')).toBe(1);
      expect(getNestedValue(testObj, 'items[0].name')).toBe('Item 1');
      expect(getNestedValue(testObj, 'items[0].price')).toBe(10.99);
      expect(getNestedValue(testObj, 'items[1].id')).toBe(2);
      expect(getNestedValue(testObj, 'items[1].name')).toBe('Item 2');
    });

    it('should get array values with dot notation', () => {
      expect(getNestedValue(testObj, 'metadata.tags[0]')).toBe('urgent');
      expect(getNestedValue(testObj, 'metadata.tags[1]')).toBe('important');
    });

    it('should return undefined for non-existent paths', () => {
      expect(getNestedValue(testObj, 'user.nonexistent')).toBeUndefined();
      expect(getNestedValue(testObj, 'items[5].id')).toBeUndefined();
      expect(getNestedValue(testObj, 'metadata.tags[10]')).toBeUndefined();
    });

    it('should handle null and undefined values', () => {
      const objWithNull = { user: null, items: undefined };
      expect(getNestedValue(objWithNull, 'user.name')).toBeUndefined();
      expect(getNestedValue(objWithNull, 'items[0].id')).toBeUndefined();
    });
  });

  describe('hasNestedValue', () => {
    it('should return true for existing paths', () => {
      expect(hasNestedValue(testObj, 'user.name')).toBe(true);
      expect(hasNestedValue(testObj, 'user.address.street')).toBe(true);
      expect(hasNestedValue(testObj, 'items[0].id')).toBe(true);
      expect(hasNestedValue(testObj, 'metadata.tags[0]')).toBe(true);
    });

    it('should return false for non-existent paths', () => {
      expect(hasNestedValue(testObj, 'user.nonexistent')).toBe(false);
      expect(hasNestedValue(testObj, 'items[5].id')).toBe(false);
      expect(hasNestedValue(testObj, 'metadata.tags[10]')).toBe(false);
    });
  });

  // setNestedValue function removed for simplicity

  describe('extractNestedValues', () => {
    it('should extract multiple nested values', () => {
      const paths = ['user.name', 'user.id', 'items[0].id', 'metadata.tags[0]'];
      const result = extractNestedValues(testObj, paths);

      expect(result).toEqual({
        'user.name': 'John Doe',
        'user.id': 123,
        'items[0].id': 1,
        'metadata.tags[0]': 'urgent',
      });
    });

    it('should handle non-existent paths gracefully', () => {
      const paths = ['user.name', 'user.nonexistent', 'items[5].id'];
      const result = extractNestedValues(testObj, paths);

      expect(result).toEqual({
        'user.name': 'John Doe',
      });
    });
  });

  describe('flattenObject', () => {
    it('should flatten nested objects', () => {
      const flattened = flattenObject(testObj);

      expect(flattened['user.id']).toBe(123);
      expect(flattened['user.name']).toBe('John Doe');
      expect(flattened['user.address.street']).toBe('123 Main St');
      expect(flattened['user.address.city']).toBe('New York');
    });

    it('should handle arrays correctly', () => {
      const flattened = flattenObject(testObj);

      // Arrays should not be flattened, but their contents should be
      expect(flattened['items']).toEqual(testObj.items);
      expect(flattened['metadata.tags']).toEqual(testObj.metadata.tags);
    });
  });

  describe('getAllNestedPaths', () => {
    it('should get all possible nested paths', () => {
      const paths = getAllNestedPaths(testObj);

      expect(paths).toContain('user');
      expect(paths).toContain('user.id');
      expect(paths).toContain('user.name');
      expect(paths).toContain('user.address');
      expect(paths).toContain('user.address.street');
      expect(paths).toContain('items');
      expect(paths).toContain('metadata');
      expect(paths).toContain('metadata.tags');
    });
  });

  describe('complex nested scenarios', () => {
    const complexObj = {
      orders: [
        {
          id: 1,
          customer: {
            id: 123,
            name: 'John Doe',
            preferences: {
              theme: 'dark',
              notifications: true,
            },
          },
          items: [
            { product: { id: 'P1', name: 'Product 1' }, quantity: 2 },
            { product: { id: 'P2', name: 'Product 2' }, quantity: 1 },
          ],
        },
      ],
    };

    it('should handle complex nested structures', () => {
      expect(getNestedValue(complexObj, 'orders[0].customer.name')).toBe('John Doe');
      expect(getNestedValue(complexObj, 'orders[0].customer.preferences.theme')).toBe('dark');
      expect(getNestedValue(complexObj, 'orders[0].items[0].product.id')).toBe('P1');
      expect(getNestedValue(complexObj, 'orders[0].items[1].product.name')).toBe('Product 2');
    });

    it('should extract complex nested values', () => {
      const paths = [
        'orders[0].customer.name',
        'orders[0].customer.preferences.theme',
        'orders[0].items[0].product.id',
        'orders[0].items[1].quantity',
      ];

      const result = extractNestedValues(complexObj, paths);

      expect(result).toEqual({
        'orders[0].customer.name': 'John Doe',
        'orders[0].customer.preferences.theme': 'dark',
        'orders[0].items[0].product.id': 'P1',
        'orders[0].items[1].quantity': 1,
      });
    });
  });

  describe('getNestedValueEnhanced', () => {
    it('should handle keys with dots as direct keys', () => {
      const obj = { 'key.with.dots': 'direct value' };
      const result = getNestedValueEnhanced(obj, 'key.with.dots');
      expect(result).toBe('direct value');
    });

    it('should fallback to direct key access when nested access fails', () => {
      const obj = { 'special.key': 'special value' };
      const result = getNestedValueEnhanced(obj, 'special.key');
      expect(result).toBe('special value');
    });

    it('should return undefined for non-existent paths', () => {
      const obj = { user: { name: 'John' } };
      const result = getNestedValueEnhanced(obj, 'user.nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('edge cases for getNestedValue', () => {
    it('should return undefined when accessing property on null', () => {
      const obj = { user: null };
      const result = getNestedValue(obj, 'user.name');
      expect(result).toBeUndefined();
    });

    it('should return undefined when accessing property on undefined', () => {
      const obj = { user: undefined };
      const result = getNestedValue(obj, 'user.name');
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-object intermediate values', () => {
      const obj = { user: 'not-an-object' };
      const result = getNestedValue(obj, 'user.name');
      expect(result).toBeUndefined();
    });
  });
});
