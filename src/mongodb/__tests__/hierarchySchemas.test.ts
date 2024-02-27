import { HierarchyModel } from "../hierarchySchemas";

describe("HierarchySchema", () => {
  describe("validation", () => {
    it("should succeed for only directorate hierarchy", () => {
      const validHierarchy = {
        directorate: "Directorate 1",
      };
      const validModel = new HierarchyModel(validHierarchy);

      const error = validModel.validateSync();
      expect(error).toBeUndefined();
    });
    it("should succeed for function hierarchy", () => {
      const validHierarchy = {
        directorate: "Directorate 1",
        function_name: "Function 1",
      };
      const validModel = new HierarchyModel(validHierarchy);

      const error = validModel.validateSync();
      expect(error).toBeUndefined();
    });
    it("should succeed for subdirectorate hierarchy", () => {
      const validHierarchy = {
        directorate: "Directorate 1",
        function_name: "Function 1",
        subdirectorate: "Subdirectorate 1",
      };
      const validModel = new HierarchyModel(validHierarchy);

      const error = validModel.validateSync();
      expect(error).toBeUndefined();
    });
    it("should succeed for area hierarchy", () => {
      const validHierarchy = {
        directorate: "Directorate 1",
        function_name: "Function 1",
        subdirectorate: "Subdirectorate 1",
        area: "Area 1",
      };
      const validModel = new HierarchyModel(validHierarchy);

      const error = validModel.validateSync();
      expect(error).toBeUndefined();
    });
    it("should succeed for service hierarchy", () => {
      const validHierarchy = {
        directorate: "Directorate 1",
        function_name: "Function 1",
        subdirectorate: "Subdirectorate 1",
        area: "Area 1",
        service: "Service 1",
      };
      const validModel = new HierarchyModel(validHierarchy);

      const error = validModel.validateSync();
      expect(error).toBeUndefined();
    });
    it("should succeed for repo hierarchy", () => {
      const validHierarchy = {
        directorate: "Directorate 1",
        function_name: "Function 1",
        subdirectorate: "Subdirectorate 1",
        area: "Area 1",
        service: "Service 1",
        repo: "Repo 1",
      };
      const validModel = new HierarchyModel(validHierarchy);

      const error = validModel.validateSync();
      expect(error).toBeUndefined();
    });
    it.each([
      {
        description: "should fail if the directorate is not present",
        hierarchy: {},
        expectedErrors: {
          directorate: "Path `directorate` is required.",
        },
      },
      {
        description:
          "should fail if directorate is not present and function is",
        hierarchy: {
          function_name: "function",
        },
        expectedErrors: {
          directorate: "Path `directorate` is required.",
        },
      },
      {
        description:
          "should fail if directorate and function are not defined but subdirectorate is",
        hierarchy: {
          subdirectorate: "subdirectorate",
        },
        expectedErrors: {
          directorate: "Path `directorate` is required.",
          function_name: "Path `function_name` is required.",
        },
      },
      {
        description:
          "should fail if directorate, function and subdirectorate not defined and area is",
        hierarchy: {
          area: "area",
        },
        expectedErrors: {
          directorate: "Path `directorate` is required.",
          function_name: "Path `function_name` is required.",
          subdirectorate: "Path `subdirectorate` is required.",
        },
      },
      {
        description:
          "should fail if directorate, function, subdirectorate, area not defined but service is",
        hierarchy: {
          service: "service",
        },
        expectedErrors: {
          directorate: "Path `directorate` is required.",
          function_name: "Path `function_name` is required.",
          subdirectorate: "Path `subdirectorate` is required.",
          area: "Path `area` is required.",
        },
      },
      {
        description:
          "should fails if directorate, function, subdirectorate, area, service not defined but repo is",
        hierarchy: {
          repo: "repo",
        },
        expectedErrors: {
          directorate: "Path `directorate` is required.",
          function_name: "Path `function_name` is required.",
          subdirectorate: "Path `subdirectorate` is required.",
          area: "Path `area` is required.",
          service: "Path `service` is required.",
        },
      },
    ])("$description", ({ hierarchy, expectedErrors }) => {
      const invalidModel = new HierarchyModel(hierarchy);
      const error = invalidModel.validateSync();
      expect(error).toBeDefined();
      Object.entries(expectedErrors).forEach(([field, message]) => {
        expect(error?.errors[field].message).toEqual(message);
      });
    });
  });
});
