import {
  estimateTokens,
  formatTokenCount,
  calculateTotalTokens,
} from '../../utils/tokenUtils';

describe('tokenUtils', () => {
  describe('estimateTokens', () => {
    it('should return 0 for empty text', () => {
      expect(estimateTokens('')).toBe(0);
      expect(estimateTokens('   ')).toBe(0);
    });

    it('should estimate tokens for simple text', () => {
      expect(estimateTokens('hello')).toBeGreaterThan(0);
      expect(estimateTokens('hello world')).toBeGreaterThan(
        estimateTokens('hello'),
      );
    });

    it('should handle multi-line text', () => {
      const multiline = 'Line one\nLine two\nLine three';
      expect(estimateTokens(multiline)).toBeGreaterThan(5);
    });

    it('should handle punctuation', () => {
      const withPunctuation = 'Hello, world! How are you?';
      expect(estimateTokens(withPunctuation)).toBeGreaterThan(5);
    });

    it('should handle non-ASCII characters', () => {
      const withUnicode = 'Hello 世界 🌍';
      expect(estimateTokens(withUnicode)).toBeGreaterThan(3);
    });
  });

  describe('formatTokenCount', () => {
    it('should format zero tokens', () => {
      expect(formatTokenCount(0)).toBe('0 tokens');
    });

    it('should format single token', () => {
      expect(formatTokenCount(1)).toBe('1 token');
    });

    it('should format small numbers', () => {
      expect(formatTokenCount(42)).toBe('42 tokens');
      expect(formatTokenCount(999)).toBe('999 tokens');
    });

    it('should format thousands with K suffix', () => {
      expect(formatTokenCount(1000)).toBe('1.0K tokens');
      expect(formatTokenCount(1500)).toBe('1.5K tokens');
      expect(formatTokenCount(9999)).toBe('10.0K tokens');
    });

    it('should format large numbers', () => {
      expect(formatTokenCount(10000)).toBe('10K tokens');
      expect(formatTokenCount(25000)).toBe('25K tokens');
    });
  });

  describe('calculateTotalTokens', () => {
    it('should calculate tokens for empty settings', () => {
      expect(calculateTotalTokens({ prompt: '' })).toBe(0);
      expect(calculateTotalTokens({ prompt: '', documents: [] })).toBe(0);
    });

    it('should calculate tokens for prompt only', () => {
      const result = calculateTotalTokens({ prompt: 'Hello world' });
      expect(result).toBeGreaterThan(0);
    });

    it('should calculate tokens for documents only', () => {
      const result = calculateTotalTokens({
        prompt: '',
        documents: [
          { content: 'Document one content' },
          { content: 'Document two content' },
        ],
      });
      expect(result).toBeGreaterThan(0);
    });

    it('should calculate total tokens for prompt and documents', () => {
      const prompt = 'System prompt here';
      const doc1 = 'First document content';
      const doc2 = 'Second document content';

      const total = calculateTotalTokens({
        prompt,
        documents: [{ content: doc1 }, { content: doc2 }],
      });

      const expected =
        estimateTokens(prompt) + estimateTokens(doc1) + estimateTokens(doc2);
      expect(total).toBe(expected);
    });

    it('should handle missing documents array', () => {
      const result = calculateTotalTokens({ prompt: 'Hello world' });
      expect(result).toBe(estimateTokens('Hello world'));
    });

    it('should handle documents with empty content', () => {
      const result = calculateTotalTokens({
        prompt: 'Hello',
        documents: [{ content: '' }, { content: 'world' }],
      });
      expect(result).toBe(estimateTokens('Hello') + estimateTokens('world'));
    });
  });
});
