import { describe, expect, it } from "vitest";
import { IRepoMetrics, RepoMetricsModel } from "../repoMetricsSchema.js";

describe("RepoMetricSchema", () => {
  const validRepoMetrics: IRepoMetrics = {
    repo: {
      name: "repo1",
      owner: "owner1",
      full_name: "owner/Repo-Name",
      github_id: 1,
      language: "JavaScript",
      node_id: "node_id",
      pushed_at: "2021-08-01T00:00:00Z",
      repo_created_at: "2021-08-01T00:00:00Z",
      repo_updated_at: "2021-08-01T00:00:00Z",
      size: 100,
      url: "https://api.github.com/repos/owner1/repo1",
      visibility: "public",
      archived: false,
    },
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
      numContributors: 1,
    },
  };
  const validationProperties = JSON.parse(JSON.stringify(validRepoMetrics));
  delete validationProperties.dependabot.dependabotScore;
  delete validationProperties.dependabot.criticalDependabot;
  delete validationProperties.dependabot.highDependabot;
  delete validationProperties.dependabot.mediumDependabot;
  delete validationProperties.dependabot.lowDependabot;
  delete validationProperties.githubActionMinutes.githubActionMinutes;
  delete validationProperties.sonarcloud.codeCoverageScore;
  delete validationProperties.uniqueContributors.numContributors;
  delete validationProperties.uniqueContributors.contributors;
  describe("validations", () => {
    it("should succeed with a valid model", () => {
      const validModel = new RepoMetricsModel(validRepoMetrics);
      expect(validModel.validateSync()).toBeUndefined();
      for (const key in validRepoMetrics) {
        expect(validModel[key]).toEqual(validRepoMetrics[key]);
      }
    });
    it.each(
      Object.entries(validationProperties).flatMap(([key, value]) => [
        // @ts-ignore
        ...Object.keys(value).map((subkey) => [key, subkey]),
      ])
    )(
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
