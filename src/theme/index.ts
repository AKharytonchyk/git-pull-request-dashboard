import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
  },
  // override BottomNavigationAction
  components: {
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          backgroundColor: "#272727",
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f48fb1",
    },
  },
  // override BottomNavigationAction
  components: {
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5",
        },
      },
    },
  },
});
