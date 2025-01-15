import React from "react";
import { Box, TableCell, Typography } from "@mui/material";
import RYGGradient from "../utils/RYGGradient";
import { CoverageDiffIcon } from "./CoverageDiffIcon";

export const CoverageCell: React.FC<{ coverage: number; previous: number }> = ({
  coverage,
  previous,
}) => {
  const icon = React.useMemo(
    () => CoverageDiffIcon(coverage - previous, previous),
    [coverage, previous],
  );

  const styles = React.useMemo(() => RYGGradient(coverage), [coverage]);
  return (
    <TableCell sx={styles}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          maxWidth: "4.5em",
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: coverage < 50 ? "bolder" : "bold" }}
        >
          {Math.round(coverage)}%
        </Typography>
        {icon}
      </Box>
    </TableCell>
  );
};
