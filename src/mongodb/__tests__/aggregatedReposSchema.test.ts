import { describe, expect, it } from "vitest";
import {
  AggregatedReposModel,
  IAggregatedRepo,
} from "../aggregatedReposSchema.js";

describe("AggregatedRepoSchema", () => {
  const validAggregatedRepo: IAggregatedRepo = {
    size: 200,
    averageCodeCoverage: 50,
    totalLinesOfCode: 2,
    averageBugs: 3,
    averageCodeSmells: 5.5,
    averageSecurityRating: "B",
    averageReliabilityRating: "C",
    averageSqaleRating: "C",
    proportionGreenRepos: 0.5,
    proportionAmberRepos: 0.5,
    proportionRedRepos: 0,
    criticalDependabot: 2,
    highDependabot: 5,
    mediumDependabot: 11,
    lowDependabot: 31,
    proportionDependabotEnabled: 1,
    overallServiceHealth: "Amber",
    hierarchyItem: "some_hierarchy",
  };
  describe("validations", () => {
    it("should succeed with a valid model", () => {
      const validModel = new AggregatedReposModel(validAggregatedRepo);
      expect(validModel.validateSync()).toBeUndefined();
      for (const key in validAggregatedRepo) {
        expect(validModel[key]).toEqual(validAggregatedRepo[key]);
      }
    });
    it.each(Object.keys(validAggregatedRepo).map((k) => [k]))(
      "should fail if all top-level details are not provided",
      (field) => {
        const invalidModel = new AggregatedReposModel({
          ...validAggregatedRepo,
          [field]: undefined,
        });

        const errors = invalidModel.validateSync();
        expect(errors).toBeDefined();
        expect(errors?.errors[field]).toBeDefined();
      }
    );
    it("should create a document with timestamps", async () => {
      const validModel = new AggregatedReposModel(validAggregatedRepo);

      const insertedDocument = await AggregatedReposModel.create(validModel);

      expect(insertedDocument.document_created_at).toBeDefined();
    });
  });
});
