module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/{contexts,components}/__tests__/**/*.test.tsx"],
  setupFiles: ["react-native-gesture-handler/jestSetup.js"],
  clearMocks: true,
  watchman: false,
};
