import { LambdaLogger } from "./logger.js";

const logReferences = {
  ENGEXPUTILS001: "Sonarcloud Group Created",
  ENGEXPUTILS002: "Sonarcloud Group Would Be Created",
  ENGEXPUTILS003: "Organisation doesn't exist in Sonarcloud",
  ENGEXPUTILS004: "Sonarcloud API Call Errored",
  ENGEXPUTILS005: "Project could not be found",
};
const logger = new LambdaLogger("ee-utils/sonarcloud", logReferences);

export const SONARCLOUD_BASE_URL = "https://sonarcloud.io/api";
export class NoOrganisationError extends Error {
  constructor(message) {
    super(message);
    this.name = "NoOrganisationError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

export const checkForErrors = (response) => {
  if (response.errors) {
    logger.error("ENGEXPUTILS004", { response });
    throw response.errors;
  }
};

export const handleErrors = (errors) => {
  for (const error of errors) {
    if (error.msg.includes("No organization for key")) {
      logger.warn("ENGEXPUTILS003", { error });
      throw new NoOrganisationError(error.msg);
    }
    if (
      error.msg.includes("Component key") &&
      error.msg.includes("not found")
    ) {
      logger.warn("ENGEXPUTILS005", { error });
      throw new ProjectNotFoundError(error.msg);
    }
  }
  throw errors;
};

export const checkResponse = (response) => {
  try {
    checkForErrors(response);
  } catch (errors) {
    handleErrors(errors);
  }

  return response;
};

export const makeSonarcloudGetCall = async (
  urlToCall,
  searchParams,
  sonarcloudApiToken,
  itemKey
) => {
  return await makeSonarcloudAPICall(
    urlToCall,
    searchParams,
    sonarcloudApiToken,
    itemKey,
    "get"
  );
};

export const makeSonarcloudPostCall = async (
  urlToCall,
  searchParams,
  sonarcloudApiToken
) => {
  return await makeSonarcloudAPICall(
    urlToCall,
    searchParams,
    sonarcloudApiToken,
    "",
    "post"
  );
};

export const makeSonarcloudAPICall = async (
  urlToCall,
  searchParams,
  sonarcloudApiToken,
  itemKey,
  method
) => {
  const url = new URL(`${SONARCLOUD_BASE_URL}${urlToCall}`);
  url.search = new URLSearchParams(searchParams);
  const requestInit = {
    method,
    headers: {
      Authorization: `basic ${Buffer.from(sonarcloudApiToken, "utf8").toString(
        "base64"
      )}`,
    },
  };

  if (method === "post") {
    const response = await fetch(url, requestInit);
    const responseParsed = await response.json();
    return checkResponse(responseParsed);
  }

  const allItems = [];
  const firstResponse = await fetch(url, requestInit);
  const firstResponseParsed = await firstResponse.json();

  const checkedResponse = checkResponse(firstResponseParsed);

  const totalItems = checkedResponse.paging.total;
  allItems.push(...checkedResponse[itemKey]);
  let pageCounter = 2;

  while (allItems.length < totalItems) {
    searchParams.p = pageCounter;
    url.search = new URLSearchParams(searchParams);

    const response = await fetch(url, requestInit);
    const responseParsed = await response.json();

    const checkedResponse = checkResponse(responseParsed);

    allItems.push(...checkedResponse[itemKey]);
    pageCounter++;
  }
  return allItems;
};

export const getSonarcloudProjects = async (
  sonarcloudApiToken,
  sonarcloudOrganisationName
) => {
  let sonarCloudProjects = [];
  try {
    sonarCloudProjects = await makeSonarcloudGetCall(
      "/components/search_projects",
      {
        organization: sonarcloudOrganisationName,
      },
      sonarcloudApiToken,
      "components"
    );
  } catch (error) {
    if (error.name === "NoOrganisationError") {
      return [];
    }
    throw error;
  }
  return sonarCloudProjects.map((project) => project.name);
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
  const parsedResponse = await makeSonarcloudPostCall(
    "/user_groups/create",
    {
      organization: organisation,
      name: groupName,
    },
    sonarcloudApiToken
  );
  logger.info("ENGEXPUTILS001", parsedResponse);
  return parsedResponse.group.name;
};
