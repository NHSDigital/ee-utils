import mongoose from "mongoose";
import { HealthStatuses } from "./stateTypes.js";

export interface IRepoBranchProtection {
  repo: string;
  pullRequestRequired: boolean;
  approvalsRequired: boolean;
  stalePullRequestApprovalsDismissed: boolean;
  signaturesRequired: boolean;
  conversationResolutionRequired: boolean;
  compliance: HealthStatuses;
}

export const calculateCompliance = (schema: IRepoBranchProtection) => {
  const complianceValues = [
    schema.pullRequestRequired,
    schema.approvalsRequired,
    schema.signaturesRequired,
    schema.stalePullRequestApprovalsDismissed,
  ];
  const complianceScore = complianceValues.filter(Boolean).length;
  const complianceByScore: Record<number, HealthStatuses> = {
    4: "Green",
    3: "Amber",
    2: "Amber",
    1: "Red",
    0: "Red",
  };
  return complianceByScore[complianceScore];
};

export const RepoBranchProtectionSchema =
  new mongoose.Schema<IRepoBranchProtection>(
    {
      repo: { type: String, required: true, index: true },
      pullRequestRequired: { type: Boolean, default: false },
      approvalsRequired: { type: Boolean, default: false },
      stalePullRequestApprovalsDismissed: { type: Boolean, default: false },
      signaturesRequired: { type: Boolean, default: false },
      conversationResolutionRequired: { type: Boolean, default: false },
      compliance: { type: String, default: calculateCompliance },
    },
    { timestamps: { createdAt: "document_created_at" } }
  );

export const RepoBranchProtectionModel =
  mongoose.models.RepoBranchProtection ||
  mongoose.model<IRepoBranchProtection>(
    "RepoBranchProtection",
    RepoBranchProtectionSchema
  );
