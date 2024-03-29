import { Octokit } from "@octokit/rest";
import { App } from "octokit";
import { LambdaLogger } from "../logger";
import {
  getAllRepositoriesInOrganisation,
  getContributorsForRepo,
  getOctokit,
  getTeamsForRepo,
  getTeamsForRepositoriesInOrganisation,
} from "../octokit";

jest.mock("../parameters", () => ({
  ...jest.requireActual("../parameters"),
  getParameter: jest.fn((parameter) => Promise.resolve(parameter)),
}));
jest.mock("octokit", () => {
  return {
    ...jest.requireActual("octokit"),
    App: jest.fn(),
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getOctokit", () => {
  it("throws error when installation id is not a number", async () => {
    const inputPrivateKey = "private_key";
    const inputAppId = "app_id";
    const inputInstallationId = "installation_id";
    const getInstallationOctokitMock = jest.fn();
    (App as jest.MockedFunction<any>).mockImplementation(() => ({
      getInstallationOctokit: getInstallationOctokitMock,
    }));

    await expect(
      getOctokit(inputPrivateKey, inputAppId, inputInstallationId)
    ).rejects.toThrow("installation_id is not a number");
  });
  it("gets the octokit with provided parameters", async () => {
    const inputPrivateKey = "private_key";
    const inputAppId = "app_id";
    const inputInstallationId = "123";
    const getInstallationOctokitMock = jest.fn();
    (App as jest.MockedFunction<any>).mockImplementation(() => ({
      getInstallationOctokit: getInstallationOctokitMock,
    }));
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "info");

    await getOctokit(inputPrivateKey, inputAppId, inputInstallationId);
    expect(App).toBeCalledWith({
      appId: inputAppId,
      privateKey: inputPrivateKey,
    });
    expect(getInstallationOctokitMock).toBeCalledWith(123);
    expect(loggerSpy).toHaveBeenCalledTimes(2);
    expect(loggerSpy).toHaveBeenNthCalledWith(1, "ENGEXPUTILS009", {
      GITHUB_APP_ID: inputAppId,
      GITHUB_INSTALLATION_ID: inputInstallationId,
    });
    expect(loggerSpy).toHaveBeenNthCalledWith(2, "ENGEXPUTILS010", {
      app: {
        getInstallationOctokit: getInstallationOctokitMock,
      },
    });
  });
});

describe("getAllRepositoriesInOrganisation", () => {
  it("gets all repository names in an organisation", async () => {
    const mockOctokitRequest = jest.fn(() => {
      return [{ name: "Test" }, { name: "Other" }];
    });
    const loggerSpy = jest.spyOn(LambdaLogger.prototype, "info");

    const fakeOctokit = {
      paginate: mockOctokitRequest,
      rest: { repos: { listForOrg: jest.fn() } },
    } as unknown as Octokit;
    const result = await getAllRepositoriesInOrganisation(
      fakeOctokit,
      "NHS-CodeLab"
    );
    expect(mockOctokitRequest).toBeCalled();
    expect(result).toEqual(["Test", "Other"]);
    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenNthCalledWith(1, "ENGEXPUTILS011", {
      organisationName: "NHS-CodeLab",
    });
  });
});

describe("getTeamsForRepo", () => {
  it("gets all teams for a repository and their permissions", async () => {
    const mockOctokitRequest = [
      {
        name: "fakeTeam1",
        slug: "fakeTeam1",
        permission: "pull",
        permissions: {
          admin: false,
          maintain: false,
          push: false,
          triage: false,
          pull: true,
        },
      },
      {
        name: "fakeTeam2",
        slug: "fakeTeam2",
        permission: "write",
        permissions: {
          admin: false,
          maintain: false,
          push: true,
          triage: false,
          pull: true,
        },
      },
    ];

    const fakeOctokit = {
      paginate: () => Promise.resolve(mockOctokitRequest),
      rest: { repos: { listTeams: jest.fn() } },
    } as unknown as Octokit;

    const result = await getTeamsForRepo(
      fakeOctokit,
      "organisation_name",
      "repo_name"
    );
    expect(result).toMatchObject({
      repo_name: [
        {
          slug: "fakeTeam1",
          permission: "pull",
          permissions: {
            admin: false,
            maintain: false,
            push: false,
            triage: false,
            pull: true,
          },
        },
        {
          slug: "fakeTeam2",
          permission: "write",
          permissions: {
            admin: false,
            maintain: false,
            push: true,
            triage: false,
            pull: true,
          },
        },
      ],
    });
  });
});

