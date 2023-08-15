type SonarCloudProject = {
  name: string;
  isPublic: boolean;
};

export declare const makeSonarcloudAPICall = async (
  urlToCall: string,
  searchParams: object,
  sonarcloudApiToken: string,
  method: string = "get"
): Promise<Response> => {};

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
