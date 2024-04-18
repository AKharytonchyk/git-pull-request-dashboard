import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  CircularProgress,
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

interface CoverageData {
  lines: { pct: number };
  statements: { pct: number };
  functions: { pct: number };
  branches: { pct: number };
}

interface RepositoryData {
  repoName: string;
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

const coverageStyles = (coverage: number) => {
  console.log(coverage, coverage < 60);
  if (coverage < 60) return { color: "#f44336", fontWeight: "bolder" };
  if (coverage < 80) return { color: "#ed6c02", fontWeight: "bold" };
  return { color: "#4caf50", fontWeight: "normal" };
};

const calculateSummary = (tableData: RepositoryData[]) => ({
  lines: (
    tableData.reduce((acc: any, row: { lines: any; }) => acc + row.lines, 0) / tableData.length
  ).toFixed(2),
  statements: (
    tableData.reduce((acc: any, row: { statements: any; }) => acc + row.statements, 0) / tableData.length
  ).toFixed(2),
  functions: (
    tableData.reduce((acc: any, row: { functions: any; }) => acc + row.functions, 0) / tableData.length
  ).toFixed(2),
  branches: (
    tableData.reduce((acc: any, row: { branches: any; }) => acc + row.branches, 0) / tableData.length
  ).toFixed(2),
});

export const Coverage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coverage"],
    queryFn: async () => {
      const coverage = await fetch("coverage.json", {
        headers: {
          Accept: "application/json",
        },
      });
      return coverage.json() as Promise<Record<string, CoverageData>> ;
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

  const summaryData = React.useMemo(
    () => calculateSummary(tableData),
    [tableData]
  );

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }
  return (
    <Box padding={2} width={"calc(100vw - 2em)"}>
      <h1>Coverage</h1>
      {isLoading && <CircularProgress color="inherit" />}
      {isError && <ErrorMessage showError={true} />}
      {data && tableData.length === 0 && (
        <Typography variant="h6">
          No coverage matching you selected repositories was found!
        </Typography>
      )}
      {tableData && tableData.length > 0 && (
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
                  {summaryData.lines}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {summaryData.statements}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {summaryData.functions}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {summaryData.branches}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
