import mongoose from "mongoose";

export interface IHierarchy {
  repo?: string;
  directorate: string;
  function_name?: string;
  subdirectorate?: string;
  area?: string;
  service?: string;
}

export interface IStoredHierarchy extends IHierarchy {
  _id: mongoose.Types.ObjectId;
}

export const HierarchySchema = new mongoose.Schema({
  repo: { type: String },
  directorate: { type: String, required: true },
  function_name: {
    type: String,
    required: function (this: IHierarchy) {
      return (
        (this.subdirectorate || this.area || this.service || this.repo) &&
        !this.function_name
      );
    },
  },
  subdirectorate: {
    type: String,
    required: function (this: IHierarchy) {
      return (this.area || this.service || this.repo) && !this.subdirectorate;
    },
  },
  area: {
    type: String,
    required: function (this: IHierarchy) {
      return (this.service || this.repo) && !this.area;
    },
  },
  service: {
    type: String,
    required: function (this: IHierarchy) {
      return this.repo && !this.service;
    },
  },
});

export const HierarchyModel =
  mongoose.models.HierarchyModel ||
  mongoose.model<IHierarchy>("Hierarchy", HierarchySchema);
