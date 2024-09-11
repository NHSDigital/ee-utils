import mongoose from "mongoose";
import { IRepoBranchProtection } from "./branchProtectionSchemas.js";
import { IRepoDependabot } from "./dependabotSchemas.js";
import { IGithubActionMinutes } from "./githubActionMinutesSchemas.js";
import { IRepo } from "./repoSchemas.js";
import { IRepoSonarcloud } from "./sonarcloudSchemas.js";
import { IUniqueContributors } from "./uniqueContributorsSchemas.js";

type RepoOmitted<T> = Omit<T, "repo">;

export interface IRepoMetrics
  extends Pick<IRepo, "full_name" | "size" | "archived"> {
  branchProtection: RepoOmitted<IRepoBranchProtection>;
  dependabot: RepoOmitted<IRepoDependabot>;
  githubActionMinutes: RepoOmitted<IGithubActionMinutes>;
  sonarcloud: RepoOmitted<IRepoSonarcloud>;
  uniqueContributors: RepoOmitted<IUniqueContributors>;
  [index: string]: any;
}

export const RepoMetricsSchema = new mongoose.Schema<IRepoMetrics>({
  archived: { type: Boolean, required: true },
  full_name: { type: String, required: true },
  size: { type: Number, required: true },
  branchProtection: {
    pullRequestRequired: { type: Boolean, required: true },
    approvalsRequired: { type: Boolean, required: true },
    stalePullRequestApprovalsDismissed: { type: Boolean, required: true },
    signaturesRequired: { type: Boolean, required: true },
    conversationResolutionRequired: { type: Boolean, required: true },
    compliance: { type: String, required: true },
  },
  dependabot: {
    dependabotEnabled: { type: Boolean, required: true },
    criticalDependabot: { type: Number, required: true },
    highDependabot: { type: Number, required: true },
    mediumDependabot: { type: Number, required: true },
    lowDependabot: { type: Number, required: true },
    dependabotScore: { type: String, required: true },
  },
  githubActionMinutes: {
    githubActionMinutes: { type: Number, required: true },
  },
  sonarcloud: {
    isEnabled: { type: Boolean, required: true },
    reliabilityRating: { type: String, required: true },
    securityRating: { type: String, required: true },
    sqaleRating: { type: String, required: true },
    codeCoverage: { type: Number, required: true },
    codeCoverageScore: { type: String, required: true },
    linesOfCode: { type: Number, required: true },
    bugs: { type: Number, required: true },
    codeSmells: { type: Number, required: true },
    duplicatedLinesDensity: { type: Number, required: true },
  },
  uniqueContributors: {
    contributors: { type: [String], required: true },
    numContributors: { type: Number, required: true },
  },
});

export const RepoMetricsModel =
  mongoose.models.RepoMetrics ||
  mongoose.model<IRepoMetrics>("RepoMetrics", RepoMetricsSchema);
