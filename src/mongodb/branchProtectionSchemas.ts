import mongoose from "mongoose";

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
  ];

  const complianceScore = complianceValues.filter(Boolean).length;

  const complianceByScore: Record<number, HealthStatuses> = {
    3: "Green",
    2: "Amber",
    1: "Red",
    0: "Red",
  };
  return complianceByScore[complianceScore];
};

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

RepoBranchProtectionSchema.pre("save", function (next) {
  this.compliance = calculateCompliance(this);
  next();
});

export const RepoBranchProtectionModel = mongoose.model<IRepoBranchProtection>(
  "RepoBranchProtection",
  RepoBranchProtectionSchema
);
