import mongoose from "mongoose";
import { LambdaLogger } from "../logger";
import { connectToDatabaseViaEnvVar } from "../mongodb/mongo";

jest.mock("mongoose");

describe("connectToDatabaseViaEnvVar", () => {
  it("should log an error when the environment variable is not set", async () => {
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "error");

    delete process.env.MONGODB_URI;

    try {
      await connectToDatabaseViaEnvVar();
    } catch (error: any) {
      expect(error.message).toEqual("MONGODB_URI environment variable not set");
    }

    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS006", {
      error: "MONGODB_URI environment variable not set",
    });
  });
  it("should connect to the mongoose database when the URI is set", async () => {
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "info");

    process.env.MONGODB_URI = "mongodb://";

    await connectToDatabaseViaEnvVar();

    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS007", {
      database: "mongodb://",
    });
  });
  it("should log an error if the connection to the database fails", async () => {
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "error");

    (mongoose.connect as jest.MockedFunction<any>).mockRejectedValue(
      "Connection Failed"
    );
    process.env.MONGODB_URI = "mongodb://";

    try {
      await connectToDatabaseViaEnvVar();
    } catch (error) {
      expect(error).toEqual("Connection Failed");
    }

    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS008", {
      error: "Connection Failed",
    });
  });
});
