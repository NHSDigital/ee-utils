import { Octokit } from "@octokit/rest";
import { App } from "octokit";
import jwt from "jsonwebtoken";
import { LambdaLogger } from "../logger";
import {
  getAllRepositoriesInOrganisation,
  getContributorsForRepo,
  getOctokit,
  getTeamsForRepo,
  getTeamsForRepositoriesInOrganisation,
  octokitApp,
} from "../octokit";

jest.mock("../parameters", () => ({
  ...jest.requireActual("../parameters"),
  getParameter: jest.fn((parameter) => Promise.resolve(parameter)),
}));

afterEach(() => {
  jest.restoreAllMocks();
});

describe("octokitApp", () => {
  const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDeTPIs0jUKXBEs
bzwSg8NeWpGErIAK09/p1QL9Bob9SWigN+kD0h6YWLxHCnALEEtEkYHAniod6s7h
5WaKwbJAj81YQGyTCMMzrJWkXBA4f7G8s/vjLfuF4/rMC+Q3LP1FAO9W9q1Rz3ab
fQXzwuObRcg6l1j1/hLveg7lFXjpgdDmUuf1IB7qoiHpnyKWZ0Jnd8Ca3PQE6Xfg
80RGgI3fy+Bd4o4S4SjFjRRFjxtU2xGfL6iDLwi+Pmas9lR3M47HBou6oeQgDGnd
pPyvk8Xtv9/GbTt9Ovq9NX0TpEfzk7vZtHREogRqSgJAZnpGqTmbEF9r/Wsxb0cc
sHOn2w1fAgMBAAECggEAEXDnCpY0JsvCEILqVdI0WKmcGNUx4eeX/fAXoRjLLCx/
bXFFh7u2E8zZJMJlt7B/v0b376VZIj9txjJp4QFrxf33pfC+tACFftSPvwqhaSq3
nARhAwTKDZ9X6idqsIYymXXb0VkJkHge/aRe/Fjc4634v4QSrOYnaoDgkfT6fL4X
BIbUmfdA2XVm9V5jAh6Zj+em2G0UL3YvmNEMz5akVbskxW0fPVLCXNw6yw5biK2Y
vLiXGxhlrvjovdNWYijWHvu9N9tUAGRyHL9wNSdIKYqsz+ha7NpDr3qNT33ghl1u
lzi8IgA5wxXxxVMdCmI9lfL26IuWREUWbA2BAgXrIQKBgQD4kQeKuDT2cMYpXKGk
O+dz3t51rGMKwzDAToEzofCdOCtB5oHvTmvSOPledFJw8c8MwKaIdUf5hdHRWSq4
X4m+rcHAtG41CwjATrL5vseBeS7s/EK2VIL7EgPMmiBGCVfpMP6CoiBZcjEg/sF2
J1cnq/9p1dkdwoI4/tgieM6WPwKBgQDk8tSH/adqIItRqD+VpUIk215U5Lz6WTYN
/rwZ69xPVRjbLc4JdxR95F1b/HH3lLhjYjlwudxdubn51kSzGDEWssVo1o+h2jv4
08yZJ1/BigIGBS5alIqISEduovZ+UoZB9+X/CnQjLJ8IHFFhJpm5b2Iaj8kqy+dJ
bF9FnXcA4QKBgQCq5Ptsck1nig2T7m3rvovY7EfCW60UfzKLZO4Lk7EcRrvm6RY4
c5BJzoYUXKE5qeaSe/mDJC9B7LFe35Exhe3sPQZS+To0GcwAe5stfe8ooyqSILW1
KdGL0Mzv5J9/x3i7iMXTBqh7FrmUV9Km61FOo0BNgYtunIZvrTboLGrMfQKBgDAY
DqtOjoeNtJZ/uHOwFnf1mRhOQKB6cw93jn4HfO0xXBpWwexdFnHnsfDr0+kFVcKS
1KwobvFFXZrs9tuEXnN9NFj0kZGXbXe0zkrx6XyXiBtJpVYj1AIS5OaJ1yvsHAXp
lGgCAymMaw/iGvpEiJBapIod4E1cLgbPfCf8jw4hAoGARuMShkTzMgrOclu+OWoI
V2J4zz/Aqu8Syz1wnLkFmJOUni5yZEtpRhP1ISc0rYlGhKWcNCpfcm3G9EqPAs4K
wNCdZiE4xDiZ7POhsUN0c4YEVrc+LcCneIyh5Wgd+hSWk1psJW2La078VIgd2l47
O2jTmeaB83H2ulP6pWTzQOU=
-----END PRIVATE KEY-----`;

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

    expect(jwtToken.getPayload().iss).toBe(Number.parseInt(appId));
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
  it("throws error when installation id is not a number", async () => {
    const inputInstallationId = "installation_id";

    await expect(
      getOctokit("private_key", "456", inputInstallationId)
    ).rejects.toThrow("installation_id is not a number");
  });
});

describe("getAllRepositoriesInOrganisation", () => {
  let loggerSpy: jest.SpyInstance;
  beforeEach(() => {
    loggerSpy = jest.spyOn(LambdaLogger.prototype, "debug");
  });

  const buildFakeOctokit = (resultToReturn: any[]) => {
    return {
      paginate: () => Promise.resolve(resultToReturn),
      rest: { repos: { listForOrg: jest.fn() } },
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
