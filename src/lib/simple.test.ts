import { describe, it, expect } from 'vitest';

// Simple utility functions to test
function addNumbers(a: number, b: number): number {
  return a + b;
}

function isValidEmail(email: string): boolean {
  const atIndex = email.indexOf('@');
  const dotIndex = email.lastIndexOf('.');
  return atIndex > 0 && dotIndex > atIndex && dotIndex < email.length - 1;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function capitalizeWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function filterArray<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  return arr.filter(predicate);
}

// Tests
describe('Simple utility functions', () => {
  describe('addNumbers', () => {
    it('should add two positive numbers', () => {
      expect(addNumbers(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(addNumbers(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(addNumbers(0, 5)).toBe(5);
      expect(addNumbers(5, 0)).toBe(5);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.za')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers as currency', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle decimal places correctly', () => {
      expect(formatCurrency(123.456)).toBe('$123.46');
      expect(formatCurrency(123.454)).toBe('$123.45');
    });
  });

  describe('capitalizeWord', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeWord('hello')).toBe('Hello');
      expect(capitalizeWord('WORLD')).toBe('World');
      expect(capitalizeWord('tEsT')).toBe('Test');
    });

    it('should handle edge cases', () => {
      expect(capitalizeWord('')).toBe('');
      expect(capitalizeWord('a')).toBe('A');
    });
  });

  describe('filterArray', () => {
    it('should filter numbers', () => {
      const numbers = [1, 2, 3, 4, 5];
      const evens = filterArray(numbers, n => n % 2 === 0);
      expect(evens).toEqual([2, 4]);
    });

    it('should filter strings', () => {
      const words = ['apple', 'banana', 'cherry'];
      const longWords = filterArray(words, w => w.length > 5);
      expect(longWords).toEqual(['banana', 'cherry']);
    });

    it('should handle empty arrays', () => {
      const result = filterArray([], () => true);
      expect(result).toEqual([]);
    });
  });
});
