import mongoose from "mongoose";

export interface IUniqueContributors {
  repo: string;
  contributors: string[];
  numContributors: number;
}

export const UniqueContributorsSchema =
  new mongoose.Schema<IUniqueContributors>({
    repo: { type: String, required: true },
    contributors: { type: [String], default: [] },
    numContributors: {
      type: Number,
      default: 0,
      min: [0, "Cannot be a negative number"],
    },
  });

export const UniqueContributorsModel = mongoose.model<IUniqueContributors>(
  "UniqueContributors",
  UniqueContributorsSchema
);
