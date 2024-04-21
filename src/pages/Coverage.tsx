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
import lz from "lz-string";
import { CoverageResponse } from "../models/CoverageResponse";
import { CoverageRow } from "../components/CoverageRow";
import { SummaryRow } from "../components/SummaryRow";

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

  const dataLength = React.useMemo(
    () => Object.keys(data || {}).length,
    [data]
  );

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
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="baseline"
      >
        <h1>Coverage</h1>
      </Box>
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
