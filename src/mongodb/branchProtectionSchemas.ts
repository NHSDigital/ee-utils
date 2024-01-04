import mongoose from "mongoose";

export interface IRepoBranchProtection {
  repo: string;
  pullRequestRequired: boolean;
  approvalsRequired: boolean;
  stalePullRequestApprovalsDismissed: boolean;
  signaturesRequired: boolean;
  conversationResolutionRequired: boolean;
}

export const RepoBranchProtectionSchema =
  new mongoose.Schema<IRepoBranchProtection>(
    {
      repo: { type: String, required: true },
      pullRequestRequired: { type: Boolean, default: false },
      approvalsRequired: { type: Boolean, default: false },
      stalePullRequestApprovalsDismissed: { type: Boolean, default: false },
      signaturesRequired: { type: Boolean, default: false },
      conversationResolutionRequired: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "document_created_at" } }
  );

export const RepoBranchProtectionModel = mongoose.model<IRepoBranchProtection>(
  "RepoBranchProtection",
  RepoBranchProtectionSchema
);
