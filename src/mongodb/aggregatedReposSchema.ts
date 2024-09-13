import mongoose from "mongoose";
import { HealthStatuses, MetricRating } from "./stateTypes.js";

export interface IAggregatedRepo {
  size: number;
  totalLinesOfCode: number | "NA";
  criticalDependabot: number | "NA";
  highDependabot: number | "NA";
  mediumDependabot: number | "NA";
  lowDependabot: number | "NA";
  proportionDependabotEnabled: number;
  averageCodeCoverage: number;
  averageBugs: number;
  averageCodeSmells: number;
  averageSecurityRating: MetricRating;
  averageReliabilityRating: MetricRating;
  averageSqaleRating: MetricRating;
  proportionGreenRepos: number;
  proportionAmberRepos: number;
  proportionRedRepos: number;
  overallServiceHealth: HealthStatuses;
  hierarchyItem: string;
}

export const AggregatedReposSchema = new mongoose.Schema<IAggregatedRepo>(
  {
    size: { type: Number, required: true },
    totalLinesOfCode: { type: mongoose.Schema.Types.Mixed, required: true },
    criticalDependabot: { type: mongoose.Schema.Types.Mixed, required: true },
    highDependabot: { type: mongoose.Schema.Types.Mixed, required: true },
    mediumDependabot: { type: mongoose.Schema.Types.Mixed, required: true },
    lowDependabot: { type: mongoose.Schema.Types.Mixed, required: true },
    proportionDependabotEnabled: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    averageCodeCoverage: { type: mongoose.Schema.Types.Mixed, required: true },
    averageBugs: { type: mongoose.Schema.Types.Mixed, required: true },
    averageCodeSmells: { type: mongoose.Schema.Types.Mixed, required: true },
    averageSecurityRating: {
      type: String,
      required: true,
    },
    averageReliabilityRating: {
      type: String,
      required: true,
    },
    averageSqaleRating: {
      type: String,
      required: true,
    },
    proportionGreenRepos: { type: Number, required: true },
    proportionAmberRepos: { type: Number, required: true },
    proportionRedRepos: { type: Number, required: true },
    overallServiceHealth: {
      type: String,
      required: true,
    },
    hierarchyItem: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "document_created_at" },
  }
);

export const AggregatedReposModel =
  mongoose.models.AggregatedRepos ||
  mongoose.model<IAggregatedRepo>("AggregatedRepos", AggregatedReposSchema);
