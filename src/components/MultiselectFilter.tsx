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
import React from "react";
import replaceEmoticons from "../utils/replaceEmoticons";

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

  const id = React.useMemo(() => name.split(" ").join("-").toLowerCase(), [name]);
  const labelId = React.useMemo(() => `${id}-label`, [id]);

  return (
    <FormControl sx={{ m: 1, minWidth: 300 }}>
      <InputLabel id={labelId} size="small">{name}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        multiple
        value={selectedOptions}
        onChange={handleChange}
        size="small"
        input={<OutlinedInput size="small" id="select-multiple-chip" label="Chip" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={replaceEmoticons(value)} size="small"/>
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {replaceEmoticons(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
