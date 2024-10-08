import mongoose from "mongoose";
import { IRepoBranchProtection } from "./branchProtectionSchemas.js";
import { IRepoDependabot } from "./dependabotSchemas.js";
import { IGithubActionMinutes } from "./githubActionMinutesSchemas.js";
import { IRepo } from "./repoSchemas.js";
import { IRepoSonarcloud } from "./sonarcloudSchemas.js";
import { IUniqueContributors } from "./uniqueContributorsSchemas.js";

type RepoOmitted<T> = Omit<T, "repo">;

export interface IRepoMetrics {
  repo: IRepo;
  branchProtection: RepoOmitted<IRepoBranchProtection>;
  dependabot: RepoOmitted<IRepoDependabot>;
  githubActionMinutes: RepoOmitted<IGithubActionMinutes>;
  sonarcloud: RepoOmitted<IRepoSonarcloud>;
  uniqueContributors: RepoOmitted<IUniqueContributors>;
  [index: string]: any;
}

export const RepoMetricsSchema = new mongoose.Schema<IRepoMetrics>({
  repo: {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    full_name: { type: String, required: true },
    github_id: { type: Number, required: true },
    language: { type: String, required: true },
    node_id: { type: String, required: true },
    pushed_at: { type: String, required: true },
    repo_created_at: { type: String, required: true },
    repo_updated_at: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    visibility: { type: String, required: true },
    archived: { type: Boolean, required: true },
  },
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
    criticalDependabot: { type: Number, required: true, default: 0 },
    highDependabot: { type: Number, required: true, default: 0 },
    mediumDependabot: { type: Number, required: true, default: 0 },
    lowDependabot: { type: Number, required: true, default: 0 },
    dependabotScore: { type: String, required: true, default: "Grey" },
  },
  githubActionMinutes: {
    githubActionMinutes: { type: Number, required: true, default: 0 },
  },
  sonarcloud: {
    isEnabled: { type: Boolean, required: true },
    reliabilityRating: { type: String, required: true, default: null },
    securityRating: { type: String, required: true, default: null },
    sqaleRating: { type: String, required: true, default: null },
    codeCoverage: { type: Number, required: true, default: null },
    codeCoverageScore: { type: String, required: true, default: "Grey" },
    linesOfCode: { type: Number, required: true, default: null },
    bugs: { type: Number, required: true, default: null },
    codeSmells: { type: Number, required: true, default: null },
    duplicatedLinesDensity: { type: Number, required: true, default: null },
  },
  uniqueContributors: {
    contributors: {
      type: [String],
      required: true,
      validate: function (this: IRepoMetrics) {
        return (
          this.uniqueContributors.contributors.length ===
          this.uniqueContributors.numContributors
        );
      },
      default: [],
    },
    numContributors: { type: Number, required: true, default: 0 },
  },
});

export const RepoMetricsModel =
  mongoose.models.RepoMetrics ||
  mongoose.model<IRepoMetrics>("RepoMetrics", RepoMetricsSchema);
