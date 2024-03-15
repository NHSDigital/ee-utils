import mongoose from "mongoose";
import { logReferences } from "../logReferences";
import { LambdaLogger } from "../logger";

const logger = new LambdaLogger("ee-utils/mongodb", logReferences);

export const connectToDatabaseViaEnvVar = async (
  options = {
    ssl: true,
    tlsCAFile: `${__dirname}/global-bundle.pem`,
  }
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
    logger.info("ENGEXPUTILS007", {
      database: uri,
    });
  } catch (error) {
    logger.error("ENGEXPUTILS008", {
      error,
    });
    throw error;
  }
};
