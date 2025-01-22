import {
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Chip,
} from "@mui/material";
import React from "react";
import replaceEmoticons from "../utils/replaceEmoticons";
import { Clear } from "@mui/icons-material";

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

  const handleClear = () => {
    setSelectedOptions([]);
    onChange([]);
  };

  const id = React.useMemo(
    () => name.split(" ").join("-").toLowerCase(),
    [name]
  );
  const labelId = React.useMemo(() => `${id}-label`, [id]);

  return (
    <FormControl sx={{ m: 1, width: 300, ml: 0 }}>
      <InputLabel id={labelId} size="small">
        {name}
      </InputLabel>
      <Select
        labelId={labelId}
        id={id}
        multiple
        value={selectedOptions}
        onChange={handleChange}
        size="small"
        input={
          <OutlinedInput size="small" id="select-multiple-chip" label="Chip" />
        }
        MenuProps={MenuProps}
        startAdornment={
          selectedOptions.length > 1 ? (
            <Chip
              label={selectedOptions.length}
              color="primary"
              size="small"
              sx={{ marginRight: 1 }}
            />
          ) : null
        }
        endAdornment={
          selectedOptions.length > 0 ? (
            <IconButton onClick={handleClear}>
              <Clear />
            </IconButton>
          ) : null
        }
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
