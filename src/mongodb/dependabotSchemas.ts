import mongoose, { SchemaDefinitionProperty } from "mongoose";
import { HealthStatuses } from "./stateTypes";

export interface IRepoDependabot {
  repo: string;
  dependabotEnabled: boolean;
  criticalDependabot: number;
  highDependabot: number;
  mediumDependabot: number;
  lowDependabot: number;
  dependabotScore: HealthStatuses;
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

export const calculateDependabotScore = (schema: IRepoDependabot) => {
  if (!schema.dependabotEnabled) {
    return "Grey";
  }

  const CRITICAL_ALERT_MULTIPLIER = 100;
  const HIGH_ALERT_MULTIPLIER = 10;
  const MEDIUM_ALERT_MULTIPLIER = 5;
  const LOW_ALERT_MULTIPLIER = 1;

  const dependabotScore =
    schema.criticalDependabot * CRITICAL_ALERT_MULTIPLIER +
    schema.highDependabot * HIGH_ALERT_MULTIPLIER +
    schema.mediumDependabot * MEDIUM_ALERT_MULTIPLIER +
    schema.lowDependabot * LOW_ALERT_MULTIPLIER;

  if (dependabotScore <= 10) {
    return "Green";
  }
  if (dependabotScore < 100) {
    return "Amber";
  }
  if (dependabotScore >= 100) {
    return "Red";
  }
  return "Grey";
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
      index: true,
    },
    dependabotEnabled: { type: Boolean, required: true },
    criticalDependabot: { ...dependabotFindingSchema },
    highDependabot: { ...dependabotFindingSchema },
    mediumDependabot: { ...dependabotFindingSchema },
    lowDependabot: { ...dependabotFindingSchema },
    dependabotScore: { type: String, default: "Grey" },
  },
  { timestamps: { createdAt: "document_created_at" } }
);

RepoDependabotSchema.pre<IRepoDependabot>("save", function (next) {
  this.dependabotScore = calculateDependabotScore(this);
  next();
});

export const RepoDependabotModel =
  mongoose.models.RepoDependabot ||
  mongoose.model<IRepoDependabot>("RepoDependabot", RepoDependabotSchema);
