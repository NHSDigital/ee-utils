import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({ region: "eu-west-2" });

export const getParameter = async (
  parameterName: string,
  decrypt: boolean = false
): Promise<string | null> => {
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: decrypt,
  });
  const response = await ssmClient.send(command);
  if (response.$metadata.httpStatusCode === 200) {
    return response.Parameter!.Value ?? "";
  }

  return null;
};
