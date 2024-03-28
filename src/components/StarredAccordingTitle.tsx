import { Box } from "@mui/material";
import { Star } from "@mui/icons-material";

export const StarredTitle: React.FC = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Star sx={{ mr: 2, height: 40, width: 40 }} color="warning" />
      <div>Starred Repositories</div>
    </Box>
  );
};
