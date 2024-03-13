/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  moduleFileExtensions: ["js", "json", "ts"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
};
export default config;
