import React, { useEffect } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { useRouter } from "next/router";
import { useAppSelector } from "@/store/hooks";
import AppViewLayout from "@/components/Layout/AppViewLayout";

const AppPage: React.FC = () => {
  const { isDevelopmentMode } = useAppSelector((state) => state.app);
  const router = useRouter();

  useEffect(() => {
    // In production, this page should not be accessible
    if (!isDevelopmentMode) {
      router.push("/404");
    }
  }, [isDevelopmentMode, router]);

  // Don't render in production
  if (!isDevelopmentMode) {
    return null;
  }

  return (
    <AppViewLayout>
      <Box>
        <Typography variant="h2" gutterBottom>
          Welcome to iStack Buddy
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Application Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              This is the main application view. In the future, this will
              contain the full application with user management, authentication,
              and other features.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the navigation on the left to access different sections of the
              application.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </AppViewLayout>
  );
};

export default AppPage;
