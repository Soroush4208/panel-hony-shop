import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "'Vazirmatn', 'Roboto', sans-serif"
  },
  palette: {
    mode: "light",
    primary: {
      main: "#d97706"
    },
    secondary: {
      main: "#1d4ed8"
    },
    background: {
      default: "#f7f7f7",
      paper: "#ffffff"
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600
        }
      }
    }
  }
});

export default theme;

