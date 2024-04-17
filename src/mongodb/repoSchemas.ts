import mongoose from "mongoose";

export interface IRepo {
  github_id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: string;
  visibility: string;
  language: string;
  size: number;
  pushed_at: string;
  repo_created_at: string;
  repo_updated_at: string;
  archived: boolean;
  url: string;
}

export const RepoSchema = new mongoose.Schema(
  {
    github_id: { type: Number, required: true },
    node_id: { type: String, required: true },
    name: { type: String, required: true },
    full_name: { type: String, required: true, index: true },
    owner: { type: String, required: true },
    visibility: { type: String, required: true },
    language: { type: String, required: true },
    size: {
      type: Number,
      required: true,
      min: [0, "Cannot be a negative number"],
    },
    pushed_at: { type: String, required: true },
    repo_created_at: { type: String, required: true },
    repo_updated_at: { type: String, required: true },
    archived: { type: Boolean, required: true },
    url: { type: String, required: true },
  },
  { timestamps: { createdAt: "document_created_at" } }
);

export const RepoModel = mongoose.model<IRepo>("Repo", RepoSchema);
