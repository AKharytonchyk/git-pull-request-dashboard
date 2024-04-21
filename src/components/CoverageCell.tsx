import React from "react";
import { TableCell } from "@mui/material";
import RYGGradient from "../utils/RYGGradient";
import { CoverageDiffIcon } from "./CoverageDiffIcon";

export const CoverageCell: React.FC<{ coverage: number; previous: number; }> = ({
  coverage, previous,
}) => {
  const icon = React.useMemo(
    () => CoverageDiffIcon(coverage - (previous), previous),
    [coverage, previous]
  );
  const styles = React.useMemo(() => RYGGradient(coverage), [coverage]);
  return (
    <TableCell sx={styles}>{Math.round(coverage)}% {icon}</TableCell>
  );
};
