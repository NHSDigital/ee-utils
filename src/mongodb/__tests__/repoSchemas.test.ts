import { IRepo, RepoModel } from "../repoSchemas";

describe("RepoSchema", () => {
  const validRepo: IRepo = {
    github_id: 1,
    node_id: "abcd",
    name: "Repo-Name",
    full_name: "owner/Repo-Name",
    owner: "owner",
    visibility: "public",
    language: "javascript",
    size: 10000,
    pushed_at: "2020-09-25T17:01:11Z",
    repo_created_at: "2019-09-25T17:01:11Z",
    repo_updated_at: "2020-09-25T17:01:11Z",
    archived: false,
    url: "some_url",
  };
  describe("validation", () => {
    it("should succeed with a valid model", () => {
      const validModel = new RepoModel(validRepo);

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
      expect(validModel.repo_created_at).toEqual("2019-09-25T17:01:11Z");
      expect(validModel.repo_updated_at).toEqual("2020-09-25T17:01:11Z");
      expect(validModel.archived).toEqual(false);
      expect(validModel.url).toEqual("some_url");
    });
  });
  it.each([
    ["github_id"],
    ["node_id"],
    ["name"],
    ["full_name"],
    ["owner"],
    ["visibility"],
    ["language"],
    ["size"],
    ["pushed_at"],
    ["repo_created_at"],
    ["repo_updated_at"],
    ["archived"],
    ["url"],
  ])("should fail if all details are not provided", (field) => {
    const invalidRepo = { ...validRepo };
    delete invalidRepo[field as keyof IRepo];
    const invalidModel = new RepoModel(invalidRepo);

    const error = invalidModel.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors[field].message).toEqual(
      `Path \`${field}\` is required.`
    );
  });
  it("should fail if the size is negative", () => {
    const invalidRepo = { ...validRepo, size: -10000 };
    const invalidModel = new RepoModel(invalidRepo);

    const error = invalidModel.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors["size"].message).toEqual(
      "Cannot be a negative number"
    );
  });
});
