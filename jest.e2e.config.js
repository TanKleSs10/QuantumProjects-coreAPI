module.exports = {
  preset: "ts-jest",
  testEnvironment: "<rootDir>/src/test/jest/NoLocalStorageEnvironment.ts",
  transform: { "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: { "^@src/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["<rootDir>/src/test/e2e/**/*.test.ts"],
};
