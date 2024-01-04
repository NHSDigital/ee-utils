declare type MetricRating = "A" | "B" | "C" | "D" | "E";
declare type HealthStatuses = "Green" | "Amber" | "Red" | "Grey";

declare interface RepoDependabot {
  name: string;
  dependabotEnabled: boolean;
  criticalDependabot: number;
  highDependabot: number;
  mediumDependabot: number;
  lowDependabot: number;
  dependabotPoints: number;
  dependabotScore: HealthStatuses;
}

declare type RepoSonarcloud = {
  name: string;
  sonarcloudEnabled: boolean;
  codeCoverage: number;
  codeCoverageScore: HealthStatuses;
  securityRating: MetricRating;
  linesOfCode: number;
  bugs: number;
  reliabilityRating: MetricRating;
  codeSmells: number;
  sqaleRating: MetricRating;
  duplicatedLinesDensity: string;
};

declare type SeqfCompliance = {
  name: string;
  compliant: HealthStatuses;
  approvalsRequired: boolean;
  pullRequestRequired: boolean;
  signaturesRequired: boolean;
};

declare type RepoGitHub = {
  name: string;
  archived: boolean;
  contributors: number;
  githubActionMinutes: number;
};

declare type Repo = {
  id: number;
  node_id: number;
  name: string;
  full_name: string;
  owner: string;
  visibility: "internal" | "private" | "public";
  language: string;
  size: number;
  url: string | null;
  overallRepoHealth: HealthStatuses;
};
