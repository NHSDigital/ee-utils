import mongoose from "mongoose";

export interface IHierarchy {
  repo: string;
  directorate?: string;
  function_name?: string;
  subdirectorate?: string;
  area?: string;
  service?: string;
}

export const HierarchySchema = new mongoose.Schema({
  repo: { type: String, required: true },
  directorate: { type: String, default: "Unallocated" },
  function_name: { type: String, default: "Unallocated" },
  subdirectorate: { type: String, default: "Unallocated" },
  area: { type: String, default: "Unallocated" },
  service: { type: String, default: "Unallocated" },
});

export const HierarchyModel = mongoose.model<IHierarchy>(
  "Hierarchy",
  HierarchySchema
);
