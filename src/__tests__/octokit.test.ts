import { Octokit } from "@octokit/rest";
import { generateKeyPairSync } from "crypto";
import jwt from "jsonwebtoken";
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from "vitest";
import { LambdaLogger } from "../logger";
import {
  getAllRepositoriesInOrganisation,
  getContributorsForRepo,
  getOctokit,
  getTeamsForRepo,
  getTeamsForRepositoriesInOrganisation,
  octokitApp,
} from "../octokit";
vi.doMock("../parameters", () => ({
  ...(vi.importActual("../parameters") as object),
  getParameter: vi.fn((parameter) => Promise.resolve(parameter)),
}));

describe("octokitApp", () => {
  let privateKey: string;

  beforeAll(() => {
    const keys = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    privateKey = keys.privateKey;
  });

  class JWTToken {
    token: string = "";

    set(payload: any) {
      const [bearer, token] = payload.split(" ");
      this.token = token;
    }

    getPayload() {
      return jwt.decode(this.token) as any;
    }

    validates(key: string) {
      try {
        jwt.verify(this.token, key);
        return true;
      } catch {
        return false;
      }
    }
  }

  const extractAuthorizationCallback = (jwtToken: JWTToken) => {
    return (_endpoint: string, req: { headers: { authorization: string } }) => {
      jwtToken.set(req.headers.authorization);
      throw new Error("early halt");
    };
  };

  it("configures the app ID", async () => {
    const appId = "456";
    const jwtToken = new JWTToken();
    const fetch = extractAuthorizationCallback(jwtToken);
    const app = octokitApp(appId, privateKey, { request: { fetch } });
    const octokit = await app.getInstallationOctokit(123);

    await octokit.rest.repos.listForOrg({ org: "Anything" }).catch(() => {});

    expect(jwtToken.getPayload().iss).toBe(appId);
  });

  it("configures the private key", async () => {
    const jwtToken = new JWTToken();
    const fetch = extractAuthorizationCallback(jwtToken);
    const app = octokitApp("456", privateKey, { request: { fetch } });
    const octokit = await app.getInstallationOctokit(123);

    await octokit.rest.repos.listForOrg({ org: "Anything" }).catch(() => {});

    expect(jwtToken.validates(privateKey)).toBe(true);
  });
});

describe("getOctokit", () => {
  let privateKey: string;

  beforeAll(() => {
    const keys = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    privateKey = keys.privateKey;
  });
  it("throws error when installation id is not a number", async () => {
    const inputInstallationId = "installation_id";

    await expect(
      getOctokit(
        privateKey,
        "456",
        inputInstallationId,
        {},
        (parameter: string) => Promise.resolve(parameter)
      )
    ).rejects.toThrow("installation_id is not a number");
  });
  it("sets empty values on the octokit app when cannot find the parameters", async () => {
    await expect(
      getOctokit(
        "private_key",
        "app_id",
        "installation_id",
        {},
        async () => null
      )
    ).rejects.toThrow("installation_id is not a number");
  });
});

describe("getAllRepositoriesInOrganisation", () => {
  let loggerSpy: MockInstance<(logReference: any, logArgs?: {}) => void>;
  beforeEach(() => {
    loggerSpy = vi.spyOn(LambdaLogger.prototype, "debug");
  });

  const buildFakeOctokit = (resultToReturn: any[]) => {
    return {
      paginate: () => Promise.resolve(resultToReturn),
      rest: { repos: { listForOrg: vi.fn() } },
    } as unknown as Octokit;
  };

  it("gets all repository names in an organisation", async () => {
    const repositories = [{ name: "Test" }, { name: "Other" }];
    const fakeOctokit = buildFakeOctokit(repositories);
    const result = await getAllRepositoriesInOrganisation(
      fakeOctokit,
      "NHS-CodeLab"
    );

    expect(result).toEqual(["Test", "Other"]);
  });

  it("logs the organisation name", async () => {
    await getAllRepositoriesInOrganisation(buildFakeOctokit([]), "NHS-CodeLab");

    expect(loggerSpy).toHaveBeenCalledWith("ENGEXPUTILS011", {
      organisationName: "NHS-CodeLab",
    });
  });

  it("filters by a passed-in function", async () => {
    const repositories = [{ name: "Test" }, { name: "Other" }];
    const fakeOctokit = buildFakeOctokit(repositories);

    const result = await getAllRepositoriesInOrganisation(
      fakeOctokit,
      "NHS-CodeLab",
      (repo) => repo.name === "Test"
    );
    expect(result).toEqual(["Test"]);
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
      rest: { repos: { listTeams: vi.fn() } },
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
      rest: { repos: { listContributors: vi.fn() } },
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
      rest: { repos: { listContributors: vi.fn() } },
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
      rest: { repos: { listContributors: vi.fn() } },
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

describe("getTeamsForRepositoriesInOrganisastion", () => {
  it("returns all teams by repos in the organisation", async () => {
    vi.doMock("../octokit", async (importOriginal) => {
      const actual = (await importOriginal()) as object;
      return {
        ...actual,
        getAllRepositoriesInOrganisation: vi
          .fn<typeof getAllRepositoriesInOrganisation>()
          .mockResolvedValue(["repo1", "repo2"]),
        getTeamsForRepo: vi.fn<typeof getTeamsForRepo>().mockResolvedValue({
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
      };
    });
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
      paginate: vi
        .fn<() => any>()
        .mockResolvedValueOnce(mockReposRequest)
        .mockResolvedValueOnce(mockTeamsForRepoRequest1)
        .mockResolvedValueOnce(mockTeamsForRepoRequest2),
      rest: { repos: { listTeams: vi.fn(), listForOrg: vi.fn() } },
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
