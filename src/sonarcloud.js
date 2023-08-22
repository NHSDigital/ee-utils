import { LambdaLogger } from "./logger.js";

const logReferences = {
  ENGEXPUTILS001: "Sonarcloud Group Created",
  ENGEXPUTILS002: "Sonarcloud Group Would Be Created",
};
const logger = new LambdaLogger("ee-utils/sonarcloud", logReferences);

export const SONARCLOUD_BASE_URL = "https://sonarcloud.io/api";

export const makeSonarcloudAPICall = async (
  urlToCall,
  searchParams,
  sonarcloudApiToken,
  method = "get"
) => {
  const url = new URL(`${SONARCLOUD_BASE_URL}${urlToCall}`);
  url.search = new URLSearchParams(searchParams);

  return await fetch(url, {
    method,
    headers: {
      Authorization: `basic ${Buffer.from(sonarcloudApiToken, "utf8").toString(
        "base64"
      )}`,
    },
  });
};

export const getSonarcloudProjects = async (
  sonarcloudApiToken,
  sonarcloudOrganisationName
) => {
  const allProjects = [];
  let allPagesExplored = false;
  let pageCounter = 1;
  while (!allPagesExplored) {
    const sonarCloudProjects = await makeSonarcloudAPICall(
      "/components/search_projects",
      {
        p: pageCounter,
        organization: sonarcloudOrganisationName,
      },
      sonarcloudApiToken
    );
    const sonarCloudProjectsParsed = await sonarCloudProjects.json();
    const paging = sonarCloudProjectsParsed.paging;
    allPagesExplored =
      paging.pageIndex == paging.total || paging.pageSize > paging.total;
    pageCounter += 1;
    allProjects.push(...sonarCloudProjectsParsed.components);
  }
  return allProjects.map((project) => project.name);
};

export const createGroup = async (
  groupName,
  organisation,
  sonarcloudApiToken,
  dryRunMode = false
) => {
  if (dryRunMode) {
    logger.info("ENGEXPUTILS002", { group: groupName });
    return groupName;
  }
  const response = await makeSonarcloudAPICall(
    "/user_groups/create",
    {
      organization: organisation,
      name: groupName,
    },
    sonarcloudApiToken,
    "post"
  );
  const parsedResponse = await response.json();
  logger.info("ENGEXPUTILS001", parsedResponse);
  return parsedResponse.group.name;
};
