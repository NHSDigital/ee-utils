import { Octokit } from "@octokit/rest";
import { App } from "octokit";
import { getParameter } from "./parameters";
import { LambdaLogger } from "./logger";
import { logReferences } from "./logReferences";

export type OrgInfo = {
  orgName: string;
  appId: string;
  privateKey: string;
  installationId: string;
  elevatedAppId: string;
  elevatedPrivateKey: string;
  elevatedInstallationId: string;
  repoMetaDataAppId: string;
  repoMetaDataPrivateKey: string;
  repoMetaDataInstallationId: string;
  sonarcloudToken: string;
  sonarcloudOrgName: string;
};

const logger = new LambdaLogger("ee-utils/octokit", logReferences);

export const getOctokit = async (
  privateKey: string,
  appId: string,
  installationId: string
): Promise<Octokit> => {
  const GITHUB_PRIVATE_KEY = (await getParameter(privateKey, true)) ?? "";
  const GITHUB_APP_ID = (await getParameter(appId)) ?? "";
  const GITHUB_INSTALLATION_ID = (await getParameter(installationId)) ?? "0";
  logger.info("ENGEXPUTILS009", {
    GITHUB_PRIVATE_KEY,
    GITHUB_APP_ID,
    GITHUB_INSTALLATION_ID,
  });
  const app = new App({ appId: GITHUB_APP_ID, privateKey: GITHUB_PRIVATE_KEY });
  logger.info("ENGEXPUTILS010", { app });
  const parsedInstallationId = parseInt(GITHUB_INSTALLATION_ID);
  if (isNaN(parsedInstallationId)) {
    throw new Error("installation_id is not a number");
  }
  return app.getInstallationOctokit(parsedInstallationId) as unknown as Octokit;
};

export const getAllRepositoriesInOrganisation = async (
  octokit: Octokit,
  organisationName: string
) => {
  const orgRepos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org: organisationName,
    per_page: 100,
  });
  return orgRepos.map((repo) => repo.name);
};

export const getTeamsForRepositoriesInOrganisation = async (
  octokit: Octokit,
  organisation: string
) => {
  const names = await getAllRepositoriesInOrganisation(octokit, organisation);
  const teamsPromise = names.map((name) =>
    getTeamsForRepo(octokit, organisation, name)
  );
  const results = await Promise.all(teamsPromise);
  return results.reduce((prev, data) => {
    return { ...prev, ...data };
  }, {});
};

export const getTeamsForRepo = async (
  octokit: Octokit,
  organisation: string,
  repo_name: string
) => {
  const repoTeamData = await octokit.paginate(octokit.rest.repos.listTeams, {
    owner: organisation,
    repo: repo_name,
    per_page: 100,
  });
  const team = repoTeamData.map((data) => ({
    slug: data.slug,
    permission: data.permission,
    permissions: data.permissions,
  }));
  return { [repo_name]: team };
};

export const getContributorsForRepo = async (
  octokit: Octokit,
  organisation: string,
  repo_name: string,
  since: string
) => {
  const repoContributorsData = await octokit.paginate(
    octokit.rest.repos.listContributors,
    {
      owner: organisation,
      repo: repo_name,
      per_page: 100,
      since: since,
    }
  );

  return new Set(repoContributorsData.map((contributor) => contributor.login));
};
