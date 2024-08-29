/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  // extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "json"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
};
