import LambdaLogger, { getTimestamp } from "../src/logger";

describe("LambdaLogger - log methods", () => {
  it("should log out the message as info", () => {
    const logger = new LambdaLogger("test", { TEST001: "Test Log Reference" });
    const loggerSpy = jest.spyOn(logger, "info");

    const logArgs = { extraArgs: "some more information" };
    logger.info("TEST001", logArgs);

    expect(loggerSpy).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith("TEST001", logArgs);
  });
});

describe("LambdaLogger - _buildLog", () => {
  it("set the message to not found if the log reference is not found", () => {
    const logger = new LambdaLogger("test", {});

    const nonExistentLogReference = "SOMELOG001";
    const expectedLog = {
      log_reference: nonExistentLogReference,
      message: "log reference not found",
    };

    const actualLog = logger._buildLog(nonExistentLogReference, {});

    expect(actualLog).toEqual(expectedLog);
  });
});

describe("LambdaLogger - _convertLogArgsToDict", () => {
  it("returns an empty object when passed non-object log args", () => {
    const logger = new LambdaLogger("test", {});

    const expectedLogArgs = {};
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
    jest.useFakeTimers().setSystemTime(new Date("2023-02-15"));

    const expectedTimestamp = 1676419200000;

    const actualTimestamp = getTimestamp();

    expect(actualTimestamp).toEqual(expectedTimestamp);
  });
});
