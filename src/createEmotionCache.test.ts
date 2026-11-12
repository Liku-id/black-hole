import createEmotionCache from './createEmotionCache';

describe('createEmotionCache', () => {
  it('creates an emotion cache instance with key css', () => {
    const cache = createEmotionCache();
    expect(cache.key).toBe('css');
  });
});
