import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

export const createCleanDatabase = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  (global as any).__MONGO_INSTANCE = mongod;
  await cleanDatabase(uri);
  process.env.MONGODB_URI = uri;
};

export const cleanDatabase = async (uri: string) => {
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};

export const stopDatabase = async () => {
  const mongod = (global as any).__MONGO_INSTANCE;
  await mongod.stop();
};
