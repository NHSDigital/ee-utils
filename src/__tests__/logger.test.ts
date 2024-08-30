import { Writable } from "stream";
import { vi } from "vitest";
import { transports } from "winston";
import { LambdaLogger, getTimestamp } from "../logger";

const jsonTransport = () => {
  const buffer: any[] = [];
  const stream = new Writable({
    write: (chunk, encoding, next) => {
      buffer.push(JSON.parse(chunk.toString()));
      next();
    },
  });
  return { buffer, transport: new transports.Stream({ stream }) };
};

const jsonLogger = (logReferences: any, level: string) => {
  const { buffer, transport } = jsonTransport();
  return {
    buffer,
    logger: new LambdaLogger("test", logReferences, level, [transport]),
  };
};

describe("LambdaLogger - log methods", () => {
  const logRefs = { TEST001: "Test Log Reference" };

  it("should log out the message as info", () => {
    const { buffer, logger } = jsonLogger(logRefs, "info");
    const logArgs = { extraArgs: "some more information" };

    logger.info("TEST001", logArgs);

    expect(buffer[0].message).toEqual("Test Log Reference");
    expect(buffer[0]).toMatchObject(logArgs);
  });

  it("logs nothing below the given level", () => {
    const { buffer, logger } = jsonLogger(logRefs, "error");

    logger.info("TEST001");

    expect(buffer.length).toEqual(0);
  });

  it.each(["warn", "error", "info"])("logs at %s level", (level) => {
    const { buffer, logger } = jsonLogger(logRefs, level);

    logger[level]("TEST001");
    logger.debug("TEST001");

    expect(buffer.length).toEqual(1);
  });

  it("logs at debug level", () => {
    const { buffer, logger } = jsonLogger(logRefs, "debug");

    logger.debug("TEST001");

    expect(buffer.length).toEqual(1);
  });
});

describe("LambdaLogger - _buildLog", () => {
  it("set the message to not found if the log reference is not found", () => {
    const logger = new LambdaLogger("test", {
      LOGREF001: "Test Log Reference",
    });

    const nonExistentLogReference = "SOMELOG001";
    const expectedLog = {
      log_reference: nonExistentLogReference,
      message: "log reference not found",
    };

    // @ts-ignore - typescript doesn't like that we're passing a non-existent log reference
    const actualLog = logger._buildLog(nonExistentLogReference, {});

    expect(actualLog).toEqual(expectedLog);
  });
});

describe("LambdaLogger - _convertLogArgsToDict", () => {
  it("returns an empty object when passed non-object log args", () => {
    const logger = new LambdaLogger("test", {});

    const expectedLogArgs = {};
    // @ts-ignore - typescript doesn't like that we're passing a non-object log args
    const actualLogArgs = logger._convertLogArgsToDict("non-object");

    expect(actualLogArgs).toEqual(expectedLogArgs);
  });
});

describe("LambdaLogger - _removeReservedFields", () => {
  it("removes reserved fields in log args", () => {
    const logger = new LambdaLogger("test", {});

    const inputLogArgs = {
      log_reference: "Some Log Reference",
      message: "Some message",
      nonReservedFields: "A non-reserved field",
    };
    const expectedLogs = { nonReservedFields: "A non-reserved field" };

    const cleanedArgs = logger._removeReservedFields(inputLogArgs);

    expect(cleanedArgs).toEqual(expectedLogs);
  });
});

describe("getTimestamp", () => {
  it("returns the timestamp for the current date", () => {
    vi.useFakeTimers().setSystemTime(new Date("2023-02-15"));

    const expectedTimestamp = 1676419200000;

    const actualTimestamp = getTimestamp();

    expect(actualTimestamp).toEqual(expectedTimestamp);
  });
});
