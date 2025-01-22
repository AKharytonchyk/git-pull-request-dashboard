import { green, red, amber, blue } from "@mui/material/colors";

export const getColorForDaysInReview = (createdAt: Date | undefined) => {
  if (!createdAt) return blue[500];

  const today = new Date();
  const daysInReview = Math.floor(
    (today.getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24)
  );

  if (daysInReview < 3) return green[500];
  if (daysInReview < 7) return amber[500];
  return red[500];
};
