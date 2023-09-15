import { LambdaLogger } from "../src/logger";
import {
  checkForErrors,
  createGroup,
  getSonarcloudProjects,
  handleErrors,
} from "../src/sonarcloud";

global.fetch = jest.fn();
jest.mock("../src/sonarcloud", () => ({
  ...jest.requireActual("../src/sonarcloud"),
  makeSonarcloudAPICall: jest.fn(),
}));
jest.mock("../src/parameters", () => {
  return {
    ...jest.requireActual("../src/parameters"),
    getParameter: () => "some_parameter",
  };
});
beforeEach(() => {
  fetch.mockClear();
});

describe("checkForErrors", () => {
  it("should check for errors and throw the errors if they exist", () => {
    const mockResponse = {
      errors: [
        {
          msg: "some error message",
        },
      ],
    };
    expect(() => checkForErrors(mockResponse)).toThrow();
  });
});

describe("handleErrors", () => {
  it("should handle errors and throw organisation error", () => {
    const mockErrors = [
      {
        msg: "No organization for key 'someOrg'",
      },
    ];
    expect(() => handleErrors(mockErrors)).toThrow("No organization for key");
  });
});

describe("getSonarcloudProjects", () => {
  it("should return an list of sonarcloud projects", async () => {
    const mockSonarcloudResponse = {
      paging: { pageIndex: 1, pageSize: 1, total: 1 },
      components: [
        {
          name: "someSonarcloudProject",
          visibility: "public",
        },
        {
          name: "anotherSonarcloudProject",
          visibility: "private",
        },
      ],
    };
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockSonarcloudResponse),
    });
    const result = await getSonarcloudProjects("api-token", "orgName");
    expect(result).toEqual([
      "someSonarcloudProject",
      "anotherSonarcloudProject",
    ]);
  });

  it("should handle pagination", async () => {
    const mockSonarcloudResponsePageOne = {
      paging: { pageIndex: 1, pageSize: 2, total: 2 },
      components: [
        {
          name: "someSonarcloudProject",
          visibility: "public",
        },
        {
          name: "anotherSonarcloudProject",
          visibility: "private",
        },
      ],
    };
    const mockSonarcloudResponsePageTwo = {
      paging: { pageIndex: 2, pageSize: 2, total: 2 },
      components: [
        {
          name: "aDifferentSonarcloudProject",
          visibility: "private",
        },
        {
          name: "theOtherSonarcloudProject",
          visibility: "private",
        },
      ],
    };
    const fetchJsonMock = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve(mockSonarcloudResponsePageOne))
      .mockReturnValueOnce(Promise.resolve(mockSonarcloudResponsePageTwo));
    fetch.mockResolvedValue({
      json: fetchJsonMock,
    });
    const result = await getSonarcloudProjects("api-token", "orgName");

    expect(result).toEqual([
      "someSonarcloudProject",
      "anotherSonarcloudProject",
      "aDifferentSonarcloudProject",
      "theOtherSonarcloudProject",
    ]);
  });
});

describe("createGroup", () => {
  it("returns the group name and logs if in dry run mode", async () => {
    const inputGroupName = "someGroup";
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "info");
    const result = await createGroup(
      inputGroupName,
      "someOrg",
      "someToken",
      true
    );

    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS002", {
      group: "someGroup",
    });
    expect(result).toEqual(inputGroupName);
  });
  it("create the group and logs the name", async () => {
    const inputGroupName = "someGroup";
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "info");
    fetch.mockResolvedValue({
      json: () => Promise.resolve({ group: { name: "someGroup" } }),
    });
    const result = await createGroup(inputGroupName, "someOrg", "someToken");

    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS001", {
      group: { name: "someGroup" },
    });
    expect(result).toEqual(inputGroupName);
  });
});
