import { HierarchyModel } from "../hierarchySchemas";

describe("HierarchySchema", () => {
  describe("validation", () => {
    const validHierarchy = {
      repo: "repo",
    };
    it("should default hierarchy to Unallocated", () => {
      const validModel = new HierarchyModel(validHierarchy);

      expect(validModel.validateSync()).toBeUndefined();
      expect(validModel.repo).toEqual("repo");
      expect(validModel.directorate).toEqual("Unallocated");
      expect(validModel.function_name).toEqual("Unallocated");
      expect(validModel.subdirectorate).toEqual("Unallocated");
      expect(validModel.area).toEqual("Unallocated");
      expect(validModel.service).toEqual("Unallocated");
    });
    it("should fail if the repo is not present", () => {
      const invalidHierarchy = {};
      const invalidModel = new HierarchyModel(invalidHierarchy);

      const error = invalidModel.validateSync();
      expect(error).toBeDefined();
      expect(error?.errors.repo.message).toEqual("Path `repo` is required.");
    });
  });
});
