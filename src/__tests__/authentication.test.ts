import jwt from "jsonwebtoken";
import { authenticateRequest } from "../authentication";

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
