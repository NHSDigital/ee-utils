import { GithubActionMinutesModel } from "../githubActionMinutesSchemas";

describe("githubActionMinutesSchema", () => {
  describe("validation", () => {
    it("should succeed with a valid model", () => {
      const validGithubActionMinutesSchema = new GithubActionMinutesModel({
        repo: "repo",
        githubActionMinutes: 27,
      });
      expect(validGithubActionMinutesSchema.repo).toBe("repo");
      expect(validGithubActionMinutesSchema.githubActionMinutes).toBe(27);
    });
    it("should default the github action minutes to 0", () => {
      const validGithubActionMinutesSchema = new GithubActionMinutesModel({
        repo: "repo",
      });
      expect(validGithubActionMinutesSchema.githubActionMinutes).toBe(0);
    });
    it("should fail if the github action minutes is negative", () => {
      const invalidGithubActionMinutesSchema = new GithubActionMinutesModel({
        repo: "repo",
        githubActionMinutes: -1,
      });
      const error = invalidGithubActionMinutesSchema.validateSync();

      expect(error?.errors["githubActionMinutes"].message).toEqual(
        "Cannot be a negative number"
      );
    });
    it("should fail if repo is not set", () => {
      const invalidGithubActionMinutesSchema = new GithubActionMinutesModel({
        githubActionMinutes: 27,
      });

      const validation = invalidGithubActionMinutesSchema.validateSync();

      expect(validation?.errors.repo.message).toEqual(
        "Path `repo` is required."
      );
    });
  });

  it("should have an index on repo", () => {
    const validGithubActionMinutesSchema = new GithubActionMinutesModel({
      repo: "repo",
    });

    const indexes = validGithubActionMinutesSchema.schema.indexes();
    const index = indexes.find((index) => index[0].repo === 1);

    expect(index).toBeDefined();
  });
});
