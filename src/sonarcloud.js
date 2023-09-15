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
  itemKey,
  method = "get"
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
    return await response.json();
  }

  const allItems = [];
  const firstResponse = await fetch(url, requestInit);

  const firstResponseParsed = await firstResponse.json();
  const totalItems = firstResponseParsed.paging.total;
  allItems.push(...firstResponseParsed[itemKey]);
  let pageCounter = 2;

  while (allItems.length < totalItems) {
    searchParams.p = pageCounter;
    url.search = new URLSearchParams(searchParams);

    const response = await fetch(url, requestInit);

    const responseParsed = await response.json();
    allItems.push(...responseParsed[itemKey]);
    pageCounter++;
  }
  return allItems;
};

export const getSonarcloudProjects = async (
  sonarcloudApiToken,
  sonarcloudOrganisationName
) => {
  const sonarCloudProjects = await makeSonarcloudAPICall(
    "/components/search_projects",
    {
      organization: sonarcloudOrganisationName,
    },
    sonarcloudApiToken,
    "components"
  );
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
  const parsedResponse = await makeSonarcloudAPICall(
    "/user_groups/create",
    {
      organization: organisation,
      name: groupName,
    },
    sonarcloudApiToken,
    "group",
    "post"
  );
  logger.info("ENGEXPUTILS001", parsedResponse);
  return parsedResponse.group.name;
};
