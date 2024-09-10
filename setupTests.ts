import mongoose from "mongoose";
import { afterAll, beforeAll } from "vitest";
import { createCleanDatabase } from "./src/mongodb/testHelpers/helper";
beforeAll(async () => {
  const { uri, mongod } = await createCleanDatabase();
  process.env.MONGODB_URI = uri;
  // @ts-ignore
  global.__MONGOD__ = mongod;
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterAll(async () => {
  await mongoose.disconnect();
  // @ts-ignore
  await global.__MONGOD__.stop();
});
