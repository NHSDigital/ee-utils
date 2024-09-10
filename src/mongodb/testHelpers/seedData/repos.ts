import { MetricRating } from "../../stateTypes.js";

const createDependabot = (repo: string) => ({
  repo: `ORG/${repo}`,
  dependabotEnabled: true,
  criticalDependabot: Math.floor(Math.random() * 10),
  highDependabot: Math.floor(Math.random() * 10),
  mediumDependabot: Math.floor(Math.random() * 10),
  lowDependabot: Math.floor(Math.random() * 10),
});

const createBranchProtection = (repo: string) => ({
  repo: `ORG/${repo}`,
  pullRequestRequired: Math.random() >= 0.5,
  approvalsRequired: Math.random() >= 0.5,
  stalePullRequestApprovalsDismissed: Math.random() >= 0.5,
  signaturesRequired: Math.random() >= 0.5,
  conversationResolutionRequired: Math.random() >= 0.5,
});

const createGithubActionMinutes = (repo: string) => ({
  repo: `ORG/${repo}`,
  githubActionMinutes: Math.floor(Math.random() * 100),
});

const createRepo = (node_id: string, name: string, date: string) => ({
  github_id: Math.floor(Math.random() * 10),
  node_id,
  name,
  full_name: `ORG/${name}`,
  owner: "ORG",
  visibility: Math.random() >= 0.5 ? "private" : "public",
  language: Math.random() >= 0.5 ? "typescript" : "python",
  size: Math.floor(Math.random() * 100),
  pushed_at: date,
  repo_created_at: date,
  repo_updated_at: date,
  archived: Math.random() >= 0.5,
  url: `${name}.com`,
});

const generateRandomRating = () => {
  const ratings: Array<MetricRating> = ["A", "B", "C", "D", "E"];
  return ratings[Math.floor(Math.random() * ratings.length)];
};

const createSonarcloud = (repo: string) => ({
  repo: `ORG/${repo}`,
  isEnabled: true,
  reliabilityRating: generateRandomRating(),
  securityRating: generateRandomRating(),
  sqaleRating: generateRandomRating(),
  codeCoverage: Math.floor(Math.random() * 100),
  linesOfCode: Math.floor(Math.random() * 100),
  bugs: Math.floor(Math.random() * 10),
  codeSmells: Math.floor(Math.random() * 10),
  duplicatedLinesDensity: Math.floor(Math.random() * 10),
});

const createUniqueContributors = (repo: string) => ({
  repo: `ORG/${repo}`,
  contributors: ["user1", "user2"],
  numContributors: Math.floor(Math.random() * 10),
});

const createHierarchy = (repo: string, isUnallocated = false) => {
  return {
    repo: `ORG/${repo}`,
    directorate: isUnallocated ? "Unallocated" : "Directorate 1",
    function_name: isUnallocated ? "Unallocated" : "Function 1",
    subdirectorate: isUnallocated ? "Unallocated" : "Subdirectorate 1",
    area: isUnallocated ? "Unallocated" : "Area 1",
    service: isUnallocated ? "Unallocated" : "Service 1",
  };
};

const REPO_1_NAME = "REPO_1";
export const HISTORICAL_REPO_1 = {
  dependabot: createDependabot(REPO_1_NAME),
  branchProtection: createBranchProtection(REPO_1_NAME),
  githubActionMinutes: createGithubActionMinutes(REPO_1_NAME),
  repo: createRepo("node_id_1", REPO_1_NAME, "2021-01-01"),
  sonarcloud: createSonarcloud(REPO_1_NAME),
  uniqueContributors: createUniqueContributors(REPO_1_NAME),
  hierarchy: createHierarchy(REPO_1_NAME),
};

export const REPO_1 = {
  ...HISTORICAL_REPO_1,
  repo: {
    ...HISTORICAL_REPO_1.repo,
    size: 999,
    language: "rust",
  },
};

const REPO_2_NAME = "REPO_2";
export const REPO_2 = {
  dependabot: createDependabot(REPO_2_NAME),
  branchProtection: createBranchProtection(REPO_2_NAME),
  githubActionMinutes: createGithubActionMinutes(REPO_2_NAME),
  repo: createRepo("node_id_2", REPO_2_NAME, "2021-01-02"),
  sonarcloud: createSonarcloud(REPO_2_NAME),
  uniqueContributors: createUniqueContributors(REPO_2_NAME),
  hierarchy: createHierarchy(REPO_2_NAME, true),
};

const REPO_3_NAME = "REPO_3";
export const REPO_3 = {
  dependabot: createDependabot(REPO_3_NAME),
  branchProtection: createBranchProtection(REPO_3_NAME),
  githubActionMinutes: createGithubActionMinutes(REPO_3_NAME),
  repo: createRepo("node_id_3", REPO_3_NAME, "2021-01-03"),
  sonarcloud: createSonarcloud(REPO_3_NAME),
  uniqueContributors: createUniqueContributors(REPO_3_NAME),
  hierarchy: createHierarchy(REPO_3_NAME),
};

const REPO_4_NAME = "REPO_4";
export const REPO_4 = {
  dependabot: createDependabot(REPO_4_NAME),
  branchProtection: createBranchProtection(REPO_4_NAME),
  githubActionMinutes: createGithubActionMinutes(REPO_4_NAME),
  repo: createRepo("node_id_4", REPO_4_NAME, "2021-01-04"),
  sonarcloud: createSonarcloud(REPO_4_NAME),
  uniqueContributors: createUniqueContributors(REPO_4_NAME),
  hierarchy: createHierarchy(REPO_4_NAME),
};
