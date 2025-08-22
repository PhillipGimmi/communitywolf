import { describe, it, expect } from 'vitest';

// Simple utility functions for testing
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function isPalindrome(str: string): boolean {
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanStr === cleanStr.split('').reverse().join('');
}

describe('Additional utility functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      expect(formatDate(date)).toBe('2023-12-25');
    });

    it('should handle different dates', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      expect(formatDate(date)).toBe('2024-01-01');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(50, 200)).toBe(25);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculatePercentage(33, 100)).toBe(33);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate valid phone numbers', () => {
      expect(validatePhoneNumber('1234567890')).toBe(true);
      expect(validatePhoneNumber('+1-234-567-8900')).toBe(true);
      expect(validatePhoneNumber('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('abc')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is a ...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('should handle exact length', () => {
      expect(truncateText('Exactly', 7)).toBe('Exactly');
    });
  });

  describe('isPalindrome', () => {
    it('should identify palindromes', () => {
      expect(isPalindrome('racecar')).toBe(true);
      expect(isPalindrome('A man a plan a canal Panama')).toBe(true);
      expect(isPalindrome('12321')).toBe(true);
    });

    it('should reject non-palindromes', () => {
      expect(isPalindrome('hello')).toBe(false);
      expect(isPalindrome('world')).toBe(false);
      expect(isPalindrome('12345')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isPalindrome('')).toBe(true);
      expect(isPalindrome('a')).toBe(true);
    });
  });
});
