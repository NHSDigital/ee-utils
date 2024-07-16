import mongoose, { SchemaDefinitionProperty } from "mongoose";
import {
  IRepoSonarcloud,
  RepoSonarcloudModel,
  RepoSonarcloudSchema,
  calculateCodeCoverageScore,
  createSonarcloudMetricSchema,
  validateSonarcloudMetric,
} from "../sonarcloudSchemas";
import { cleanDatabase, connectToDatabase } from "../testHelpers/helper";

beforeAll(async () => {
  await cleanDatabase(process.env.MONGODB_URI!);
  await connectToDatabase(process.env.MONGODB_URI!);
});

afterAll(async () => {
  await mongoose.disconnect();
});
describe("validateSonarcloudMetric", () => {
  it("should return false if sonarcloud is disabled and the metric is not null", () => {
    const validation = validateSonarcloudMetric.call(
      { isEnabled: false } as unknown as IRepoSonarcloud,
      1
    );

    expect(validation).toBe(false);
  });
  it("should return true if sonarcloud is enabled and the metric is not null", () => {
    const validation = validateSonarcloudMetric.call(
      { isEnabled: true } as unknown as IRepoSonarcloud,
      1
    );

    expect(validation).toBe(true);
  });
  it("should return true if sonarcloud is disabled and the metric is null", () => {
    const validation = validateSonarcloudMetric.call(
      { isEnabled: false } as unknown as IRepoSonarcloud,
      null
    );

    expect(validation).toBe(true);
  });
});

describe("createSonarcloudMetricSchema", () => {
  it("should return a correct schema with the right validator", () => {
    const expectedSchema: SchemaDefinitionProperty<number, IRepoSonarcloud> = {
      type: Number,
      validate: {
        validator: validateSonarcloudMetric,
      },
      default: null,
    };

    const actualSchema = createSonarcloudMetricSchema<number>(Number);

    expect(actualSchema).toEqual(expectedSchema);
  });
});

describe("calculateCodeCoverageScore", () => {
  it.each([
    [{ repo: "repo", isEnabled: false }, "Grey"],
    [{ repo: "repo", isEnabled: true, codeCoverage: null }, "Grey"],
    [{ repo: "repo", isEnabled: true, codeCoverage: 80 }, "Green"],
    [{ repo: "repo", isEnabled: true, codeCoverage: 79 }, "Amber"],
    [{ repo: "repo", isEnabled: true, codeCoverage: 50 }, "Amber"],
    [{ repo: "repo", isEnabled: true, codeCoverage: 49 }, "Red"],
    [{ repo: "repo", isEnabled: true, codeCoverage: 0 }, "Red"],
  ])("should calculate the code coverage score", (schema, expectedScore) => {
    const sonarcloudSchema = new RepoSonarcloudModel(schema);

    expect(calculateCodeCoverageScore(sonarcloudSchema)).toEqual(expectedScore);
  });
});

describe("RepoSonarcloudSchema", () => {
  describe("validations", () => {
    it.each([
      ["reliabilityRating"],
      ["securityRating"],
      ["sqaleRating"],
      ["codeCoverage"],
      ["linesOfCode"],
      ["bugs"],
      ["codeSmells"],
      ["duplicatedLinesDensity"],
    ])(
      "should return false if there are sonarcloud metrics for a repo without sonarcloud enabled",
      (sonarcloudMetric) => {
        const validator =
          RepoSonarcloudSchema.path(sonarcloudMetric).validators[0]!
            .validator ?? function () {};
        const result = validator.call({ isEnabled: false }, 1);
        expect(result).toBe(false);
      }
    );
  });

  describe("pre middleware", () => {
    it.each([
      [{ repo: "repo", isEnabled: false }, "Grey"],
      [{ repo: "repo", isEnabled: true, codeCoverage: null }, "Grey"],
      [{ repo: "repo", isEnabled: true, codeCoverage: 80 }, "Green"],
      [{ repo: "repo", isEnabled: true, codeCoverage: 79 }, "Amber"],
      [{ repo: "repo", isEnabled: true, codeCoverage: 50 }, "Amber"],
      [{ repo: "repo", isEnabled: true, codeCoverage: 49 }, "Red"],
      [{ repo: "repo", isEnabled: true, codeCoverage: 0 }, "Red"],
    ])(
      "should calculate the code coverage score",
      async (schema, expectedScore) => {
        const sonarcloudSchema = new RepoSonarcloudModel(schema);

        await sonarcloudSchema.save();
        expect(sonarcloudSchema.codeCoverageScore).toEqual(expectedScore);
      }
    );
  });

  it("should have an index on repo", () => {
    const repoSonarcloud = new RepoSonarcloudModel({
      repo: "test",
    });

    const indexes = repoSonarcloud.schema.indexes();
    const index = indexes.find((index: any) => index[0].repo === 1);

    expect(index).toBeDefined();
  });
});
