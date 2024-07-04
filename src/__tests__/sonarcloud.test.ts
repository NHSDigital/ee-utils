import { LambdaLogger } from "../logger";
import {
  checkForErrors,
  checkResponse,
  createGroup,
  getSonarcloudProjects,
  handleErrors,
  makeSonarcloudAPICall,
  makeSonarcloudGetRequest,
  makeSonarcloudPostRequest,
} from "../sonarcloud";

global.fetch = jest.fn();

jest.mock("../parameters", () => {
  return {
    ...jest.requireActual("../parameters"),
    getParameter: () => "some_parameter",
  };
});
beforeEach(() => {
  (fetch as jest.MockedFunction<any>).mockClear();
});

describe("checkForErrors", () => {
  it("should check for errors and throw the errors if they exist", () => {
    const mockResponse = {
      errors: [
        {
          message: "some error message",
        },
      ],
    };
    expect(() => checkForErrors(mockResponse)).toThrow();
  });
});

describe("handleErrors", () => {
  it("should handle errors and throw organisation error", () => {
    const mockErrors = [Error("No organization for key 'someOrg'")];
    expect(() => handleErrors(mockErrors)).toThrow("No organization for key");
  });
  it("should handle errors and throw error if no message property exists", () => {
    const brokenError = { someAttr: "" };
    const mockErrors = [brokenError];
    // @ts-ignore
    expect(() => handleErrors(mockErrors)).toThrow(
      `Error message not found: ${brokenError}`
    );
  });
  it("should handle errors and throw organisation error for different properties", () => {
    const mockErrors = [{ msg: "No organization for key 'someOrg'" }];
    // @ts-ignore
    expect(() => handleErrors(mockErrors)).toThrow("No organization for key");
  });
  it("should handle errors and throw project not found error", () => {
    const mockErrors = [{ message: "Component key 'someProject' not found" }];
    expect(() => handleErrors(mockErrors)).toThrow(
      "Component key 'someProject' not found"
    );
  });
  it("should throw errors", () => {
    const mockErrors = [{ message: "some error message" }];
    try {
      handleErrors(mockErrors);
    } catch (error) {
      expect(error).toEqual(mockErrors);
    }
  });
});

describe("checkResponse", () => {
  it("should call checkForErrors and throw errors", () => {
    const mockResponse = {
      errors: [
        {
          message: "some error message",
        },
      ],
    };
    expect(() => checkResponse(mockResponse)).toThrow();
  });
  it("should return the response", () => {
    const mockResponse = { some: "response" };
    expect(checkResponse(mockResponse)).toEqual(mockResponse);
  });
  it("should call handleErrors", () => {
    const mockResponse = {
      errors: [
        {
          message: "Component key 'someProject' not found",
        },
      ],
    };
    expect(() => checkResponse(mockResponse)).toThrow(
      "Component key 'someProject' not found"
    );
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
    (fetch as jest.MockedFunction<any>).mockResolvedValue({
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
      paging: { pageIndex: 1, pageSize: 2, total: 4 },
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
      paging: { pageIndex: 2, pageSize: 2, total: 4 },
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
    (fetch as jest.MockedFunction<any>).mockResolvedValue({
      json: fetchJsonMock,
    });
    const result = await getSonarcloudProjects("api-token", "orgName");
    const expectedProjects = [
      "someSonarcloudProject",
      "anotherSonarcloudProject",
      "aDifferentSonarcloudProject",
      "theOtherSonarcloudProject",
    ];

    expect(result).toEqual(expectedProjects);
  });
});

describe("createGroup", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
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
    (fetch as jest.MockedFunction<any>).mockResolvedValue({
      json: () => Promise.resolve({ group: { name: "someGroup" } }),
    });
    const result = await createGroup(inputGroupName, "someOrg", "someToken");

    expect(loggerSpy).toHaveBeenNthCalledWith(1, "ENGEXPUTILS016", {
      group: "someGroup",
    });
    expect(loggerSpy).toHaveBeenNthCalledWith(2, "ENGEXPUTILS001", {
      response: { group: { name: "someGroup" } },
      group: "someGroup",
    });
    expect(result).toEqual(inputGroupName);
  });
  it("should log and throw error if the group creation is unsuccessful", async () => {
    const inputGroupName = "someGroup";
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "error");
    (fetch as jest.MockedFunction<any>).mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });
    await expect(() =>
      createGroup(inputGroupName, "someOrg", "someToken")
    ).rejects.toThrow();
    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS017", {
      group: "someGroup",
      response: { success: false },
    });
  });
});

