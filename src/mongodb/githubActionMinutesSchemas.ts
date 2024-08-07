import mongoose from "mongoose";

export interface IGithubActionMinutes {
  repo: string;
  githubActionMinutes: number;
}

export const GithubActionMinutesSchema =
  new mongoose.Schema<IGithubActionMinutes>(
    {
      repo: { type: String, index: true, required: true },
      githubActionMinutes: {
        type: Number,
        default: 0,
        min: [0, "Cannot be a negative number"],
      },
    },
    { timestamps: { createdAt: "document_created_at" } }
  );

export const GithubActionMinutesModel =
  mongoose.models.GithubActionMinutes ||
  mongoose.model<IGithubActionMinutes>(
    "GithubActionMinutes",
    GithubActionMinutesSchema
  );
