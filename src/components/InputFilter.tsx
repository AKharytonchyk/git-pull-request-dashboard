import { FormControl, InputLabel, OutlinedInput } from "@mui/material";
import React from "react";

export type InputFilterProps = {
  onChange: (value: string) => void;
  name: string;
  size?: any;
};

export const InputFilter: React.FC<InputFilterProps> = ({
  onChange,
  name,
  size = "medium",
}) => {
  const [filter, setFilter] = React.useState<string>("");

  const handleFilterChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <FormControl sx={{ m: 1, width: 300, ml: 0 }}>
      <InputLabel id="filter-label" size={size}>
        {name}
      </InputLabel>
      <OutlinedInput
        id="filter"
        label="Filter"
        value={filter}
        onChange={handleFilterChange}
        size={size}
      />
    </FormControl>
  );
};
