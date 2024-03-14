import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { mockClient } from "aws-sdk-client-mock";
import { getParameter } from "../parameters";

const ssmMock = mockClient(SSMClient);

beforeEach(() => {
  ssmMock.reset();
});

describe("getParameter", () => {
  it("returns null for non-existant parameter", async () => {
    ssmMock.on(GetParameterCommand).resolves({
      $metadata: {
        httpStatusCode: 404,
      },
    });

    const result = await getParameter("does-not-exist");
    expect(result).toBeNull();
  });

  it("returns the parameter for correct parameter", async () => {
    ssmMock.on(GetParameterCommand, { Name: "does-exist" }).resolves({
      $metadata: { httpStatusCode: 200 },
      Parameter: { Value: "some_parameter" },
    });
    const result = await getParameter("does-exist");
    expect(result).toBe("some_parameter");
  });
});
