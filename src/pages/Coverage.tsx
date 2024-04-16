import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import { ConfigContext } from "../App";
import ErrorMessage from "../components/MissingCoverageErrorMessage";

const coverageStyles = (coverage: number) => {
  console.log(coverage, coverage < 60);
  if (coverage < 60) return { color: "#f44336", fontWeight: "bolder" };
  if (coverage < 80) return { color: "#ed6c02", fontWeight: "bold" };
  return { color: "#4caf50", fontWeight: "normal" };
};

export const Coverage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coverage"],
    queryFn: async () => {
      const coverage = await fetch("coverage.json", {
        headers: {
          Accept: "application/json",
        },
      });
      return coverage.json();
    },
    retry: false,
  });

  const { repositorySettings } = React.useContext(ConfigContext);

  const tableData = React.useMemo(() => {
    if (!data) return [];
    return Object.keys(data)
      .filter((key) => repositorySettings[key])
      .map((key) => {
        return {
          repoName: key,
          lines: data[key].lines.pct,
          statements: data[key].statements.pct,
          functions: data[key].functions.pct,
          branches: data[key].branches.pct,
        };
      });
  }, [data, repositorySettings]);

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }
  return (
    <Box padding={2} width={"calc(100vw - 2em)"}>
      <h1>Coverage</h1>
      {isLoading && <p>Loading...</p>}
      {isError && <ErrorMessage showError={true} />}
      {data && data.length === 0 && (
        <Typography variant="h6">
          No coverage matching you selected repositories was found!
        </Typography>
      )}
      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Repository</TableCell>
                <TableCell>Lines</TableCell>
                <TableCell>Statements</TableCell>
                <TableCell>Functions</TableCell>
                <TableCell>Branches</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.repoName}>
                  <TableCell>{row.repoName}</TableCell>
                  <TableCell sx={coverageStyles(row.lines)}>
                    {row.lines}
                  </TableCell>
                  <TableCell sx={coverageStyles(row.statements)}>
                    {row.statements}
                  </TableCell>
                  <TableCell sx={coverageStyles(row.functions)}>
                    {row.functions}
                  </TableCell>
                  <TableCell sx={coverageStyles(row.branches)}>
                    {row.branches}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow key="Summary">
                <TableCell sx={{ fontWeight: "bold" }}>Summary</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {tableData.reduce((acc, row) => acc + row.lines, 0) /
                    tableData.length}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {tableData.reduce((acc, row) => acc + row.statements, 0) /
                    tableData.length}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {tableData.reduce((acc, row) => acc + row.functions, 0) /
                    tableData.length}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {tableData.reduce((acc, row) => acc + row.branches, 0) /
                    tableData.length}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
