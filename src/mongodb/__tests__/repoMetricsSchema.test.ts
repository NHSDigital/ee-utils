import { describe, expect, it } from "vitest";
import { IRepoMetrics, RepoMetricsModel } from "../repoMetricsSchema.js";

describe("RepoMetricSchema", () => {
  const validRepoMetrics: IRepoMetrics = {
    full_name: "owner/Repo-Name",
    size: 10000,
    archived: false,
    branchProtection: {
      approvalsRequired: true,
      signaturesRequired: true,
      pullRequestRequired: true,
      stalePullRequestApprovalsDismissed: true,
      conversationResolutionRequired: true,
      compliance: "Green",
    },
    dependabot: {
      dependabotEnabled: true,
      dependabotScore: "Green",
      criticalDependabot: 0,
      highDependabot: 0,
      mediumDependabot: 0,
      lowDependabot: 0,
    },
    githubActionMinutes: {
      githubActionMinutes: 0,
    },
    sonarcloud: {
      bugs: 0,
      codeCoverage: 100,
      codeCoverageScore: "Green",
      codeSmells: 0,
      duplicatedLinesDensity: 0,
      isEnabled: true,
      linesOfCode: 50,
      reliabilityRating: "A",
      securityRating: "A",
      sqaleRating: "A",
    },
    uniqueContributors: {
      contributors: ["user1"],
      numContributors: 0,
    },
  };
  describe("validations", () => {
    it("should succeed with a valid model", () => {
      const validModel = new RepoMetricsModel(validRepoMetrics);
      expect(validModel.validateSync()).toBeUndefined();
      for (const key in validRepoMetrics) {
        expect(validModel[key]).toEqual(validRepoMetrics[key]);
      }
    });
    it.each([["archived"], ["full_name"], ["size"]])(
      "should fail if all top-level details are not provided",
      (field) => {
        const invalidModel = new RepoMetricsModel({
          ...validRepoMetrics,
          [field]: undefined,
        });

        const errors = invalidModel.validateSync();
        expect(errors).toBeDefined();
        expect(errors?.errors[field]).toBeDefined();
      }
    );
    it.each([
      ["branchProtection", "pullRequestRequired"],
      ["branchProtection", "approvalsRequired"],
      ["branchProtection", "stalePullRequestApprovalsDismissed"],
      ["branchProtection", "signaturesRequired"],
      ["branchProtection", "conversationResolutionRequired"],
      ["branchProtection", "compliance"],
      ["dependabot", "dependabotEnabled"],
      ["dependabot", "criticalDependabot"],
      ["dependabot", "highDependabot"],
      ["dependabot", "mediumDependabot"],
      ["dependabot", "lowDependabot"],
      ["dependabot", "dependabotScore"],
      ["githubActionMinutes", "githubActionMinutes"],
      ["sonarcloud", "isEnabled"],
      ["sonarcloud", "reliabilityRating"],
      ["sonarcloud", "securityRating"],
      ["sonarcloud", "sqaleRating"],
      ["sonarcloud", "codeCoverage"],
      ["sonarcloud", "codeCoverageScore"],
      ["sonarcloud", "linesOfCode"],
      ["sonarcloud", "bugs"],
      ["sonarcloud", "codeSmells"],
      ["sonarcloud", "duplicatedLinesDensity"],
      ["uniqueContributors", "numContributors"],
    ])(
      "should fail if all nested details are not provided %s.%s",
      (topLevelField, nestedField) => {
        const invalidModel = new RepoMetricsModel({
          ...validRepoMetrics,
          [topLevelField]: {
            ...validRepoMetrics[topLevelField],
            [nestedField]: undefined,
          },
        });
        const errors = invalidModel.validateSync();
        expect(errors).toBeDefined();
        expect(errors?.errors[`${topLevelField}.${nestedField}`]).toBeDefined();
      }
    );
  });
});
