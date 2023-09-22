type SonarCloudProject = {
  name: string;
  isPublic: boolean;
};

export declare const makeSonarcloudGetRequest = async (
  urlToCall: string,
  searchParams: object,
  sonarcloudApiToken: string,
  itemKey: string
): Promise<Array> => {};

export declare const makeSonarcloudPostRequest = async (
  urlToCall: string,
  searchParams: object,
  sonarcloudApiToken: string
): Promise<Array> => {};

export declare const makeSonarcloudAPICall = async (
  urlToCall: string,
  searchParams: object,
  sonarcloudApiToken: string,
  itemKey: string,
  method: string
): Promise<Array> => {};

export declare const getSonarcloudProjects = async (
  sonarcloudApiToken: string,
  sonarcloudOrganisationName: string
): Promise<Array<SonarCloudProject>> => {};

export declare const createGroup = async (
  groupName: string,
  organisation: string,
  sonarcloudApiToken: string,
  dryRunMode: boolean = false
): Promise<string> => {};

export declare class NoOrganisationError extends Error {
  constructor(message: string);
}
export declare class ProjectNotFoundError extends Error {
  constructor(message: string);
}
