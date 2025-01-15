import React from "react";
import { TableCell, TableRow } from "@mui/material";
import { CoverageDetails } from "../models/CoverageDetails";
import { CoverageCell } from "./CoverageCell";

export const SummaryRow: React.FC<{ data: CoverageDetails[] }> = ({ data }) => {
  const summaryData = React.useMemo(() => {
    return {
      lines:
        data.reduce((acc, curr) => acc + curr.current.lines, 0) / data.length,
      statements:
        data.reduce((acc, curr) => acc + curr.current.statements, 0) /
        data.length,
      functions:
        data.reduce((acc, curr) => acc + curr.current.functions, 0) /
        data.length,
      branches:
        data.reduce((acc, curr) => acc + curr.current.branches, 0) /
        data.length,
    };
  }, [data]);

  return (
    <TableRow key="Summary" sx={{ borderTopWidth: "2px" }}>
      <TableCell sx={{ fontWeight: "bold" }}>Summary</TableCell>
      <CoverageCell coverage={summaryData.lines} previous={0} />
      <CoverageCell coverage={summaryData.statements} previous={0} />
      <CoverageCell coverage={summaryData.functions} previous={0} />
      <CoverageCell coverage={summaryData.branches} previous={0} />
    </TableRow>
  );
};
