import { RepoModel } from "../repoSchemas";

describe("RepoSchema", () => {
  describe("validation", () => {
    it("should succeed with a valid model", () => {
      const validModel = new RepoModel({
        github_id: 1,
        node_id: "abcd",
        name: "Repo-Name",
        full_name: "owner/Repo-Name",
        owner: "owner",
        visibility: "public",
        language: "javascript",
        size: 10000,
        pushed_at: "2020-09-25T17:01:11Z",
        created_at: "2019-09-25T17:01:11Z",
        updated_at: "2020-09-25T17:01:11Z",
        archived: false,
        url: "some_url",
      });

      expect(validModel.validateSync()).toBeUndefined();
      expect(validModel.github_id).toEqual(1);
      expect(validModel.node_id).toEqual("abcd");
      expect(validModel.name).toEqual("Repo-Name");
      expect(validModel.full_name).toEqual("owner/Repo-Name");
      expect(validModel.owner).toEqual("owner");
      expect(validModel.visibility).toEqual("public");
      expect(validModel.language).toEqual("javascript");
      expect(validModel.size).toEqual(10000);
      expect(validModel.pushed_at).toEqual("2020-09-25T17:01:11Z");
      expect(validModel.created_at).toEqual("2019-09-25T17:01:11Z");
      expect(validModel.updated_at).toEqual("2020-09-25T17:01:11Z");
      expect(validModel.archived).toEqual(false);
      expect(validModel.url).toEqual("some_url");
    });
  });
  it("should fail if all details are not provided", () => {
    const invalidModel = new RepoModel({});

    const error = invalidModel.validateSync();
    expect(error).toBeDefined();
    const requiredFields = [
      "github_id",
      "node_id",
      "name",
      "full_name",
      "owner",
      "visibility",
      "language",
      "size",
      "pushed_at",
      "created_at",
      "updated_at",
      "archived",
      "url",
    ];

    requiredFields.forEach((field) => {
      expect(error?.errors[field].message).toEqual(
        `Path \`${field}\` is required.`
      );
    });
  });
  it("should fail if the size is negative", () => {
    const invalidModel = new RepoModel({
      github_id: 1,
      node_id: "abcd",
      name: "Repo-Name",
      full_name: "owner/Repo-Name",
      owner: "owner",
      visibility: "public",
      language: "javascript",
      size: -10000,
      pushed_at: "2020-09-25T17:01:11Z",
      created_at: "2019-09-25T17:01:11Z",
      updated_at: "2020-09-25T17:01:11Z",
      archived: false,
      url: "some_url",
    });

    const error = invalidModel.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors["size"].message).toEqual(
      "Cannot be a negative number"
    );
  });
});
