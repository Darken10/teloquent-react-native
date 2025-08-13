// Mock pour react-native-sqlite-storage
const mockDb = {
  transaction: jest.fn(() => Promise.resolve()),
  executeSql: jest.fn(() => Promise.resolve([{ rows: { raw: () => [], item: () => ({}) } }])),
  close: jest.fn(() => Promise.resolve())
};

const SQLite = {
  openDatabase: jest.fn(() => Promise.resolve(mockDb)),
  enablePromise: jest.fn(),
  DEBUG: false,
  RESULTS: {
    OK: 0
  },
  TRANSACTION: {
    DEFERRED: 0
  }
};

module.exports = SQLite;
