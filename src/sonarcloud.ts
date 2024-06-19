import { log } from "winston";
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
      Authorization: `basic ${Buffer.from(sonarcloudApiToken, "utf8").toString(
        "base64"
      )}`,
    },
  };
  if (method === "post") {
    const response = await fetch(url, requestInit);
    if (response.status === 204) {
      return { success: true };
    }
    const responseParsed = await response.json();
    return checkResponse(responseParsed);
  }

  const allItems = [];
  const firstResponse = await fetch(url, requestInit);
  console.log;
  log("NOT POST", firstResponse);
  const firstResponseParsed = await firstResponse.json();

  const checkedResponse = checkResponse(firstResponseParsed);

  const requiresPaging = checkedResponse.paging;

  if (!requiresPaging) {
    return checkedResponse[itemKey];
  }

  const totalItems = checkedResponse.paging.total;
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
  const response = await makeSonarcloudPostRequest(
    "/user_groups/create",
    {
      organization: organisation,
      name: groupName,
    },
    sonarcloudApiToken
  );
  logger.info("ENGEXPUTILS001", response);
  return response.group.name;
};
