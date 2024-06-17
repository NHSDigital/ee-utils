import jwt from "jsonwebtoken";
import { authenticateLambda, authenticateRequest } from "../authentication.js";
import { LambdaLogger } from "../logger.js";

const MOCK_SIGNING_KEY = "mockSigningKey";

jest.mock("jwks-rsa", () => ({
  JwksClient: jest.fn().mockImplementation(() => ({
    getSigningKey: jest.fn().mockResolvedValue({
      getPublicKey: jest.fn().mockReturnValue(MOCK_SIGNING_KEY),
    }),
  })),
}));

describe("authenticateRequest", () => {
  it("should successfully verify authenticity", async () => {
    const token = jwt.sign({ foo: "bar" }, MOCK_SIGNING_KEY);
    await authenticateRequest(token, "tenant");
  });
  it("should throw an error if the token cannot be decoded", async () => {
    await expect(authenticateRequest("foo", "bar")).rejects.toThrow(
      "Token is invalid"
    );
  });
  it("should throw an error if the token cannot be verified", async () => {
    const token = jwt.sign({ foo: "bar" }, "wrong key");
    await expect(authenticateRequest(token, "bar")).rejects.toThrow(
      "Token cannot be verified"
    );
  });
  it("should throw an error if the token is expired", async () => {
    const expiredToken = jwt.sign(
      { foo: "bar", exp: Math.floor(Date.now() / 1000) - 3600 },
      MOCK_SIGNING_KEY
    );
    await expect(authenticateRequest(expiredToken, "tenant")).rejects.toThrow(
      "Token has expired"
    );
  });
});

describe("authenticateLambda", () => {
  it("should return an error if there are no authorization headers", async () => {
    const headers = {};
    const [authorized, error] = await authenticateLambda(headers, "tenant_id", {
      info: jest.fn(),
    } as any as LambdaLogger<any>);

    expect(authorized).toBeNull();
    expect(error).toEqual("No authorization headers");
  });
  it("should return an error if authentication fails", async () => {
    const expiredToken = jwt.sign(
      { foo: "bar", exp: Math.floor(Date.now() / 1000) - 3600 },
      MOCK_SIGNING_KEY
    );
    const mockHeaders = {
      authorization: expiredToken,
    };

    const [authorized, error] = await authenticateLambda(
      mockHeaders,
      "tenant_id",
      { info: jest.fn() } as any as LambdaLogger<any>
    );

    expect(authorized).toBeNull();
    expect(error).toEqual("Token has expired");
  });
  it("should return a success if authentication is successful", async () => {
    const logger = {
      info: jest.fn(),
    };
    const token = jwt.sign({ foo: "bar" }, MOCK_SIGNING_KEY);
    const mockHeaders = {
      authorization: token,
    };
    const [authorized, error] = await authenticateLambda(
      mockHeaders,
      "tenant_id",
      logger as any as LambdaLogger<any>
    );

    expect(authorized).toEqual(true);
    expect(error).toBeNull();
    expect(logger.info).toHaveBeenNthCalledWith(1, "ENGEXPUTILS013");
    expect(logger.info).toHaveBeenNthCalledWith(2, "ENGEXPUTILS014");
  });
});