describe("makeSonarcloudAPICall", () => {
  const urlToCall = "/some/url";
  const searchParams = { some: "param" };
  const sonarcloudApiToken = "someToken";
  it("should call with provided params", async () => {
    const expectedResponse = { response: ["response"], paging: { total: 1 } };
    (fetch as jest.MockedFunction<any>).mockResolvedValue({
      json: () => Promise.resolve(expectedResponse),
    });
    const result = await makeSonarcloudAPICall(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "response",
      "get"
    );
    const expectedUrl = new URL(
      "https://sonarcloud.io/api/some/url?some=param"
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: "get",
      headers: {
        Authorization: `Bearer ${sonarcloudApiToken}`,
      },
    });
    expect(result).toEqual(expectedResponse.response);
  });
  it("should handle pagination", async () => {
    const mockSonarcloudFirstResponse = {
      groups: [
        { id: 1, name: "someGroupName", membersCount: 0, default: false },
        { id: 2, name: "anotherGroupName", membersCount: 1, default: false },
      ],
      paging: { pageIndex: 1, pageSize: 2, total: 4 },
    };
    const mockSonarcloudSecondResponse = {
      groups: [
        { id: 3, name: "Members", membersCount: 10, default: true },
        { id: 4, name: "Owners", membersCount: 5, default: false },
      ],
      paging: { pageIndex: 2, pageSize: 2, total: 4 },
    };

    (fetch as jest.MockedFunction<any>)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockSonarcloudFirstResponse),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockSonarcloudSecondResponse),
      });

    const result = await makeSonarcloudAPICall(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "groups",
      "get"
    );

    const expectedGroups = [
      ...mockSonarcloudFirstResponse.groups,
      ...mockSonarcloudSecondResponse.groups,
    ];

    expect(result).toEqual(expectedGroups);
    expect(fetch).toBeCalledTimes(2);
  });
  it("should handle responses that do not have the paging object", async () => {
    const mockSonarcloudFirstResponse = {
      groups: [
        { id: 1, name: "someGroupName", membersCount: 0, default: false },
        { id: 2, name: "anotherGroupName", membersCount: 1, default: false },
      ],
    };

    (fetch as jest.MockedFunction<any>).mockResolvedValueOnce({
      json: () => Promise.resolve(mockSonarcloudFirstResponse),
    });

    const result = await makeSonarcloudAPICall(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "groups",
      "get"
    );

    const expectedGroups = [...mockSonarcloudFirstResponse.groups];

    expect(result).toEqual(expectedGroups);
    expect(fetch).toBeCalledTimes(1);
  });
  it("should handle responses that aren't iterable", async () => {
    const mockSonarcloudFirstResponse = {
      groups: { id: 1, name: "someGroupName", membersCount: 0, default: false },
    };

    (fetch as jest.MockedFunction<any>).mockResolvedValueOnce({
      json: () => Promise.resolve(mockSonarcloudFirstResponse),
    });

    const result = await makeSonarcloudAPICall(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "groups",
      "get"
    );

    const expectedGroups = mockSonarcloudFirstResponse.groups;

    expect(result).toEqual(expectedGroups);
    expect(fetch).toBeCalledTimes(1);
  });
  it("should not paginate for POSTs", async () => {
    const mockSonarcloudFirstResponse = { group: { name: "someGroup" } };

    (fetch as jest.MockedFunction<any>).mockResolvedValueOnce({
      json: () => Promise.resolve(mockSonarcloudFirstResponse),
    });

    const result = await makeSonarcloudAPICall(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "group",
      "post"
    );

    expect(result).toEqual(mockSonarcloudFirstResponse);
    expect(fetch).toBeCalledTimes(1);
  });
  it("should not attempt to parse the response as json for a 204", async () => {
    (fetch as jest.MockedFunction<any>).mockResolvedValueOnce({
      status: 204,
    });

    const result = await makeSonarcloudAPICall(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "group",
      "post"
    );

    expect(result).toEqual({ success: true });
  });
  it("should return a success false and log for error codes", async () => {
    (fetch as jest.MockedFunction<any>).mockResolvedValueOnce({
      status: 400,
      message: "Unauthorised Error",
    });
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "error");

    const result = await makeSonarcloudAPICall(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "group",
      "post"
    );

    expect(result).toEqual({ success: false });
    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS018", {
      response: { status: 400, message: "Unauthorised Error" },
    });
  });
  it("should log out an error with fetch", async () => {
    (fetch as jest.MockedFunction<any>).mockRejectedValueOnce("some error");
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "error");

    const response = await makeSonarcloudAPICall(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "group",
      "post"
    );

    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS015", {
      error: "some error",
    });
    expect(response).toEqual({ success: false });
  });
});

describe("makeSonarcloudGetRequest", () => {
  it("should call makeSonarcloudAPICall with correct args", async () => {
    const urlToCall = "/some/url";
    const searchParams = { some: "param" };
    const sonarcloudApiToken = "someToken";

    const expectedResponse = { response: ["response"], paging: { total: 1 } };
    (fetch as jest.MockedFunction<any>).mockResolvedValue({
      json: () => Promise.resolve(expectedResponse),
    });
    const result = await makeSonarcloudGetRequest(
      urlToCall,
      searchParams,
      sonarcloudApiToken,
      "response"
    );
    const expectedUrl = new URL(
      "https://sonarcloud.io/api/some/url?some=param"
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: "get",
      headers: {
        Authorization: `Bearer ${sonarcloudApiToken}`,
      },
    });
    expect(result).toEqual(expectedResponse.response);
  });
});

describe("makeSonarcloudPostRequest", () => {
  it("should call makeSonarcloudAPICall with correct args", async () => {
    const urlToCall = "/some/url";
    const searchParams = { some: "param" };
    const sonarcloudApiToken = "someToken";

    const mockSonarcloudResponse = { group: { name: "someGroup" } };

    (fetch as jest.MockedFunction<any>).mockResolvedValueOnce({
      json: () => Promise.resolve(mockSonarcloudResponse),
    });

    const result = await makeSonarcloudPostRequest(
      urlToCall,
      searchParams,
      sonarcloudApiToken
    );
    const expectedUrl = new URL(
      "https://sonarcloud.io/api/some/url?some=param"
    );

    expect(result).toEqual(mockSonarcloudResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: "post",
      headers: {
        Authorization: `Bearer ${sonarcloudApiToken}`,
      },
    });
  });
});
