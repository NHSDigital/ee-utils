import jwt, { TokenExpiredError } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

export const authenticateRequest = async (token: string, tenant_id: string) => {
  const client = new JwksClient({
    jwksUri: `https://login.microsoftonline.com/${tenant_id}/discovery/v2.0/keys`,
  });
  const decodedToken = jwt.decode(token, { complete: true });
  if (!decodedToken) {
    throw new Error("Token is invalid");
  }

  const key = await client.getSigningKey(decodedToken.header.kid);

  try {
    jwt.verify(token, key.getPublicKey());
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new Error("Token has expired");
    }
    throw new Error("Token cannot be verified");
  }
};
