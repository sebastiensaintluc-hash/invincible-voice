import { ttsCache } from '../../utils/ttsCache';
import { fetchTTSAudio, playTTSAudio } from '../../utils/ttsUtil';

// Mock global fetch
global.fetch = jest.fn();

// Mock global Audio
const mockAudio = {
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

global.Audio = jest.fn().mockImplementation(() => mockAudio);

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('TTS Utility', () => {
  beforeEach(() => {
    ttsCache.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    ttsCache.clear();
  });

  describe('fetchTTSAudio', () => {
    test('should fetch from backend when not in cache', async () => {
      const mockBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const mockResponse = {
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await fetchTTSAudio({
        text: 'Hello world',
        cacheType: 'temporary',
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Hello world' }),
      });

      expect(result).toBe(mockBlob);
    });

    test('should return from cache when available', async () => {
      const cachedBlob = new Blob(['cached audio'], { type: 'audio/wav' });
      ttsCache.set('Hello world', cachedBlob, 'temporary');

      const result = await fetchTTSAudio({
        text: 'Hello world',
        cacheType: 'temporary',
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toBe(cachedBlob);
    });

    test('should throw error on failed fetch', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(
        fetchTTSAudio({
          text: 'Hello world',
          cacheType: 'temporary',
        }),
      ).rejects.toThrow('TTS request failed: 500 Internal Server Error');
    });

    test('should cache fetched audio', async () => {
      const mockBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const mockResponse = {
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await fetchTTSAudio({
        text: 'Hello world',
        cacheType: 'permanent',
      });

      expect(ttsCache.has('Hello world')).toBe(true);
      expect(ttsCache.get('Hello world')).toBe(mockBlob);
    });
  });

  describe('playTTSAudio', () => {
    test('should play audio after fetching', async () => {
      const mockBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const mockResponse = {
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await playTTSAudio({
        text: 'Hello world',
        cacheType: 'temporary',
      });

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(global.Audio).toHaveBeenCalledWith('blob:mock-url');
      expect(mockAudio.play).toHaveBeenCalled();
      expect(result).toBe(mockAudio);
    });

    test('should set up cleanup event listeners', async () => {
      const mockBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const mockResponse = {
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await playTTSAudio({
        text: 'Hello world',
        cacheType: 'temporary',
      });

      expect(mockAudio.addEventListener).toHaveBeenCalledWith(
        'ended',
        expect.any(Function),
      );
      expect(mockAudio.addEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
    });
  });
});
