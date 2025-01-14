import React from "react";
import { TableCell, TableRow } from "@mui/material";
import { CoverageDetails } from "../models/CoverageDetails";
import { CoverageCell } from "./CoverageCell";

export const CoverageRow: React.FC<{ data: CoverageDetails; name: string }> = ({
  name,
  data,
}) => {
  return (
    <TableRow key={name}>
      <TableCell>{name}</TableCell>
      <CoverageCell
        coverage={data.current.lines}
        previous={data.previous.lines}
      />
      <CoverageCell
        coverage={data.current.statements}
        previous={data.previous.statements}
      />
      <CoverageCell
        coverage={data.current.functions}
        previous={data.previous.functions}
      />
      <CoverageCell
        coverage={data.current.branches}
        previous={data.previous.branches}
      />
    </TableRow>
  );
};
