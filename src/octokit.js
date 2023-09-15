import { App } from "octokit";
import { getParameter } from "./parameters.js";

export const getOctokit = async (privateKey, appId, installationId) => {
  const GITHUB_PRIVATE_KEY = await getParameter(privateKey, true);
  const GITHUB_APP_ID = await getParameter(appId);
  const GITHUB_INSTALLATION_ID = await getParameter(installationId);
  const app = new App({ appId: GITHUB_APP_ID, privateKey: GITHUB_PRIVATE_KEY });
  return app.getInstallationOctokit(GITHUB_INSTALLATION_ID);
};

export const getAllRepositoriesInOrganisation = async (
  octokit,
  organisationName
) => {
  const orgRepos = await octokit.paginate("GET /orgs/{org}/repos{?per_page}", {
    org: organisationName,
    per_page: 100,
  });
  return orgRepos.map((repo) => repo.name);
};

export const getTeamsForRepositoriesInOrganisation = async (
  octokit,
  organisation
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

export const getTeamsForRepo = async (octokit, organisation, repo_name) => {
  const repoTeamData = await octokit.paginate(
    "GET /repos/{owner}/{repo}/teams{?per_page}",
    {
      owner: organisation,
      repo: repo_name,
      per_page: 100,
    }
  );
  const team = repoTeamData.map((data) => ({
    slug: data.slug,
    permission: data.permission,
    permissions: data.permissions,
  }));
  return { [repo_name]: team };
};

export const getContributorsForRepo = async (
  octokit,
  organisation,
  repo_name,
  since
) => {
  const repoContributorsData = await octokit.paginate(
    "GET /repos/{owner}/{repo}/contributors{?per_page,since}",
    {
      owner: organisation,
      repo: repo_name,
      per_page: 100,
      since: since,
    }
  );

  return new Set(repoContributorsData.map((contributor) => contributor.login));
};
