import { Tooltip } from "@mui/material";
import Chip, { ChipOwnProps } from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

export type AsyncChipProps = {
  isLoading: boolean;
  tooltip?: string;
  loaderColor?:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "inherit";
};

export const AsyncChip: React.FC<AsyncChipProps & ChipOwnProps> = ({
  isLoading,
  loaderColor = "primary",
  tooltip,
  ...props
}) => {
  return isLoading ? (
    <CircularProgress size={24} color={loaderColor} />
  ) : tooltip ? (
    <Tooltip title={tooltip}>
      <Chip {...props} />
    </Tooltip>
  ) : (
    <Chip {...props} />
  );
};
