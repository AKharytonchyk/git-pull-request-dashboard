// get changes from the last commit
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

// console.warn("parsedSummary", parsedSummary);

repositories.forEach((repo) => {
  if (!fs.existsSync(repo.coverage)) {
    return;
  }

  const { total } = JSON.parse(fs.readFileSync(repo.coverage, "utf-8"));
  const { current: storedCoverage } = parsedSummary[repo.name] || {};

  const updatedCoverage = Object.keys(total).reduce((acc, key) => {
    const current = total[key].pct;
    const previous = storedCoverage?.[key] || 0;
    const diff = current - previous;

    if (acc.current === undefined) {
      acc.current = {};
    }
    if (acc.previous === undefined) {
      acc.previous = {};
    }
    if (acc.diff === undefined) {
      acc.diff = {};
    }

    acc.current[key] = current;
    acc.diff[key] = diff;
    acc.changed = diff !== 0 && previous !== 0;

    return acc;
  }, {});

  parsedSummary[repo.name] = updatedCoverage;
  fs.rmSync(repo.path, { recursive: true });
});

console.warn("parsedSummary", parsedSummary);
fs.writeFileSync(
  parsedSummaryPath,
  lz.compressToBase64(JSON.stringify(parsedSummary))
);
