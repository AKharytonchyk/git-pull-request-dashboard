const fs = require("fs");
const path = require("path");
const lz = require("lz-string");
const root = path.resolve(__dirname, "..");
const parsedSummaryPath = path.resolve(root, "parsed-summary.txt");
const coveragePath = path.resolve(root, "coverage");

const repositories = fs.readdirSync(coveragePath).flatMap((owner) =>
  fs
    .readdirSync(path.resolve(coveragePath, owner))
    .map((repo) => `${owner}/${repo}`)
    .map((repo) => ({
      name: repo,
      path: path.resolve(coveragePath, repo),
      report: path.resolve(coveragePath, repo, "report.json"),
      coverage: path.resolve(coveragePath, repo, "coverage-summary.json"),
    }))
);

const parsedSummary = fs.existsSync(parsedSummaryPath)
  ? JSON.parse(
      lz.decompressFromBase64(fs.readFileSync(parsedSummaryPath, "utf-8"))
    )
  : {};

repositories.forEach((repo) => {
  if (!fs.existsSync(repo.coverage)) {
    return;
  }

  const { total } = JSON.parse(fs.readFileSync(repo.coverage, "utf-8"));
  const storedCoverage = parsedSummary[repo.name]?.current || {};

  const updatedCoverage = Object.keys(total).reduce(
    (acc, key) => {
      const current = total[key].pct;
      const previous = storedCoverage[key] || 0;
      const diff = current - previous;

      acc.current[key] = current;
      acc.previous[key] = previous;
      acc.diff[key] = diff;

      return acc;
    },
    { current: {}, previous: {}, diff: {} }
  );

  if (Object.keys(updatedCoverage.diff).some(key => updatedCoverage.diff[key] !== 0)) {
    console.log(`Updated coverage for ${repo.name}:`, updatedCoverage);
  }

  parsedSummary[repo.name] = {
    ...parsedSummary[repo.name],
    current: updatedCoverage.current,
    diff: updatedCoverage.diff,
  };
});

fs.writeFileSync(
  parsedSummaryPath,
  lz.compressToBase64(JSON.stringify(parsedSummary)),
  "utf-8"
);