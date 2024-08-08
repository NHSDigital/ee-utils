import mongoose from "mongoose";
import { logReferences } from "../logReferences";
import { LambdaLogger } from "../logger";

const defaultLogger = new LambdaLogger("ee-utils/mongodb", logReferences);

export interface ILog {
  info: (message: string, args?: Record<string, any>) => void;
  error: (message: string, args?: Record<string, any>) => void;
}

export const connectToDatabaseViaEnvVar = async (
  options = {
    ssl: true,
    tlsCAFile: `${__dirname}/global-bundle.pem`,
    serverSelectionTimeoutMS: 5000,
  },
  logger: ILog = defaultLogger
): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.error("ENGEXPUTILS006", {
      error: "MONGODB_URI environment variable not set",
    });
    throw new Error("MONGODB_URI environment variable not set");
  }
  try {
    await mongoose.connect(uri, options);
    logger.info("ENGEXPUTILS012", { database: uri });
    await mongoose.connection.db.admin().command({ ping: 1 });
    logger.info("ENGEXPUTILS007", {
      database: uri,
    });
  } catch (error: any) {
    logger.error("ENGEXPUTILS008", {
      error: error.toString(),
    });
    throw error;
  }
};

export const disconnect = async (
  logger: ILog = defaultLogger
): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("ENGEXPUTILS009", { message: "Disconnected from database" });
  } catch (error: any) {
    logger.error("ENGEXPUTILS010", {
      error: error.toString(),
    });
    throw error;
  }
};
