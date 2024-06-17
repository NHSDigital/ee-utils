import { APIGatewayProxyEventHeaders } from "aws-lambda";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { LambdaLogger } from "./logger";

export const authenticateRequest = async (token: string, tenantId: string) => {
  const client = new JwksClient({
    jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
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

export const authenticateLambda = async (
  headers: APIGatewayProxyEventHeaders,
  tenantId: string,
  logger: LambdaLogger<any>
) => {
  if (!headers.authorization) {
    return [null, "No authorization headers"] as const;
  }
  try {
    logger.info("ENGEXPUTILS013");
    await authenticateRequest(headers.authorization, tenantId);
    logger.info("ENGEXPUTILS014");
    return [true, null] as const;
  } catch (error: any) {
    return [null, error.message] as const;
  }
};
