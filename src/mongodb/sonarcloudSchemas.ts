import mongoose, { SchemaDefinitionProperty } from "mongoose";

export interface IRepoSonarcloud {
  repo: string;
  isEnabled: boolean;
  reliabilityRating: string;
  securityRating: string;
  sqaleRating: string;
  codeCoverage: number;
  linesOfCode: number;
  bugs: number;
  codeSmells: number;
  duplicatedLinesDensity: number;
  codeCoverageScore: HealthStatuses;
}

export const validateSonarcloudMetric = function <T>(
  this: IRepoSonarcloud,
  finding: T
) {
  if (this.isEnabled) {
    return true;
  }
  if (!this.isEnabled && finding !== null) {
    return false;
  }
  return true;
};

export const createSonarcloudMetricSchema = <T extends string | number>(
  type: any
) => {
  return {
    type,
    validate: {
      validator: validateSonarcloudMetric<T | null>,
    },
    default: null,
  } as unknown as SchemaDefinitionProperty<T, IRepoSonarcloud>;
};

export const calculateCodeCoverageScore = (schema: IRepoSonarcloud) => {
  if (!schema.isEnabled || schema.codeCoverage === null) {
    return "Grey";
  }
  if (schema.codeCoverage >= 80) {
    return "Green";
  }
  if (schema.codeCoverage < 80 && schema.codeCoverage >= 50) {
    return "Amber";
  }
  return "Red";
};

export const RepoSonarcloudSchema = new mongoose.Schema<IRepoSonarcloud>(
  {
    repo: {
      type: String,
      required: true,
    },
    isEnabled: Boolean,
    reliabilityRating: createSonarcloudMetricSchema<string>(String),
    securityRating: createSonarcloudMetricSchema<string>(String),
    sqaleRating: createSonarcloudMetricSchema<string>(String),
    codeCoverage: createSonarcloudMetricSchema<number>(Number),
    linesOfCode: createSonarcloudMetricSchema<number>(Number),
    bugs: createSonarcloudMetricSchema<number>(Number),
    codeSmells: createSonarcloudMetricSchema<number>(Number),
    duplicatedLinesDensity: createSonarcloudMetricSchema<number>(Number),
    codeCoverageScore: { type: String, default: "Grey" },
  },
  { timestamps: { createdAt: "document_created_at" } }
);

RepoSonarcloudSchema.pre("save", function (next) {
  this.codeCoverageScore = calculateCodeCoverageScore(this);
  next();
});

export const RepoSonarcloudModel = mongoose.model<IRepoSonarcloud>(
  "RepoSonarcloud",
  RepoSonarcloudSchema
);
