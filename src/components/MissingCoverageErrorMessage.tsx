import React from "react";
import { Alert, Box } from "@mui/material";

const ErrorMessage: React.FC<{ showError: boolean }> = ({ showError }) => {
  if (!showError) return null;

  return (
    <Box sx={{ margin: 2 }}>
      <Alert severity="error">
        <strong>No coverage data found!</strong>
        <br />
        Please ensure that you have generated a <code>coverage.json</code> file
        using Jest with the <code>json-summary</code> reporter. The expected
        JSON structure should resemble the following:
        <pre>
          {JSON.stringify(
            {
              "your-repository-name": {
                lines: { total: 100, covered: 50, skipped: 0, pct: 50 },
                statements: { total: 200, covered: 100, skipped: 0, pct: 50 },
                functions: { total: 20, covered: 10, skipped: 0, pct: 50 },
                branches: { total: 30, covered: 15, skipped: 0, pct: 50 },
              },
              // Additional repositories can follow the same structure
            },
            null,
            2
          )}
        </pre>
        To generate this file, add the following configuration to your Jest
        setup:
        <pre>{`"jest": {
  "collectCoverage": true,
  "coverageReporters": ["json-summary"]
}`}</pre>
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
