// Mock pour expo-sqlite
const mockDb = {
  transaction: jest.fn((callback) => {
    callback({
      executeSql: jest.fn((query, params, success) => {
        success({}, { rows: { _array: [] }, rowsAffected: 1 });
      })
    });
    return Promise.resolve();
  })
};

const openDatabase = jest.fn().mockReturnValue(mockDb);

module.exports = {
  openDatabase
};
