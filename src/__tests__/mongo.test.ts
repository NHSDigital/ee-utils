import mongoose from "mongoose";
import { connectToDatabaseViaEnvVar, ILog } from "../mongodb/mongo";

import { Writable } from 'stream';
import winston from 'winston';

const fakeLogger = (): [ILog, string[]] => {
  let output: any[] = [];
  const stream = new Writable()
  stream._write = (chunk, encoding, next) => {
      output.push(chunk.toString());
      next()
  }

  const streamTransport = new winston.transports.Stream({ stream })
  const logger = winston.createLogger({ transports: [streamTransport]})
  return [logger, output];
};

const mongooseIsConnected = () => {
  return mongoose.connection.readyState === 1;
};

const ensureMongooseIsConnected = async () => {
  if (!mongooseIsConnected()) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

const ensureMongooseIsDisconnected = async () => {
  if (mongooseIsConnected()) {
    await mongoose.disconnect();
  }
}

describe("connectToDatabaseViaEnvVar", () => {
  let originalMongoDBUri:(string|undefined)= "";

  beforeAll(async () => {
    originalMongoDBUri = process.env.MONGODB_URI;
  });

  beforeEach(async () => {
    process.env.MONGODB_URI = originalMongoDBUri;
    await ensureMongooseIsDisconnected();
  });

  afterEach(async () => {
    process.env.MONGODB_URI = originalMongoDBUri;
    await ensureMongooseIsConnected();
  });

  it("should log an error when the environment variable is not set", async () => {
    const [logger, logOutput] = fakeLogger();

    delete process.env.MONGODB_URI;

    try {
      await connectToDatabaseViaEnvVar({ssl: false, tlsCAFile: "", serverSelectionTimeoutMS: 0}, logger);
    } catch (error: any) {
      expect(error.message).toEqual("MONGODB_URI environment variable not set");
    }

    const errorLog = logOutput.find((log) => log.includes("ENGEXPUTILS006"))!;
    expect(JSON.parse(errorLog)["error"]).toEqual("MONGODB_URI environment variable not set");
  });

  it("should connect to the mongoose database when the URI is set", async () => {
    const [logger, logOutput] = fakeLogger();

    await connectToDatabaseViaEnvVar({ssl: false, tlsCAFile: "", serverSelectionTimeoutMS: 100}, logger);

    const errorLog = logOutput.find((log) => log.includes("ENGEXPUTILS007"))!;
    expect(JSON.parse(errorLog)["database"]).toEqual(process.env.MONGODB_URI);
  });

  it("should log an error if the connection to the database fails", async () => {
    const [logger, logOutput] = fakeLogger();

    process.env.MONGODB_URI = "mongodb://127.0.0.1:6666";
    try {
      await connectToDatabaseViaEnvVar({ssl: false, tlsCAFile: "", serverSelectionTimeoutMS: 100}, logger);
    } catch (error: any) {
      expect(error["message"]).toEqual("connect ECONNREFUSED 127.0.0.1:6666");
    }

    const errorLog = logOutput.find((log) => log.includes("ENGEXPUTILS008"))!;
    expect(JSON.parse(errorLog)["error"]).toEqual("MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:6666");
  });
});
