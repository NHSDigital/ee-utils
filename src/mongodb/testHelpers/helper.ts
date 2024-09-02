import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

export const createCleanDatabase = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await cleanDatabase(uri);
  return { uri, mongod };
};

export const connectToDatabase = async (uri: string) => {
  await mongoose.connect(uri);
};

export const cleanDatabase = async (uri: string) => {
  if (uri.includes("mongodb://127.0.0.1")) {
    await mongoose.connect(uri);
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  } else {
    throw new Error("Not a test database");
  }
};
