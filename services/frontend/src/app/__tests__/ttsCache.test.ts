import { ttsCache } from '../../utils/ttsCache';

describe('TTS Cache', () => {
  beforeEach(() => {
    ttsCache.clear();
  });

  afterEach(() => {
    ttsCache.clear();
  });

  test('should store and retrieve from permanent cache', () => {
    const testBlob = new Blob(['test audio'], { type: 'audio/wav' });
    const testText = 'Hello world';

    ttsCache.set(testText, testBlob, 'permanent');

    const retrievedBlob = ttsCache.get(testText);
    expect(retrievedBlob).toBe(testBlob);
    expect(ttsCache.has(testText)).toBe(true);
  });

  test('should store and retrieve from temporary cache', () => {
    const testBlob = new Blob(['test audio'], { type: 'audio/wav' });
    const testText = 'Hello world';

    ttsCache.set(testText, testBlob, 'temporary');

    const retrievedBlob = ttsCache.get(testText);
    expect(retrievedBlob).toBe(testBlob);
    expect(ttsCache.has(testText)).toBe(true);
  });

  test('should evict oldest entry when temporary cache exceeds max size', () => {
    const maxSize = 10;

    // Fill cache to capacity
    for (let i = 0; i < maxSize; i++) {
      const blob = new Blob([`test audio ${i}`], { type: 'audio/wav' });
      ttsCache.set(`text${i}`, blob, 'temporary');
    }

    // All entries should be present
    for (let i = 0; i < maxSize; i++) {
      expect(ttsCache.has(`text${i}`)).toBe(true);
    }

    // Add one more entry - should evict the oldest
    const newBlob = new Blob(['new test audio'], { type: 'audio/wav' });
    ttsCache.set('newText', newBlob, 'temporary');

    // First entry should be evicted
    expect(ttsCache.has('text0')).toBe(false);
    // New entry should be present
    expect(ttsCache.has('newText')).toBe(true);

    // Other entries should still be present
    for (let i = 1; i < maxSize; i++) {
      expect(ttsCache.has(`text${i}`)).toBe(true);
    }
  });

  test('should search in both permanent and temporary caches', () => {
    const permanentBlob = new Blob(['permanent audio'], { type: 'audio/wav' });
    const temporaryBlob = new Blob(['temporary audio'], { type: 'audio/wav' });

    ttsCache.set('permanent-text', permanentBlob, 'permanent');
    ttsCache.set('temporary-text', temporaryBlob, 'temporary');

    // Should find both
    expect(ttsCache.get('permanent-text')).toBe(permanentBlob);
    expect(ttsCache.get('temporary-text')).toBe(temporaryBlob);
  });

  test('should prefer permanent cache over temporary cache', () => {
    const permanentBlob = new Blob(['permanent audio'], { type: 'audio/wav' });
    const temporaryBlob = new Blob(['temporary audio'], { type: 'audio/wav' });

    const sameText = 'same text';

    // Add to both caches
    ttsCache.set(sameText, temporaryBlob, 'temporary');
    ttsCache.set(sameText, permanentBlob, 'permanent');

    // Should return permanent cache version
    expect(ttsCache.get(sameText)).toBe(permanentBlob);
  });

  test('should return correct cache statistics', () => {
    const stats = ttsCache.getStats();
    expect(stats.permanentSize).toBe(0);
    expect(stats.temporarySize).toBe(0);
    expect(stats.temporaryMaxSize).toBe(10);

    // Add entries
    ttsCache.set('perm1', new Blob(['p1']), 'permanent');
    ttsCache.set('perm2', new Blob(['p2']), 'permanent');
    ttsCache.set('temp1', new Blob(['t1']), 'temporary');

    const updatedStats = ttsCache.getStats();
    expect(updatedStats.permanentSize).toBe(2);
    expect(updatedStats.temporarySize).toBe(1);
    expect(updatedStats.temporaryMaxSize).toBe(10);
  });

  test('should return null for non-existent cache entries', () => {
    expect(ttsCache.get('non-existent')).toBeNull();
    expect(ttsCache.has('non-existent')).toBe(false);
  });

  test('should clear all caches', () => {
    ttsCache.set('perm', new Blob(['p']), 'permanent');
    ttsCache.set('temp', new Blob(['t']), 'temporary');

    expect(ttsCache.has('perm')).toBe(true);
    expect(ttsCache.has('temp')).toBe(true);

    ttsCache.clear();

    expect(ttsCache.has('perm')).toBe(false);
    expect(ttsCache.has('temp')).toBe(false);
    expect(ttsCache.getStats().permanentSize).toBe(0);
    expect(ttsCache.getStats().temporarySize).toBe(0);
  });

  test('should clear only temporary cache', () => {
    ttsCache.set('perm1', new Blob(['p1']), 'permanent');
    ttsCache.set('perm2', new Blob(['p2']), 'permanent');
    ttsCache.set('temp1', new Blob(['t1']), 'temporary');
    ttsCache.set('temp2', new Blob(['t2']), 'temporary');

    // All entries should be present
    expect(ttsCache.has('perm1')).toBe(true);
    expect(ttsCache.has('perm2')).toBe(true);
    expect(ttsCache.has('temp1')).toBe(true);
    expect(ttsCache.has('temp2')).toBe(true);

    ttsCache.clearTemporary();

    // Permanent entries should still be present
    expect(ttsCache.has('perm1')).toBe(true);
    expect(ttsCache.has('perm2')).toBe(true);
    // Temporary entries should be cleared
    expect(ttsCache.has('temp1')).toBe(false);
    expect(ttsCache.has('temp2')).toBe(false);

    // Check stats
    const stats = ttsCache.getStats();
    expect(stats.permanentSize).toBe(2);
    expect(stats.temporarySize).toBe(0);
  });
});
