import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useAppSelector } from "@/store/hooks";

const HomePage: React.FC = () => {
  const router = useRouter();
  const { viewMode, isDevelopmentMode } = useAppSelector((state) => state.app);

  useEffect(() => {
    if (isDevelopmentMode) {
      // In development, show based on current view mode
      if (viewMode === "app") {
        router.push("/app");
      } else {
        // Default to the only allowed form-marv route in development
        router.push("/public/form-marv/demo-token/demo-form-id");
      }
    } else {
      // In production, root should not be accessible
      router.push("/404");
    }
  }, [router, viewMode, isDevelopmentMode]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Box textAlign="center">
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">Redirecting...</Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
