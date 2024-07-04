import { logReferences } from "./logReferences";
import { LambdaLogger } from "./logger";

const logger = new LambdaLogger("ee-utils/sonarcloud", logReferences);

export const SONARCLOUD_BASE_URL = "https://sonarcloud.io/api";
export class NoOrganisationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoOrganisationError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

export const checkForErrors = (response: any) => {
  if (response.errors) {
    logger.error("ENGEXPUTILS004", { response });
    throw response.errors;
  }
};

type SonarcloudError = {
  message?: string;
  msg?: string;
};

export const handleErrors = (errors: SonarcloudError[]) => {
  for (let error of errors) {
    if (!(error.message || error.msg)) {
      throw new Error(`Error message not found: ${error}`);
    }
    const errorMessage = error.message || error.msg;
    if (errorMessage?.includes("No organization for key")) {
      logger.warn("ENGEXPUTILS003", { error });
      throw new NoOrganisationError(errorMessage);
    }
    if (
      errorMessage?.includes("Component key") &&
      errorMessage.includes("not found")
    ) {
      logger.warn("ENGEXPUTILS005", { error });
      throw new ProjectNotFoundError(errorMessage);
    }
  }
  throw errors;
};

export const checkResponse = (response: any) => {
  try {
    checkForErrors(response);
  } catch (errors) {
    handleErrors(errors as SonarcloudError[]);
  }

  return response;
};

export const makeSonarcloudGetRequest = async (
  urlToCall: string,
  searchParams: Record<string, string>,
  sonarcloudApiToken: string,
  itemKey: string
) => {
  return await makeSonarcloudAPICall(
    urlToCall,
    searchParams,
    sonarcloudApiToken,
    itemKey,
    "get"
  );
};

export const makeSonarcloudPostRequest = async (
  urlToCall: string,
  searchParams: Record<string, string>,
  sonarcloudApiToken: string
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
  urlToCall: string,
  searchParams: Record<string, string>,
  sonarcloudApiToken: string,
  itemKey: string,
  method: string
) => {
  const url = new URL(`${SONARCLOUD_BASE_URL}${urlToCall}`);
  url.search = new URLSearchParams(searchParams).toString();
  const requestInit = {
    method,
    headers: {
      Authorization: `Bearer ${sonarcloudApiToken}`,
    },
  };
  if (method === "post") {
    let response;
    try {
      response = await fetch(url, requestInit);
      if (response.status === 204) {
        return { success: true };
      } else if (response.status >= 400) {
        logger.error("ENGEXPUTILS018", { response });
        return { success: false };
      }
    } catch (error) {
      logger.error("ENGEXPUTILS015", { error });
      return { success: false };
    }
    const responseParsed = await (response as Response).json();
    return checkResponse(responseParsed);
  }

  const allItems = [];
  let firstResponse;
  try {
    firstResponse = await fetch(url, requestInit);
    if (firstResponse.status >= 400) {
      logger.error("ENGEXPUTILS015", { response: firstResponse });
      return { success: false };
    }
  } catch (e: any) {
    logger.error("ENGEXPUTILS015", { error: e.message });
    return { success: false };
  }
  const firstResponseParsed = await firstResponse.json();

  const checkedResponse = checkResponse(firstResponseParsed);
  const requiresPaging = checkedResponse.paging || checkedResponse.p;

  if (!requiresPaging) {
    return checkedResponse[itemKey];
  }

  const totalItems = checkedResponse.paging
    ? checkedResponse.paging.total
    : checkedResponse.total;
  allItems.push(...checkedResponse[itemKey]);
  let pageCounter = 2;

  while (allItems.length < totalItems) {
    searchParams.p = pageCounter.toString();
    url.search = new URLSearchParams(searchParams).toString();

    const response = await fetch(url, requestInit);
    const responseParsed = await response.json();

    const checkedResponse = checkResponse(responseParsed);

    allItems.push(...checkedResponse[itemKey]);
    pageCounter++;
  }
  return allItems;
};

type SonarcloudProject = {
  name: string;
  visibility: string;
};

export const getSonarcloudProjects = async (
  sonarcloudApiToken: string,
  sonarcloudOrganisationName: string
) => {
  let sonarCloudProjects = [];
  try {
    sonarCloudProjects = await makeSonarcloudGetRequest(
      "/components/search_projects",
      {
        organization: sonarcloudOrganisationName,
      },
      sonarcloudApiToken,
      "components"
    );
  } catch (error: unknown) {
    if (error instanceof NoOrganisationError) {
      return [];
    }
    throw error;
  }
  return sonarCloudProjects.map((project: SonarcloudProject) => project.name);
};

export const createGroup = async (
  groupName: string,
  organisation: string,
  sonarcloudApiToken: string,
  dryRunMode = false
) => {
  if (dryRunMode) {
    logger.info("ENGEXPUTILS002", { group: groupName });
    return groupName;
  }
  logger.info("ENGEXPUTILS016", { group: groupName });
  const response = await makeSonarcloudPostRequest(
    "/user_groups/create",
    {
      organization: organisation,
      name: groupName,
    },
    sonarcloudApiToken
  );
  if (response.hasOwnProperty("success") && !response.success) {
    logger.error("ENGEXPUTILS017", { response, group: groupName });
    throw new Error("Failed to create group");
  }
  logger.info("ENGEXPUTILS001", { response, group: groupName });
  return response.group.name;
};
