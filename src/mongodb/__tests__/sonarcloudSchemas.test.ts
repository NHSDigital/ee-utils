import { SchemaDefinitionProperty } from "mongoose";
import {
  IRepoSonarcloud,
  RepoSonarcloudSchema,
  createSonarcloudMetricSchema,
  validateSonarcloudMetric,
} from "../sonarcloudSchemas";

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
      // @ts-ignore
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
});
