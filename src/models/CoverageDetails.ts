import { CoverageValues } from "./CoverageValues";

export interface CoverageDetails {
  current: CoverageValues;
  previous: CoverageValues;
  diff: CoverageValues;
  changed: string;
}
