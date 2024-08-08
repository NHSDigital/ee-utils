import mongoose from "mongoose";
import { IRepoBranchProtection } from "./branchProtectionSchemas";
import { IRepoDependabot } from "./dependabotSchemas";
import { IGithubActionMinutes } from "./githubActionMinutesSchemas";
import { IRepo } from "./repoSchemas";
import { IRepoSonarcloud } from "./sonarcloudSchemas";
import { IUniqueContributors } from "./uniqueContributorsSchemas";

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
    dependabotEnabled: { type: Boolean },
    criticalDependabot: { type: Number },
    highDependabot: { type: Number },
    mediumDependabot: { type: Number },
    lowDependabot: { type: Number },
    dependabotScore: { type: String, default: "Grey" },
  },
  githubActionMinutes: {
    githubActionMinutes: { type: Number },
  },
  sonarcloud: {
    isEnabled: { type: Boolean },
    reliabilityRating: { type: String },
    securityRating: { type: String },
    sqaleRating: { type: String },
    codeCoverage: { type: Number },
    codeCoverageScore: { type: String },
    linesOfCode: { type: Number },
    bugs: { type: Number },
    codeSmells: { type: Number },
    duplicatedLinesDensity: { type: Number },
  },
  uniqueContributors: {
    contributors: { type: Array<String> },
    numContributors: { type: Number },
  },
});

export const RepoMetricsModel =
  mongoose.models.RepoMetrics ||
  mongoose.model<IRepoMetrics>("RepoMetrics", RepoMetricsSchema);
