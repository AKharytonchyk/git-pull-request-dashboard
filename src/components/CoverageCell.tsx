import React from "react";
import { Box, TableCell, Tooltip, Typography } from "@mui/material";
import RYGGradient from "../utils/RYGGradient";
import { CoverageDiffIcon } from "./CoverageDiffIcon";

export const CoverageCell: React.FC<{ coverage: number; previous: number }> = ({
  coverage,
  previous,
}) => {
  const randomPrevios0to100 = Math.floor(Math.random() * 100);
  const icon = React.useMemo(
    () => CoverageDiffIcon(coverage - randomPrevios0to100, randomPrevios0to100),
    [coverage, randomPrevios0to100]
  );

  const styles = React.useMemo(() => RYGGradient(coverage), [coverage]);
  return (
    <TableCell sx={styles}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", maxWidth: "4.5em" }}>
        <Typography variant="body1">{Math.round(coverage)}%</Typography>
        {icon}
      </Box>
    </TableCell>
  );
};
