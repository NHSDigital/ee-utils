export const BASE_AGGREGATION = {
  size: 200,
  averageCodeCoverage: 50,
  totalLinesOfCode: 2,
  averageBugs: 3,
  averageCodeSmells: 5.5,
  averageSecurityRating: "B",
  averageReliabilityRating: "C",
  averageSqaleRating: "C",
  proportionGreenRepos: 0.5,
  proportionAmberRepos: 0.5,
  proportionRedRepos: 0,
  criticalDependabot: 2,
  highDependabot: 5,
  mediumDependabot: 11,
  lowDependabot: 31,
  proportionDependabotEnabled: 1,
  overallServiceHealth: "Amber",
};

export const DIRECTORATE_1_AGGREGATION = {
  ...BASE_AGGREGATION,
  hierarchyItem: "Directorate 1",
};

export const FUNCTION_1_AGGREGATION = {
  ...BASE_AGGREGATION,
  hierarchyItem: "Function 1",
};

export const SUBDIRECTORATE_1_AGGREGATION = {
  ...BASE_AGGREGATION,
  hierarchyItem: "Subdirectorate 1",
};

export const AREA_1_AGGREGATION = {
  ...BASE_AGGREGATION,
  hierarchyItem: "Area 1",
};

export const SERVICE_1_AGGREGATION = {
  ...BASE_AGGREGATION,
  hierarchyItem: "Service 1",
};
