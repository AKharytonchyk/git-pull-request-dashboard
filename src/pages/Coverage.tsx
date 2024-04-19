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
  Tooltip,
  Typography,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import { ConfigContext } from "../App";
import ErrorMessage from "../components/MissingCoverageErrorMessage";
import lz from "lz-string";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

interface CoverageDetails {
  current: CoverageValues;
  previous: CoverageValues;
  diff: CoverageValues;
  changed: string;
}

interface CoverageValues {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

interface CoverageResponse {
  [key: string]: CoverageDetails;
}

const coverageStyles = (coverage: number) => {
  console.log(coverage, coverage < 60);
  if (coverage < 60) return { color: "#f44336", fontWeight: "bolder" };
  if (coverage < 80) return { color: "#ed6c02", fontWeight: "bold" };
  return { color: "#4caf50", fontWeight: "normal" };
};

const coverageDiffIcon = (diff: number, prev: number) => {
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

const CoverageCell: React.FC<{ coverage: number; previous: number }> = ({
  coverage,
  previous,
}) => {
  const icon = React.useMemo(
    () => coverageDiffIcon(coverage - previous, previous),
    [coverage, previous]
  );
  const styles = React.useMemo(() => coverageStyles(coverage), [coverage]);
  return (
    <TableCell sx={styles}>
      {coverage.toFixed(2)} {icon}
    </TableCell>
  );
};

const CoverageRow: React.FC<{ data: CoverageDetails; name: string }> = ({
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

const SummaryRow: React.FC<{ data: CoverageDetails[] }> = ({ data }) => {
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
    <TableRow key="Summary">
      <TableCell sx={{ fontWeight: "bold" }}>Summary</TableCell>
      <CoverageCell coverage={summaryData.lines} previous={0} />
      <CoverageCell coverage={summaryData.statements} previous={0} />
      <CoverageCell coverage={summaryData.functions} previous={0} />
      <CoverageCell coverage={summaryData.branches} previous={0} />
    </TableRow>
  );
};

export const Coverage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coverage"],
    queryFn: async () => {
      const coverage = await fetch("parsed-summary.txt", {
        headers: {
          Accept: "text/plain",
          "Cache-Control": "no-cache",
        },
      });
      const textResponse = await coverage.text();
      const text = lz.decompressFromBase64(textResponse);
      return JSON.parse(text) as CoverageResponse;
    },
    retry: false,
  });

  const dataLength = React.useMemo(() => Object.keys(data || {}).length, [data]);

  const { repositorySettings } = React.useContext(ConfigContext);

  const tableRows = React.useMemo(() => {
    if (!data) return [];
    const rows = Object.keys(data)
      .filter((key) => repositorySettings[key])
      .map((key) => {
        const { current, previous, diff, changed } = data[key];

        return (
          <CoverageRow
            key={key}
            name={key}
            data={{ current, previous, diff, changed }}
          />
        );
      });

    rows.push(<SummaryRow key="Summary" data={Object.values(data)} />);

    return rows;
  }, [data, repositorySettings]);

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Box padding={2} width={"calc(100vw - 2em)"}>
      <h1>Coverage</h1>
      {isLoading && <CircularProgress color="inherit" />}
      {isError && <ErrorMessage showError={true} />}
      {data && dataLength === 0 && (
        <Typography variant="h6">
          No coverage matching you selected repositories was found!
        </Typography>
      )}
      {data && dataLength > 0 && (
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
            <TableBody>{tableRows}</TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
