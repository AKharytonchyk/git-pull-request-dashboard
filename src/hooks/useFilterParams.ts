import React from "react";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { useSearchParams } from "react-router";

export const useFilterParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = React.useState<string>("");
  const [includeLabels, setIncludeLabels] = React.useState<string[]>([]);
  const [excludeLabels, setExcludeLabels] = React.useState<string[]>([]);

  React.useEffect(() => {
    const incParam = searchParams.get("inc") ?? "";
    const excParam = searchParams.get("exc") ?? "";
    const filterParam = searchParams.get("filter") ?? "";

    if (incParam) {
      setIncludeLabels(decompressFromEncodedURIComponent(incParam).split(","));
    }
    if (excParam) {
      setExcludeLabels(decompressFromEncodedURIComponent(excParam).split(","));
    }
    if (filterParam) {
      setFilter(decompressFromEncodedURIComponent(filterParam));
    }
  }, [searchParams]);

  const updateSearchParams = React.useCallback(
    (value: string | string[], type: "inc" | "exc" | "filter") => {
      const newSearchParams = new URLSearchParams(searchParams);

      if (Array.isArray(value) && value.length === 0) {
        newSearchParams.delete(type);
      } else if (value) {
        const compressedValue = Array.isArray(value)
          ? compressToEncodedURIComponent(value.join(","))
          : compressToEncodedURIComponent(value);
        newSearchParams.set(type, compressedValue);
      }

      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams]
  );

  return {
    filter,
    setFilter: (value: string) => updateSearchParams(value, "filter"),
    includeLabels,
    setIncludeLabels: (labels: string[]) => updateSearchParams(labels, "inc"),
    excludeLabels,
    setExcludeLabels: (labels: string[]) => updateSearchParams(labels, "exc"),
  };
};
