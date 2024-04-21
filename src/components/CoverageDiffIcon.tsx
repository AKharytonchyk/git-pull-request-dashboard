import React from "react";
import { Tooltip } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

export const CoverageDiffIcon = (diff: number, prev: number) => {
  if (prev === 0) return;
  if (diff > 0) {
    return (
      <Tooltip title={`+${diff.toFixed(2)}%`}>
        <ArrowUpward color="success" />
      </Tooltip>
    );
  }
  if (diff < 0) {
    return (
      <Tooltip title={`-${diff.toFixed(2)}%`}>
        <ArrowDownward color="error" />
      </Tooltip>
    );
  }
};
