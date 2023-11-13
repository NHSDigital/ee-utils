import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

export const createCleanDatabase = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  global.__MONGO_INSTANCE = mongod;
  await cleanDatabase(uri);
  process.env.MONGODB_URI = uri;
};

export const cleanDatabase = async (uri) => {
  if (uri.includes("mongodb://127.0.0.1")) {
    await mongoose.connect(uri);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  } else {
    throw new Error("Not a test database");
  }
};

export const stopDatabase = async () => {
  const mongod = global.__MONGO_INSTANCE;
  await mongod.stop();
};
