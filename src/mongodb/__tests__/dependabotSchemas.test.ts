import {
  IRepoDependabot,
  RepoDependabotModel,
  RepoDependabotSchema,
  validateDependabotEnabledForFinding,
} from "../dependabotSchemas";

describe("validateDependabotEnabledForFinding", () => {
  it("should return false if dependabot is disabled and the finding is greater than 0", () => {
    const validation = validateDependabotEnabledForFinding.call(
      {
        dependabotEnabled: false,
      } as unknown as IRepoDependabot,
      1
    );
    expect(validation).toBe(false);
  });
  it("should return true if dependabot is disabled and the finding is 0", () => {
    const validation = validateDependabotEnabledForFinding.call(
      {
        dependabotEnabled: false,
      } as unknown as IRepoDependabot,
      0
    );

    expect(validation).toBe(true);
  });
  it("should return true if dependabot is enabled", () => {
    const validation = validateDependabotEnabledForFinding.call(
      {
        dependabotEnabled: true,
      } as unknown as IRepoDependabot,
      1
    );

    expect(validation).toBe(true);
  });
});

describe("repoDependabotSchema", () => {
  describe("validations", () => {
    it.each([
      ["criticalDependabot", false],
      ["highDependabot", false],
      ["mediumDependabot", false],
      ["lowDependabot", false],
    ])(
      "should return %p if there are dependabot findings for a repo that hasn't got dependabot enabled",
      (findingValidator, expectedResult) => {
        const validator =
          RepoDependabotSchema.path(findingValidator).validators[0]!
            .validator ?? function () {};
        const result = validator.call({ dependabotEnabled: false }, 1);
        expect(result).toBe(expectedResult);
      }
    );

    it.each([
      ["criticalDependabot", true],
      ["highDependabot", true],
      ["mediumDependabot", true],
      ["lowDependabot", true],
    ])(
      "should return true if there are no dependabot findings and dependabot is enabled for %p",
      (findingValidator, expectedResult) => {
        const validator =
          RepoDependabotSchema.path(findingValidator).validators[0]!
            .validator ?? function () {};
        const result = validator.call({ dependabotEnabled: true }, 0);
        expect(result).toBe(expectedResult);
      }
    );

    it.each([
      ["criticalDependabot", true],
      ["highDependabot", true],
      ["mediumDependabot", true],
      ["lowDependabot", true],
    ])(
      "should return true if there are dependabot findings and dependabot is enabled for %p",
      (findingValidator, expectedResult) => {
        const validator =
          RepoDependabotSchema.path(findingValidator).validators[0]!
            .validator ?? function () {};
        const result = validator.call({ dependabotEnabled: true }, 1);
        expect(result).toBe(expectedResult);
      }
    );
    it("should fail if the dependabot finding is a negative number", () => {
      const invalidDependabotSchema = new RepoDependabotModel({
        repo: "repo",
        dependabotEnabled: true,
        criticalDependabot: -1,
        highDependabot: -1,
        mediumDependabot: -1,
        lowDependabot: -1,
      });
      const error = invalidDependabotSchema.validateSync();

      for (const finding of [
        "criticalDependabot",
        "highDependabot",
        "mediumDependabot",
        "lowDependabot",
      ]) {
        expect(error?.errors[finding].message).toEqual(
          "Cannot be a negative number"
        );
      }
    });
    it("should default the dependabot findings to 0", () => {
      const validDependabotSchema = new RepoDependabotModel({
        repo: "repo",
        dependabotEnabled: true,
      });
      expect(validDependabotSchema.criticalDependabot).toEqual(0);
      expect(validDependabotSchema.highDependabot).toEqual(0);
      expect(validDependabotSchema.mediumDependabot).toEqual(0);
      expect(validDependabotSchema.lowDependabot).toEqual(0);
    });
  });
});
