import {
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Box,
  Chip,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { on } from "events";
import React from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export type MultiselectFilterProps = {
  options: string[];
  name: string;
  onChange: (value: string[]) => void;
};

export const MultiselectFilter: React.FC<MultiselectFilterProps> = ({
  options,
  name,
  onChange,
}) => {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const handleChange = (event: SelectChangeEvent<typeof selectedOptions>) => {
    const {
      target: { value },
    } = event;

    const newValue = typeof value === "string" ? value.split(",") : value;
    setSelectedOptions(newValue);
    onChange(newValue);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 300 }}>
      <InputLabel id="options-label" size="small">{name}</InputLabel>
      <Select
        labelId="options-label"
        id="options"
        multiple
        value={selectedOptions}
        onChange={handleChange}
        size="small"
        input={<OutlinedInput size="small" id="select-multiple-chip" label="Chip" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} size="small"/>
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
