import mongoose, { SchemaDefinitionProperty } from "mongoose";

export interface IRepoDependabot {
  repo: string;
  dependabotEnabled: boolean;
  criticalDependabot: number;
  highDependabot: number;
  mediumDependabot: number;
  lowDependabot: number;
}

export const validateDependabotEnabledForFinding = function (
  this: IRepoDependabot,
  finding: number
) {
  if (!this.dependabotEnabled && finding > 0) {
    return false;
  }
  return true;
};

const dependabotFindingSchema: SchemaDefinitionProperty<
  number,
  IRepoDependabot
> = {
  type: Number,
  validate: {
    validator: validateDependabotEnabledForFinding,
  },
  min: [0, "Cannot be a negative number"],
  default: 0,
};

export const RepoDependabotSchema = new mongoose.Schema<IRepoDependabot>(
  {
    repo: {
      type: String,
      required: true,
    },
    dependabotEnabled: { type: Boolean, required: true },
    criticalDependabot: { ...dependabotFindingSchema },
    highDependabot: { ...dependabotFindingSchema },
    mediumDependabot: { ...dependabotFindingSchema },
    lowDependabot: { ...dependabotFindingSchema },
  },
  { timestamps: { createdAt: "document_created_at" } }
);

export const RepoDependabotModel = mongoose.model<IRepoDependabot>(
  "RepoDependabot",
  RepoDependabotSchema
);
