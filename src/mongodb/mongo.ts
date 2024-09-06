import mongoose from "mongoose";
import { logReferences } from "../logReferences.js";
import { LambdaLogger } from "../logger.js";
// @ts-ignore
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
    } else {
      logger.error("ENGEXPUTILS011", {
        error: "Database connection is undefined",
      });
      throw new Error("Database connection is undefined");
    }
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

export const disconnectFromDatabase = async (
  logger: ILog = defaultLogger
): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("ENGEXPUTILS019");
  } catch (error: any) {
    logger.error("ENGEXPUTILS020", {
      error: error.toString(),
    });
    throw error;
  }
};
