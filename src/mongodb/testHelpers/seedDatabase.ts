import mongoose from "mongoose";
import { RepoBranchProtectionModel } from "../branchProtectionSchemas";
import { RepoDependabotModel } from "../dependabotSchemas";
import { GithubActionMinutesModel } from "../githubActionMinutesSchemas";
import { HierarchyModel } from "../hierarchySchemas";
import { RepoModel } from "../repoSchemas";
import { RepoSonarcloudModel } from "../sonarcloudSchemas";
import { UniqueContributorsModel } from "../uniqueContributorsSchemas";
import { AREA_1, AREA_2, AREA_3, AREA_4 } from "./seedData/areas";
import {
  DIRECTORATE_1,
  DIRECTORATE_2,
  UNALLOCATED,
} from "./seedData/directorates";
import {
  FUNCTION_1,
  FUNCTION_2,
  FUNCTION_3,
  FUNCTION_4,
} from "./seedData/functions";
import {
  HISTORICAL_REPO_1,
  REPO_1,
  REPO_2,
  REPO_3,
  REPO_4,
} from "./seedData/repos";
import {
  SERVICE_1,
  SERVICE_2,
  SERVICE_3,
  SERVICE_4,
} from "./seedData/services";
import {
  SUBDIRECTORATE_1,
  SUBDIRECTORATE_2,
  SUBDIRECTORATE_3,
  SUBDIRECTORATE_4,
} from "./seedData/subdirectorates";

export const seedDatabase = async (uri: string) => {
  await mongoose.connect(uri);
  await insertRepos();
  await insertDirectorates();
  await insertFunctions();
  await insertSubdirectorates();
  await insertAreas();
  await insertServices();
  await mongoose.disconnect();
};

export const insertRepos = async () => {
  await RepoModel.insertMany([
    HISTORICAL_REPO_1.repo,
    REPO_2.repo,
    REPO_3.repo,
    REPO_4.repo,
  ]);
  await RepoDependabotModel.insertMany([
    HISTORICAL_REPO_1.dependabot,
    REPO_2.dependabot,
    REPO_3.dependabot,
    REPO_4.dependabot,
  ]);
  await RepoBranchProtectionModel.insertMany([
    HISTORICAL_REPO_1.branchProtection,
    REPO_2.branchProtection,
    REPO_3.branchProtection,
    REPO_4.branchProtection,
  ]);
  await GithubActionMinutesModel.insertMany([
    HISTORICAL_REPO_1.githubActionMinutes,
    REPO_2.githubActionMinutes,
    REPO_3.githubActionMinutes,
    REPO_4.githubActionMinutes,
  ]);
  await RepoSonarcloudModel.insertMany([
    HISTORICAL_REPO_1.sonarcloud,
    REPO_2.sonarcloud,
    REPO_3.sonarcloud,
    REPO_4.sonarcloud,
  ]);
  await UniqueContributorsModel.insertMany([
    HISTORICAL_REPO_1.uniqueContributors,
    REPO_2.uniqueContributors,
    REPO_3.uniqueContributors,
    REPO_4.uniqueContributors,
  ]);
  await HierarchyModel.insertMany([
    HISTORICAL_REPO_1.hierarchy,
    REPO_2.hierarchy,
    REPO_3.hierarchy,
    REPO_4.hierarchy,
  ]);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await RepoModel.insertMany([REPO_1.repo]);

  await RepoDependabotModel.insertMany([REPO_1.dependabot]);
  await RepoBranchProtectionModel.insertMany([REPO_1.branchProtection]);
  await GithubActionMinutesModel.insertMany([REPO_1.githubActionMinutes]);
  await RepoSonarcloudModel.insertMany([REPO_1.sonarcloud]);
  await UniqueContributorsModel.insertMany([REPO_1.uniqueContributors]);
  await HierarchyModel.insertMany([REPO_1.hierarchy]);
};

export const insertDirectorates = async () => {
  await HierarchyModel.insertMany([DIRECTORATE_1, DIRECTORATE_2, UNALLOCATED]);
};

export const insertFunctions = async () => {
  await HierarchyModel.insertMany([
    FUNCTION_1,
    FUNCTION_2,
    FUNCTION_3,
    FUNCTION_4,
  ]);
};

export const insertSubdirectorates = async () => {
  await HierarchyModel.insertMany([
    SUBDIRECTORATE_1,
    SUBDIRECTORATE_2,
    SUBDIRECTORATE_3,
    SUBDIRECTORATE_4,
  ]);
};
export const insertAreas = async () => {
  await HierarchyModel.insertMany([AREA_1, AREA_2, AREA_3, AREA_4]);
};

export const insertServices = async () => {
  await HierarchyModel.insertMany([SERVICE_1, SERVICE_2, SERVICE_3, SERVICE_4]);
};
