import {
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { jest } from "@jest/globals";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import {
  getParsedJSONFromS3,
  outputToS3,
  writeToS3HandleErrors,
} from "../s3Utilities";

const s3Mock = mockClient(S3Client);

beforeEach(() => {
  s3Mock.reset();
});

describe("writeToS3HandleErrors", () => {
  it("saves the given json without error", async () => {
    const s3MockResponse = {
      $metadata: {
        httpStatusCode: 200,
      },
    };
    s3Mock.on(PutObjectCommand).resolves(s3MockResponse);
    const logSpy = jest.spyOn(global.console, "log");
    const jsonBody = { json_data: "SOME DATA" };
    const bucketName = "SOME BUCKET";
    const objectKey = "SOME KEY";
    const expectedCall = {
      Body: JSON.stringify(jsonBody),
      Bucket: bucketName,
      Key: objectKey,
    };
    await writeToS3HandleErrors(jsonBody, bucketName, objectKey);
    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, expectedCall);
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith(
      "UPLOADED OBJECT: SOME BUCKET/SOME KEY"
    );
    expect(logSpy).toHaveBeenCalledWith("RESPONSE", {
      $metadata: { httpStatusCode: 200 },
    });
    logSpy.mockRestore();
  });
  it("fails to save the given json handles the error", async () => {
    s3Mock.on(PutObjectCommand).rejects("Mocked Error");
    const logSpy = jest.spyOn(global.console, "log");
    const errorSpy = jest.spyOn(global.console, "error");
    const jsonBody = { json_data: "SOME DATA" };
    const bucketName = "SOME BUCKET";
    const objectKey = "SOME KEY";
    const expectedCall = {
      Body: JSON.stringify(jsonBody),
      Bucket: bucketName,
      Key: objectKey,
    };
    await writeToS3HandleErrors(jsonBody, bucketName, objectKey);
    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, expectedCall);
    expect(errorSpy).toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith("ERROR", Error("Mocked Error"));
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

describe("outputToS3", () => {
  it("saves the given json to s3", async () => {
    const s3MockResponse = {
      $metadata: {
        httpStatusCode: 200,
      },
    };
    s3Mock.on(PutObjectCommand).resolves(s3MockResponse);
    const jsonBody = { json_data: "SOME DATA" };
    const bucketName = "SOME BUCKET";
    const objectKey = "SOME KEY";
    const expectedCall = {
      Body: JSON.stringify(jsonBody),
      Bucket: bucketName,
      Key: objectKey,
    };
    const response = await outputToS3(jsonBody, bucketName, objectKey);
    expect(response).toMatchObject(s3MockResponse);
    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, expectedCall);
  });
  it("saves the given csv data", async () => {
    const s3MockResponse = {
      $metadata: {
        httpStatusCode: 200,
      },
    };
    s3Mock.on(PutObjectCommand).resolves(s3MockResponse);
    const bucketName = "SOME BUCKET";
    const objectKey = "SOME KEY";
    const csvData =
      'title,genre,writer\r\n"The Way of Kings","Fantasy","Brandon Sanderson"';
    const expectedCall = {
      Body: csvData,
      Bucket: bucketName,
      Key: objectKey,
    };
    const response = await outputToS3(csvData, bucketName, objectKey, false);
    expect(response).toMatchObject(s3MockResponse);
    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, expectedCall);
  });
});

describe("getJSONFileFromS3", () => {
  it("correctly gets an object from s3", async () => {
    const s3JSONBody = {
      someKey: "someValue",
    };

    const s3MockResponse = {
      $metadata: {
        httpStatusCode: 200,
      },
      Body: {
        transformToString: () => {
          return JSON.stringify(s3JSONBody);
        },
      },
    } as unknown as GetObjectCommandOutput;
    s3Mock.on(GetObjectCommand).resolves(s3MockResponse);
    const bucketToUse = "some_bucket";
    const fileToGet = "some_file.json";
    const response = await getParsedJSONFromS3(bucketToUse, fileToGet);

    expect(response).toMatchObject(s3JSONBody);
  });

  it("throws an error when file or bucket not found", async () => {
    s3Mock.on(GetObjectCommand).resolves({
      $metadata: {
        httpStatusCode: 500,
      },
    });
    await expect(async () => {
      await getParsedJSONFromS3("", "");
    }).rejects.toThrow(
      "File or Bucket was not found or incorrect permissions to access!"
    );
  });
});
