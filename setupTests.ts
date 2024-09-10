import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { createCleanDatabase } from "./src/mongodb/testHelpers/helper";
beforeAll(async () => {
  const { uri, mongod } = await createCleanDatabase();
  process.env.MONGODB_URI = uri;
  // @ts-ignore
  global.__MONGOD__ = mongod;
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  vi.resetAllMocks();
  await mongoose.disconnect();
  // @ts-ignore
  await global.__MONGOD__.stop();
});
