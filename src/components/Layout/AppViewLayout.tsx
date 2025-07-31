import React from "react";
import { Box, Toolbar } from "@mui/material";
import AppNavigation from "./AppNavigation";

interface AppViewLayoutProps {
  children: React.ReactNode;
}

const AppViewLayout: React.FC<AppViewLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppNavigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppViewLayout;
