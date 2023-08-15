import {
  getAllRepositoriesInOrganisation,
  getTeamsForRepo,
  getOctokit,
  getNormalPrivilegeOctokit,
  getElevatedPrivilegeOctokit,
  getRepoMetaDataBotOctokit,
  getTeamsForRepositoriesInOrganisation,
  getContributorsForRepo,
} from "../src/octokit";
import { App } from "octokit";

jest.mock("../src/parameters", () => ({
  ...jest.requireActual("../src/parameters"),
  getParameter: (parameter) => Promise.resolve(parameter),
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
  it("gets the octokit with provided parameters", async () => {
    const inputPrivateKey = "private_key";
    const inputAppId = "app_id";
    const inputInstallationId = "installationId";
    const getInstallationOctokitMock = jest.fn();
    App.mockImplementation(() => ({
      getInstallationOctokit: getInstallationOctokitMock,
    }));

    await getOctokit(inputPrivateKey, inputAppId, inputInstallationId);
    expect(App).toBeCalledWith({
      appId: inputAppId,
      privateKey: inputPrivateKey,
    });
    expect(getInstallationOctokitMock).toBeCalledWith(inputInstallationId);
  });
});

describe("getNormalPrivilegeOctokit", () => {
  it("returns the octokit using the correct parameters", async () => {
    const getInstallationOctokitMock = jest.fn();
    App.mockImplementation(() => ({
      getInstallationOctokit: getInstallationOctokitMock,
    }));
    await getNormalPrivilegeOctokit();

    expect(App).toBeCalledWith({
      appId: "github-scanning-utils-github-app-id",
      privateKey: "github-scanning-utils-github-app-private-key",
    });
    expect(getInstallationOctokitMock).toBeCalledWith(
      "github-scanning-utils-github-installation-id"
    );
  });
});

describe("getElevatedPrivilegeOctokit", () => {
  it("returns the octokit using the correct parameters", async () => {
    const getInstallationOctokitMock = jest.fn();
    App.mockImplementation(() => ({
      getInstallationOctokit: getInstallationOctokitMock,
    }));
    await getElevatedPrivilegeOctokit();

    expect(App).toBeCalledWith({
      appId: "github-scanning-utils-elevated-privileges-github-app-id",
      privateKey:
        "github-scanning-utils-elevated-privileges-github-app-private-key",
    });
    expect(getInstallationOctokitMock).toBeCalledWith(
      "github-scanning-utils-elevated-privileges-github-installation-id"
    );
  });
});

describe("getRepoMetaDataBotOctokit", () => {
  it("returns the octokit using the correct parameters", async () => {
    const getInstallationOctokitMock = jest.fn();
    App.mockImplementation(() => ({
      getInstallationOctokit: getInstallationOctokitMock,
    }));
    await getRepoMetaDataBotOctokit();

    expect(App).toBeCalledWith({
      appId: "github-scanning-utils-repo-meta-data-bot-app-id",
      privateKey: "github-scanning-utils-repo-meta-data-bot-private-key",
    });
    expect(getInstallationOctokitMock).toBeCalledWith(
      "github-scanning-utils-repo-meta-data-bot-installation-id"
    );
  });
});

describe("getAllRepositoriesInOrganisation", () => {
  it("gets all repository names in an organisation", async () => {
    const mockOctokitRequest = jest.fn(() => {
      return [{ name: "Test" }, { name: "Other" }];
    });

    const fakeOctokit = {
      paginate: mockOctokitRequest,
    };
    const result = await getAllRepositoriesInOrganisation(
      fakeOctokit,
      "NHS-CodeLab"
    );
    expect(mockOctokitRequest).toBeCalled();
    expect(result).toEqual(["Test", "Other"]);
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
    };

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
    const mockOctokitRequest = [];

    const fakeOctokit = {
      paginate: () => Promise.resolve(mockOctokitRequest),
    };

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
    };

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
    };

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
    jest.mock("../src/octokit", () => ({
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
    };
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
