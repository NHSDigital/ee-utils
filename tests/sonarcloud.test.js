import {
  createGroup,
  getSonarcloudProjects,
  makeSonarcloudAPICall,
} from "../src/sonarcloud";
import { LambdaLogger } from "../src/logger";

global.fetch = jest.fn();

jest.mock("../src/parameters", () => {
  return {
    ...jest.requireActual("../src/parameters"),
    getParameter: () => "some_parameter",
  };
});
beforeEach(() => {
  fetch.mockClear();
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
    fetch.mockResolvedValue({
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

describe("makeSonarcloudAPICall", () => {
  const urlToCall = "/some/url";
  const searchParams = { some: "param" };
  const sonarcloudApiToken = "someToken";
  it("should call with provided params", async () => {
    const expectedResponse = { response: ["response"], paging: { total: 1 } };
    fetch.mockResolvedValue({
      json: () => Promise.resolve(expectedResponse),
    });
    const result = await makeSonarcloudAPICall(
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
        Authorization: `basic ${Buffer.from(
          sonarcloudApiToken,
          "utf8"
        ).toString("base64")}`,
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

    fetch
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
      "groups"
    );

    const expectedGroups = [
      ...mockSonarcloudFirstResponse.groups,
      ...mockSonarcloudSecondResponse.groups,
    ];

    expect(result).toEqual(expectedGroups);
    expect(fetch).toBeCalledTimes(2);
  });
  it("should not paginate for POSTs", async () => {
    const mockSonarcloudFirstResponse = { group: { name: "someGroup" } };

    fetch.mockResolvedValueOnce({
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
});
