// Tests should never hit the network (checkForUpdate() calls this on mount).
global.fetch = jest.fn(() => Promise.reject(new Error('network disabled in tests')));

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((k) => Promise.resolve(store[k] ?? null)),
      setItem: jest.fn((k, v) => {
        store[k] = v;
        return Promise.resolve();
      }),
      removeItem: jest.fn((k) => {
        delete store[k];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
    },
  };
});

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: { saveAsset: jest.fn(() => Promise.resolve()) },
}));

// react-native-svg's unused LocalSvg/CSS path reaches for a package that
// doesn't exist in this RN version; nothing in the app renders SVG logos.
jest.mock(
  '@react-native/assets-registry/registry',
  () => ({ registerAsset: jest.fn(), getAssetByID: jest.fn() }),
  { virtual: true },
);

jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp',
  writeFile: jest.fn(() => Promise.resolve()),
}));
