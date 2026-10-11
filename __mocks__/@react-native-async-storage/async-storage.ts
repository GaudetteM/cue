const storage = new Map<string, string>();

const mockAsyncStorage = {
  getItem: jest.fn((key: string) => Promise.resolve(storage.get(key) ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    storage.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    storage.clear();
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve([...storage.keys()])),
  multiGet: jest.fn((keys: string[]) =>
    Promise.resolve(
      keys.map(
        key => [key, storage.get(key) ?? null] as [string, string | null],
      ),
    ),
  ),
  multiSet: jest.fn((entries: [string, string][]) => {
    entries.forEach(([key, value]) => storage.set(key, value));
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach(key => storage.delete(key));
    return Promise.resolve();
  }),
};

export default mockAsyncStorage;
