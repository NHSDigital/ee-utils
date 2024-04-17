import mongoose from "mongoose";
import {
  RepoBranchProtectionModel,
  calculateCompliance,
} from "../branchProtectionSchemas";
import { cleanDatabase, connectToDatabase } from "../testHelpers/helper";

beforeAll(async () => {
  await cleanDatabase(process.env.MONGODB_URI!);
  await connectToDatabase(process.env.MONGODB_URI!);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("calculateCompliance", () => {
  it.each([
    [{ repo: "repo" }, "Red"],
    [{ repo: "repo", pullRequestRequired: true }, "Red"],
    [{ repo: "repo", approvalsRequired: true }, "Red"],
    [{ repo: "repo", signaturesRequired: true }, "Red"],
    [
      { repo: "repo", signaturesRequired: true, pullRequestRequired: true },
      "Amber",
    ],
    [
      { repo: "repo", approvalsRequired: true, pullRequestRequired: true },
      "Amber",
    ],
    [
      { repo: "repo", approvalsRequired: true, signaturesRequired: true },
      "Amber",
    ],
    [
      {
        repo: "repo",
        approvalsRequired: true,
        signaturesRequired: true,
        pullRequestRequired: true,
      },
      "Green",
    ],
  ])("should correctly calculate compliance", (schema, expectedScore) => {
    const repoBranchProtection = new RepoBranchProtectionModel(schema);

    expect(calculateCompliance(repoBranchProtection)).toEqual(expectedScore);
  });
});

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

  describe("pre middleware", () => {
    it.each([
      [{ repo: "repo" }, "Red"],
      [{ repo: "repo", pullRequestRequired: true }, "Red"],
      [{ repo: "repo", approvalsRequired: true }, "Red"],
      [{ repo: "repo", signaturesRequired: true }, "Red"],
      [
        { repo: "repo", signaturesRequired: true, pullRequestRequired: true },
        "Amber",
      ],
      [
        { repo: "repo", approvalsRequired: true, pullRequestRequired: true },
        "Amber",
      ],
      [
        { repo: "repo", approvalsRequired: true, signaturesRequired: true },
        "Amber",
      ],
      [
        {
          repo: "repo",
          approvalsRequired: true,
          signaturesRequired: true,
          pullRequestRequired: true,
        },
        "Green",
      ],
    ])(
      "should calculate the compliance score and set the compliance field",
      async (schema, expectedScore) => {
        const repoBranchProtection = new RepoBranchProtectionModel(schema);
        await repoBranchProtection.save();
        expect(repoBranchProtection.compliance).toEqual(expectedScore);
      }
    );
  });
  it("should have an index on repo", () => {
    const repoBranchProtection = new RepoBranchProtectionModel({
      repo: "test",
    });

    const indexes = repoBranchProtection.schema.indexes();
    const index = indexes.find((index) => index[0].repo === 1);

    expect(index).toBeDefined();
  });
});
