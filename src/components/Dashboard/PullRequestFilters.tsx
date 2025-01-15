import { useEffect, useMemo } from "react";
import { PullRequest } from "../../models/PullRequest";
import React from "react";
import { Box } from "@mui/material";
import { MultiselectFilter } from "../MultiselectFilter";

export type PullRequestFiltersProps = {
  pullRequests: PullRequest[];
  onChange: (pullRequests: PullRequest[]) => void;
};

type FilterProperties = {
  authors: string[];
  reviewers: string[];
  assignees: string[];
  repositories: string[];
  labels: string[];
  titles: string[];
  includeLabels: string[];
  excludeLabels: string[];
};

export const PullRequestFilters: React.FC<PullRequestFiltersProps> = ({
  pullRequests,
  onChange,
}) => {
  const { authors, reviewers, assignees, repositories, labels } =
    useMemo(() => {
      const data = {
        authors: new Set<string>(),
        reviewers: new Set<string>(),
        assignees: new Set<string>(),
        repositories: new Set<string>(),
        labels: new Set<string>(),
        title: new Set<string>(),
      };

      pullRequests.forEach((pr) => {
        data.authors.add(pr.user.login);
        pr.requested_reviewers.forEach((r) => data.reviewers.add(r.login));
        if (pr.assignee) data.assignees.add((pr.assignee as any).login);
        pr.assignees?.forEach((a) => data.assignees.add(a.login));
        if (pr.head.repo) data.repositories.add(pr.head.repo.full_name);
        pr.labels.forEach((l) => data.labels.add(l.name));
        data.title.add(pr.title);
      });

      return {
        authors: Array.from(data.authors),
        reviewers: Array.from(data.reviewers),
        assignees: Array.from(data.assignees),
        repositories: Array.from(data.repositories),
        labels: Array.from(data.labels),
        titles: Array.from(data.title),
        includeLabels: [],
        excludeLabels: [],
      } as FilterProperties;
    }, [pullRequests]);

  const [filterValues, setFilterValues] = React.useState<FilterProperties>({
    authors: [],
    reviewers: [],
    assignees: [],
    repositories: [],
    labels: [],
    titles: [],
    includeLabels: [],
    excludeLabels: [],
  });

  const onFilterChange = (filter: keyof FilterProperties, value: string[]) => {
    setFilterValues((prev) => ({ ...prev, [filter]: value }));
  };

  useEffect(() => {
    const filteredPulls = pullRequests.filter((pr) => {
      if (
        filterValues.authors.length > 0 &&
        !filterValues.authors.includes(pr.user.login)
      )
        return false;
      if (
        filterValues.reviewers.length > 0 &&
        !pr.requested_reviewers.some((r) =>
          filterValues.reviewers.includes(r.login)
        )
      )
        return false;
      if (
        filterValues.assignees.length > 0 &&
        !pr.assignees?.some((a) => filterValues.assignees.includes(a.login))
      )
        return false;
      if (
        filterValues.repositories.length > 0 &&
        !filterValues.repositories.includes(pr.head.repo.full_name)
      )
        return false;
      if (
        filterValues.includeLabels.length > 0 &&
        !pr.labels.some((l) => filterValues.includeLabels.includes(l.name))
      )
        return false;

      if (
        filterValues.excludeLabels.length > 0 &&
        pr.labels.some((l) => filterValues.excludeLabels.includes(l.name))
      )
        return false;

      if (
        filterValues.titles.length > 0 &&
        !filterValues.titles.includes(pr.title)
      )
        return false;

      return true;
    });

    onChange(filteredPulls);
  }, [filterValues, pullRequests, onChange]);

  const multiselectFIlterOptions = [
    {
      name: "Authors",
      options: authors,
      setSelected: (authors: string[]) => onFilterChange("authors", authors),
    },
    {
      name: "Reviewers",
      options: reviewers,
      setSelected: (reviewers: string[]) =>
        onFilterChange("reviewers", reviewers),
    },
    {
      name: "Assignees",
      options: assignees,
      setSelected: (assignees: string[]) =>
        onFilterChange("assignees", assignees),
    },
    {
      name: "Repositories",
      options: repositories,
      setSelected: (repositories: string[]) =>
        onFilterChange("repositories", repositories),
    },
    {
      name: "Include Labels",
      options: labels.filter(
        (label) => !filterValues.excludeLabels.includes(label)
      ),
      setSelected: (includeLabels: string[]) =>
        onFilterChange("includeLabels", includeLabels),
    },
    {
      name: "Exclude Lables",
      options: labels.filter(
        (label) => !filterValues.includeLabels.includes(label)
      ),
      setSelected: (excludeLabels: string[]) =>
        onFilterChange("excludeLabels", excludeLabels),
    },
  ];

  return (
    <Box>
      {multiselectFIlterOptions.map((filter) => (
        <MultiselectFilter
          key={filter.name}
          name={filter.name}
          options={filter.options}
          onChange={filter.setSelected}
        />
      ))}
    </Box>
  );
};
