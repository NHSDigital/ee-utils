import { UniqueContributorsModel } from "../uniqueContributorsSchemas";

describe("UniqueContributorsSchema", () => {
  describe("validation", () => {
    it("should succeed with a valid model", () => {
      const validModel = new UniqueContributorsModel({
        repo: "test",
        contributors: ["test"],
        numContributors: 1,
      });

      expect(validModel.validateSync()).toBeUndefined();
      expect(validModel.repo).toEqual("test");
      expect(validModel.contributors).toEqual(["test"]);
      expect(validModel.numContributors).toEqual(1);
    });
    it("should default contributors to [] and numContributors to 0", () => {
      const validModel = new UniqueContributorsModel({
        repo: "test",
      });

      expect(validModel.validateSync()).toBeUndefined();
      expect(validModel.repo).toEqual("test");
      expect(validModel.contributors).toEqual([]);

      expect(validModel.numContributors).toEqual(0);
    });
    it("should default fail if numContributors is negative", () => {
      const validModel = new UniqueContributorsModel({
        repo: "test",
        numContributors: -1,
      });

      const error = validModel.validateSync();
      expect(error).toBeDefined();

      expect(error?.errors["numContributors"].message).toEqual(
        "Cannot be a negative number"
      );
    });
  });

  it("should have an index on repo", () => {
    const validModel = new UniqueContributorsModel({
      repo: "test",
    });

    const indexes = validModel.schema.indexes();
    const index = indexes.find((index) => index[0].repo === 1);

    expect(index).toBeDefined();
  });
});
