/* eslint-disable no-restricted-syntax */
export type CacheType = 'permanent' | 'temporary';

interface CacheEntry {
  chunks: Float32Array<ArrayBuffer>;
  timestamp: number;
}

class TTSCache {
  private permanentCache = new Map<string, CacheEntry>();

  private temporaryCache = new Map<string, CacheEntry>();

  private readonly maxTemporarySize = 10;

  /**
   * Get cached Float32 audio chunks
   */
  get(text: string): Float32Array<ArrayBuffer> | null {
    const permanent = this.permanentCache.get(text);
    if (permanent) return permanent.chunks;

    const temporary = this.temporaryCache.get(text);
    if (temporary) return temporary.chunks;

    return null;
  }

  /**
   * Store Float32 audio chunks
   */
  set(
    text: string,
    chunks: Float32Array<ArrayBuffer>,
    cacheType: CacheType,
  ): void {
    const entry: CacheEntry = {
      chunks,
      timestamp: Date.now(),
    };

    if (cacheType === 'permanent') {
      this.permanentCache.set(text, entry);
    } else {
      this.addToTemporaryCache(text, entry);
    }
  }

  /**
   * LRU logic for temporary cache
   */
  private addToTemporaryCache(text: string, entry: CacheEntry): void {
    if (this.temporaryCache.has(text)) {
      this.temporaryCache.set(text, entry);
      return;
    }

    if (this.temporaryCache.size >= this.maxTemporarySize) {
      const oldestKey = this.getOldestTemporaryCacheKey();
      if (oldestKey) {
        this.temporaryCache.delete(oldestKey);
      }
    }

    this.temporaryCache.set(text, entry);
  }

  /**
   * Find oldest temp cache entry
   */
  private getOldestTemporaryCacheKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.temporaryCache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Check existence
   */
  has(text: string): boolean {
    return this.permanentCache.has(text) || this.temporaryCache.has(text);
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.permanentCache.clear();
    this.temporaryCache.clear();
  }

  /**
   * Clear only temporary cache
   */
  clearTemporary(): void {
    this.temporaryCache.clear();
  }

  /**
   * Debug stats
   */
  getStats(): {
    permanentSize: number;
    temporarySize: number;
    temporaryMaxSize: number;
  } {
    return {
      permanentSize: this.permanentCache.size,
      temporarySize: this.temporaryCache.size,
      temporaryMaxSize: this.maxTemporarySize,
    };
  }
}

export const ttsCache = new TTSCache();
