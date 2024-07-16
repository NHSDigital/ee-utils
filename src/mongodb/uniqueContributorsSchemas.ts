import mongoose from "mongoose";

export interface IUniqueContributors {
  repo: string;
  contributors: string[];
  numContributors: number;
}

export const UniqueContributorsSchema =
  new mongoose.Schema<IUniqueContributors>(
    {
      repo: { type: String, required: true, index: true },
      contributors: { type: [String], default: [] },
      numContributors: {
        type: Number,
        default: 0,
        min: [0, "Cannot be a negative number"],
      },
    },
    { timestamps: { createdAt: "document_created_at" } }
  );

export const UniqueContributorsModel =
  mongoose.models.UniqueContributorsModel ||
  mongoose.model<IUniqueContributors>(
    "UniqueContributors",
    UniqueContributorsSchema
  );
