import {
  bundledConfig,
  isValidConfigDoc,
  loadCachedConfig,
  getInitialConfig,
  fetchLatestConfig,
} from '../configService';
import { CONFIG_LOCALSTORAGE_KEY } from '../../constants/ui';

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('isValidConfigDoc', () => {
  it('accepts the bundled snapshot', () => {
    expect(isValidConfigDoc(bundledConfig)).toBe(true);
  });

  it.each([null, {}, { version: 'x' }, { version: 2 }])('rejects %p', (doc) => {
    expect(isValidConfigDoc(doc)).toBe(false);
  });
});

describe('loadCachedConfig / getInitialConfig', () => {
  it('returns null with an empty cache and falls back to the bundled snapshot', () => {
    expect(loadCachedConfig()).toBeNull();
    expect(getInitialConfig()).toBe(bundledConfig);
  });

  it('ignores unparseable or invalid cache content', () => {
    localStorage.setItem(CONFIG_LOCALSTORAGE_KEY, 'not json');
    expect(loadCachedConfig()).toBeNull();

    localStorage.setItem(
      CONFIG_LOCALSTORAGE_KEY,
      JSON.stringify({ nope: true })
    );
    expect(getInitialConfig()).toBe(bundledConfig);
  });

  it('prefers a cached config only when its version is newer', () => {
    const newer = { ...bundledConfig, version: bundledConfig.version + 1 };
    localStorage.setItem(CONFIG_LOCALSTORAGE_KEY, JSON.stringify(newer));
    expect(getInitialConfig().version).toBe(bundledConfig.version + 1);

    const older = { ...bundledConfig, version: 0 };
    localStorage.setItem(CONFIG_LOCALSTORAGE_KEY, JSON.stringify(older));
    expect(getInitialConfig()).toBe(bundledConfig);
  });
});

describe('fetchLatestConfig', () => {
  it('resolves null when no API base URL is configured', async () => {
    // Test env has no VITE_API_BASE_URL
    expect(await fetchLatestConfig()).toBeNull();
  });
});
