import { applyTransformation, extractFields } from '../transformations';
import { FieldTransformation, IdempotencyConfig } from '../types';

describe('transformations', () => {
  describe('applyTransformation', () => {
    const testPayload = {
      user: {
        id: 123,
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        age: 25.7,
        status: 'active',
        tags: ['premium', 'vip'],
        metadata: {
          created: new Date('2023-06-15T10:30:00Z'),
          lastLogin: '2023-06-15T10:30:00Z',
          score: 95.6789,
        },
      },
      items: [
        { id: 'item1', name: 'Laptop', price: 999.99 },
        { id: 'item2', name: 'Mouse', price: 29.99 },
      ],
      'special.key': 'special value',
      'nested.value': 'nested value',
    };

    describe('string transformation', () => {
      it('should return nested value for string transformation', () => {
        const result = applyTransformation(testPayload, 'user', 'user.name');
        expect(result).toBe('John Doe');
      });
    });

    describe('$date transformation', () => {
      it('should convert Date object to ISO string', () => {
        const transformation: FieldTransformation = { $date: 'user.metadata.created' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe('2023-06-15T10:30:00.000Z');
      });

      it('should convert date string to ISO string', () => {
        const transformation: FieldTransformation = { $date: 'user.metadata.lastLogin' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe('2023-06-15T10:30:00.000Z');
      });

      it('should return original value if not date', () => {
        const transformation: FieldTransformation = { $date: 'user.id' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe(123);
      });
    });

    describe('$round transformation', () => {
      it('should round number to specified decimal places', () => {
        const transformation: FieldTransformation = { $round: 2 };
        const result = applyTransformation(testPayload, 'user.metadata.score', transformation);
        expect(result).toBe(95.68);
      });

      it('should return original value if not number', () => {
        const transformation: FieldTransformation = { $round: 2 };
        const result = applyTransformation(testPayload, 'user.name', transformation);
        expect(result).toBe('John Doe');
      });
    });

    describe('$lower transformation', () => {
      it('should convert string to lowercase', () => {
        const transformation: FieldTransformation = { $lower: 'user.email' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe('john@example.com');
      });

      it('should return original value if not string', () => {
        const transformation: FieldTransformation = { $lower: 'user.id' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe(123);
      });
    });

    describe('$upper transformation', () => {
      it('should convert string to uppercase', () => {
        const transformation: FieldTransformation = { $upper: 'user.name' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe('JOHN DOE');
      });

      it('should return original value if not string', () => {
        const transformation: FieldTransformation = { $upper: 'user.id' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe(123);
      });
    });

    describe('$trim transformation', () => {
      it('should trim whitespace from string', () => {
        const payload = { name: '  John Doe  ' };
        const transformation: FieldTransformation = { $trim: 'name' };
        const result = applyTransformation(payload, 'name', transformation);
        expect(result).toBe('John Doe');
      });

      it('should return original value if not string', () => {
        const transformation: FieldTransformation = { $trim: 'user.id' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe(123);
      });
    });

    describe('$replace transformation', () => {
      it('should replace text in string', () => {
        const payload = { text: 'Hello World' };
        const transformation: FieldTransformation = {
          $replace: { from: 'World', to: 'Universe' },
        };
        const result = applyTransformation(payload, 'text', transformation);
        expect(result).toBe('Hello Universe');
      });

      it('should return original value if not string', () => {
        const transformation: FieldTransformation = {
          $replace: { from: 'test', to: 'replaced' },
        };
        const result = applyTransformation(testPayload, 'user.id', transformation);
        expect(result).toBe(123);
      });
    });

    describe('$if transformation', () => {
      it('should return then value when condition is truthy', () => {
        const transformation: FieldTransformation = {
          $if: {
            condition: 'user.status',
            then: 'user.name',
            else: 'user.id',
          },
        };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe('John Doe');
      });

      it('should return else value when condition is falsy', () => {
        const payload = { user: { status: null, name: 'John', id: 123 } };
        const transformation: FieldTransformation = {
          $if: {
            condition: 'user.status',
            then: 'user.name',
            else: 'user.id',
          },
        };
        const result = applyTransformation(payload, 'user', transformation);
        expect(result).toBe(123);
      });

      it('should return undefined when condition is falsy and no else', () => {
        const payload = { user: { status: null, name: 'John' } };
        const transformation: FieldTransformation = {
          $if: {
            condition: 'user.status',
            then: 'user.name',
          },
        };
        const result = applyTransformation(payload, 'user', transformation);
        expect(result).toBeUndefined();
      });
    });

    describe('$exists transformation', () => {
      it('should return true when value exists', () => {
        const transformation: FieldTransformation = { $exists: 'user.name' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe(true);
      });

      it('should return false when value does not exist', () => {
        const transformation: FieldTransformation = { $exists: 'user.nonexistent' };
        const result = applyTransformation(testPayload, 'user', transformation);
        expect(result).toBe(false);
      });

      it('should return false when value is null', () => {
        const payload = { user: { name: null } };
        const transformation: FieldTransformation = { $exists: 'user.name' };
        const result = applyTransformation(payload, 'user', transformation);
        expect(result).toBe(false);
      });
    });

    describe('$default transformation', () => {
      it('should return original value when it exists', () => {
        const transformation: FieldTransformation = { $default: 'default value' };
        const result = applyTransformation(testPayload, 'user.name', transformation);
        expect(result).toBe('John Doe');
      });

      it('should return default value when original is undefined', () => {
        const transformation: FieldTransformation = { $default: 'default value' };
        const result = applyTransformation(testPayload, 'user.nonexistent', transformation);
        expect(result).toBe('default value');
      });

      it('should return default value when original is null', () => {
        const payload = { user: { name: null } };
        const transformation: FieldTransformation = { $default: 'default value' };
        const result = applyTransformation(payload, 'user.name', transformation);
        expect(result).toBe('default value');
      });
    });

    describe('fallback behavior', () => {
      it('should return nested value when no transformation matches', () => {
        const result = applyTransformation(testPayload, 'user.name', {} as FieldTransformation);
        expect(result).toBe('John Doe');
      });
    });
  });

  describe('extractFields', () => {
    const testPayload = {
      user: {
        id: 123,
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        age: 25.7,
        status: 'active',
      },
      items: [{ id: 'item1', name: 'Laptop', price: 999.99 }],
    };

    it('should return full payload when no fields specified', () => {
      const config: IdempotencyConfig = {};
      const result = extractFields(testPayload, config);
      expect(result).toEqual(testPayload);
    });

    it('should extract specified fields without transformations', () => {
      const config: IdempotencyConfig = {
        fields: ['user.id', 'user.name', 'items[0].id'],
      };
      const result = extractFields(testPayload, config);
      expect(result).toEqual({
        'user.id': 123,
        'user.name': 'John Doe',
        'items[0].id': 'item1',
      });
    });

    it('should apply transformations when specified', () => {
      const config: IdempotencyConfig = {
        fields: ['user.email', 'user.age'],
        transformations: {
          'user.email': { $lower: 'user.email' },
          'user.age': { $round: 1 },
        },
      };
      const result = extractFields(testPayload, config);
      expect(result).toEqual({
        'user.email': 'john@example.com',
        'user.age': 25.7,
      });
    });

    it('should handle mixed fields with and without transformations', () => {
      const config: IdempotencyConfig = {
        fields: ['user.id', 'user.email', 'user.age'],
        transformations: {
          'user.email': { $lower: 'user.email' },
          'user.age': { $round: 0 },
        },
      };
      const result = extractFields(testPayload, config);
      expect(result).toEqual({
        'user.id': 123,
        'user.email': 'john@example.com',
        'user.age': 26,
      });
    });

    it('should handle empty fields array', () => {
      const config: IdempotencyConfig = {
        fields: [],
      };
      const result = extractFields(testPayload, config);
      expect(result).toEqual(testPayload);
    });
  });
});
