import { Octokit } from "@octokit/rest";
import { App } from "octokit";
import { logReferences } from "./logReferences";
import { LambdaLogger } from "./logger";
import { getParameter } from "./parameters";

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

export const octokitApp = (
  appId: string,
  privateKey: string,
  octokitOptions: any
): App => {
  return new App({
    appId,
    privateKey,
    Octokit: Octokit.defaults(octokitOptions),
  });
};

export const getOctokit = async (
  privateKey: string,
  appId: string,
  installationId: string,
  octokitOptions: any = {},
  getParameterFn: typeof getParameter = getParameter
): Promise<Octokit> => {
  const GITHUB_PRIVATE_KEY = (await getParameterFn(privateKey, true)) ?? "";
  const GITHUB_APP_ID = (await getParameterFn(appId)) ?? "";
  const GITHUB_INSTALLATION_ID = (await getParameterFn(installationId)) ?? "0";
  logger.debug("ENGEXPUTILS009", {
    GITHUB_APP_ID,
    GITHUB_INSTALLATION_ID,
  });

  const app = octokitApp(GITHUB_APP_ID, GITHUB_PRIVATE_KEY, octokitOptions);

  logger.debug("ENGEXPUTILS010");
  const parsedInstallationId = parseInt(GITHUB_INSTALLATION_ID);
  if (isNaN(parsedInstallationId)) {
    throw new Error("installation_id is not a number");
  }

  return app.getInstallationOctokit(parsedInstallationId) as unknown as Octokit;
};

export const getAllRepositoriesInOrganisation = async (
  octokit: Octokit,
  organisationName: string,
  filterFn?: (repo: any) => boolean
) => {
  logger.debug("ENGEXPUTILS011", {
    organisationName,
  });
  const orgRepos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org: organisationName,
    per_page: 100,
  });

  filterFn ??= () => true;
  return orgRepos.filter(filterFn).map((repo) => repo.name);
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
