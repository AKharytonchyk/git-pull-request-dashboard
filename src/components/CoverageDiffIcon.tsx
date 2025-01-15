import { Tooltip } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

export const CoverageDiffIcon = (diff: number, prev: number) => {
  if (prev === 0)
    return <span style={{ fontSize: "1em", width: "1em" }}> </span>;
  if (diff > 0) {
    return (
      <Tooltip title={`+${diff.toFixed(2)}%`}>
        <ArrowUpward color="success" sx={{ fontSize: "1em" }} />
      </Tooltip>
    );
  }
  if (diff < 0) {
    return (
      <Tooltip title={`${diff.toFixed(2)}%`}>
        <ArrowDownward color="error" sx={{ fontSize: "1rem" }} />
      </Tooltip>
    );
  }
};
