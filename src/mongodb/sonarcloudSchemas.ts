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
}

export const validateSonarcloudMetric = function (
  this: IRepoSonarcloud,
  finding: number
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
      validator: validateSonarcloudMetric,
    },
    default: null,
  } as unknown as SchemaDefinitionProperty<T, IRepoSonarcloud>;
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
  },
  { timestamps: { createdAt: "document_created_at" } }
);

export const RepoSonarcloudModel = mongoose.model<IRepoSonarcloud>(
  "RepoSonarcloud",
  RepoSonarcloudSchema
);
