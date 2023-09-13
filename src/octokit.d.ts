import { Octokit } from "@octokit/rest";

export declare const getOctokit = async (
  privateKey: string,
  appId: string,
  installationId: string
): Promise<Octokit> => {};

export declare const getNormalPrivilegeOctokit =
  async (): Promise<Octokit> => {};

export declare const getElevatedPrivilegeOctokit =
  async (): Promise<Octokit> => {};

export declare const getRepoMetaDataBotOctokit =
  async (): Promise<Octokit> => {};

export declare const getAllRepositoriesInOrganisation = async (
  octokit: Octokit,
  organisationName: string
): Promise<Array<string>> => {};

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
};
