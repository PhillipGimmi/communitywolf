import { describe, it, expect } from 'vitest';

// String utility functions for testing
function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function removeDuplicates(arr: string[]): string[] {
  return [...new Set(arr)];
}

function isAnagram(str1: string, str2: string): boolean {
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z]/g, '').split('').sort((a, b) => a.localeCompare(b)).join('');
  return normalize(str1) === normalize(str2);
}

function findLongestWord(text: string): string {
  const words = text.split(/\s+/);
  return words.reduce((longest, current) => 
    current.length > longest.length ? current : longest, '');
}

describe('String utility functions', () => {
  describe('reverseString', () => {
    it('should reverse string correctly', () => {
      expect(reverseString('hello')).toBe('olleh');
      expect(reverseString('world')).toBe('dlrow');
    });

    it('should handle empty string', () => {
      expect(reverseString('')).toBe('');
    });

    it('should handle single character', () => {
      expect(reverseString('a')).toBe('a');
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('one two three')).toBe(3);
    });

    it('should handle empty string', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
    });

    it('should handle single word', () => {
      expect(countWords('hello')).toBe(1);
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('WORLD')).toBe('World');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalizeFirst('a')).toBe('A');
    });
  });

  describe('removeDuplicates', () => {
    it('should remove duplicate strings', () => {
      expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(removeDuplicates(['hello', 'world', 'hello'])).toEqual(['hello', 'world']);
    });

    it('should handle empty array', () => {
      expect(removeDuplicates([])).toEqual([]);
    });

    it('should handle array with no duplicates', () => {
      expect(removeDuplicates(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('isAnagram', () => {
    it('should identify anagrams', () => {
      expect(isAnagram('listen', 'silent')).toBe(true);
      expect(isAnagram('debit card', 'bad credit')).toBe(true);
    });

    it('should reject non-anagrams', () => {
      expect(isAnagram('hello', 'world')).toBe(false);
      expect(isAnagram('test', 'testing')).toBe(false);
    });

    it('should handle case insensitive', () => {
      expect(isAnagram('Listen', 'SILENT')).toBe(true);
    });
  });

  describe('findLongestWord', () => {
    it('should find longest word', () => {
      expect(findLongestWord('hello world testing')).toBe('testing');
      expect(findLongestWord('a bb ccc')).toBe('ccc');
    });

    it('should handle empty string', () => {
      expect(findLongestWord('')).toBe('');
    });

    it('should handle single word', () => {
      expect(findLongestWord('hello')).toBe('hello');
    });
  });
});
