import { LambdaLogger } from "./logger.js";

const logReferences = {
  ENGEXPUTILS001: "Sonarcloud Group Created",
  ENGEXPUTILS002: "Sonarcloud Group Would Be Created",
  ENGEXPUTILS003: "Organisation doesn't exist in Sonarcloud",
};
const logger = new LambdaLogger("ee-utils/sonarcloud", logReferences);

export const SONARCLOUD_BASE_URL = "https://sonarcloud.io/api";
class NoOrganisationError extends Error {
  constructor(message) {
    super(message);
    this.name = "NoOrganisationError";
  }
}

export const checkForErrors = (response) => {
  if (response.errors) {
    throw response.errors;
  }
};

export const handleErrors = (errors) => {
  for (const error of errors) {
    if (error.msg.includes("No organization for key")) {
      logger.warn("ENGEXPUTILS003", { error });
      throw new NoOrganisationError(error.msg);
    }
  }
  throw new Error(errors);
};

export const makeSonarcloudAPICall = async (
  urlToCall,
  searchParams,
  sonarcloudApiToken,
  method = "get"
) => {
  const url = new URL(`${SONARCLOUD_BASE_URL}${urlToCall}`);
  url.search = new URLSearchParams(searchParams);
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `basic ${Buffer.from(sonarcloudApiToken, "utf8").toString(
        "base64"
      )}`,
    },
  });
  const responseParsed = await response.json();
  try {
    checkForErrors(responseParsed);
  } catch (errors) {
    handleErrors(errors);
  }

  return responseParsed;
};

export const getSonarcloudProjects = async (
  sonarcloudApiToken,
  sonarcloudOrganisationName
) => {
  const allProjects = [];
  let allPagesExplored = false;
  let pageCounter = 1;
  while (!allPagesExplored) {
    try {
      const sonarCloudProjects = await makeSonarcloudAPICall(
        "/components/search_projects",
        {
          p: pageCounter,
          organization: sonarcloudOrganisationName,
        },
        sonarcloudApiToken
      );
      const paging = sonarCloudProjects.paging;
      allPagesExplored =
        paging.pageIndex == paging.total || paging.pageSize > paging.total;
      pageCounter += 1;
      allProjects.push(...sonarCloudProjects.components);
    } catch (error) {
      if (error.name === "NoOrganisationError") {
        return [];
      }
      throw error;
    }
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
  logger.info("ENGEXPUTILS001", response);
  return response.group.name;
};
