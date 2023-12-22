import { repoBranchProtectionModel as RepoBranchProtectionModel } from "../branchProtectionSchemas";

describe("RepoBranchProtectionSchema", () => {
  describe("validation", () => {
    it("should default protection rules to false", () => {
      const repoBranchProtection = new RepoBranchProtectionModel({
        repo: "test",
      });

      expect(repoBranchProtection.pullRequestRequired).toEqual(false);
      expect(repoBranchProtection.approvalsRequired).toEqual(false);
      expect(repoBranchProtection.stalePullRequestApprovalsDismissed).toEqual(
        false
      );
      expect(repoBranchProtection.signaturesRequired).toEqual(false);
      expect(repoBranchProtection.conversationResolutionRequired).toEqual(
        false
      );
    });
    it("should require the repo name", () => {
      const invalidRepoBranchProtection = new RepoBranchProtectionModel({});

      const validation = invalidRepoBranchProtection.validateSync();

      expect(validation?.errors.repo.message).toEqual(
        "Path `repo` is required."
      );
    });
  });
});