describe("getContributorsForRepo", () => {
  it("gets empty list when repo contains no contributors", async () => {
    const mockOctokitRequest: any[] = [];

    const fakeOctokit = {
      paginate: () => Promise.resolve(mockOctokitRequest),
      rest: { repos: { listContributors: jest.fn() } },
    } as unknown as Octokit;

    const result = await getContributorsForRepo(
      fakeOctokit,
      "organisation_name",
      "repo_name",
      "since"
    );

    expect(Object.keys(result).length).toBe(0);
  });

  it("gets one contributor when repo contains single contributor", async () => {
    const mockOctokitRequest = [{ login: "user1" }];

    const expectedResult = new Set(["user1"]);

    const fakeOctokit = {
      paginate: () => Promise.resolve(mockOctokitRequest),
      rest: { repos: { listContributors: jest.fn() } },
    } as unknown as Octokit;

    const result = await getContributorsForRepo(
      fakeOctokit,
      "organisation_name",
      "repo_name",
      "since"
    );

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(1);
    expect(result).toMatchObject(expectedResult);
  });

  it("gets multiple contributors when repo contains multiple contributor", async () => {
    const mockOctokitRequest = [
      { login: "user1" },
      { login: "user2" },
      { login: "user3" },
    ];

    const expectedResult = new Set(["user1", "user2", "user3"]);

    const fakeOctokit = {
      paginate: () => Promise.resolve(mockOctokitRequest),
      rest: { repos: { listContributors: jest.fn() } },
    } as unknown as Octokit;

    const result = await getContributorsForRepo(
      fakeOctokit,
      "organisation_name",
      "repo_name",
      "since"
    );

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(3);
    expect(result).toMatchObject(expectedResult);
  });
});

describe("getTeamsForRepositoriesInOrganisation", () => {
  it("returns all teams by repos in the organisation", async () => {
    jest.mock("../octokit", () => ({
      getAllRepositoriesInOrganisation: jest
        .fn()
        .mockResolvedValue(["repo1", "repo2"]),
      getTeamsForRepo: jest.fn().mockResolvedValue({
        repo1: [
          {
            slug: "team1",
            permission: "write",
            permissions: {
              admin: false,
              maintain: false,
              push: true,
              triage: false,
              pull: true,
            },
          },
        ],
        repo2: [
          {
            slug: "team2",
            permission: "pull",
            permissions: {
              admin: false,
              maintain: false,
              push: false,
              triage: false,
              pull: true,
            },
          },
        ],
      }),
    }));
    const mockReposRequest = [{ name: "repo1" }, { name: "repo2" }];
    const mockTeamsForRepoRequest1 = [
      {
        name: "team1",
        slug: "team1",
        permission: "write",
        permissions: {
          admin: false,
          maintain: false,
          push: true,
          triage: false,
          pull: true,
        },
      },
    ];
    const mockTeamsForRepoRequest2 = [
      {
        name: "team2",
        slug: "team2",
        permission: "pull",
        permissions: {
          admin: false,
          maintain: false,
          push: false,
          triage: false,
          pull: true,
        },
      },
    ];

    const fakeOctokit = {
      paginate: jest
        .fn()
        .mockResolvedValueOnce(mockReposRequest)
        .mockResolvedValueOnce(mockTeamsForRepoRequest1)
        .mockResolvedValueOnce(mockTeamsForRepoRequest2),
      rest: { repos: { listTeams: jest.fn(), listForOrg: jest.fn() } },
    } as unknown as Octokit;
    const expectedTeamsForRepositoriesInOrganisation = {
      repo1: [
        {
          slug: "team1",
          permission: "write",
          permissions: {
            admin: false,
            maintain: false,
            push: true,
            triage: false,
            pull: true,
          },
        },
      ],
      repo2: [
        {
          slug: "team2",
          permission: "pull",
          permissions: {
            admin: false,
            maintain: false,
            push: false,
            triage: false,
            pull: true,
          },
        },
      ],
    };

    const actualTeamsForRepositoriesInOrganisation =
      await getTeamsForRepositoriesInOrganisation(fakeOctokit, "org");

    expect(actualTeamsForRepositoriesInOrganisation).toEqual(
      expectedTeamsForRepositoriesInOrganisation
    );
  });
});
