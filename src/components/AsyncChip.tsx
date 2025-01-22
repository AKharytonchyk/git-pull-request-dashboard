import Chip, { ChipOwnProps } from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

export type AsyncChipProps = {
  isLoading: boolean;
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
  ...props
}) => {
  return isLoading ? (
    <CircularProgress size={24} color={loaderColor} />
  ) : (
    <Chip {...props} />
  );
};
