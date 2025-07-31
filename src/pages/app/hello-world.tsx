import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import AppViewLayout from "@/components/Layout/AppViewLayout";

const HelloWorldPage: React.FC = () => {
  return (
    <AppViewLayout>
      <Box>
        <Typography variant="h2" gutterBottom>
          Hello World
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Hello World!
            </Typography>
            <Typography variant="body1" paragraph>
              This is a simple Hello World page to demonstrate the navigation
              structure of the application.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can use the navigation on the left to switch between different
              sections of the application.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </AppViewLayout>
  );
};

export default HelloWorldPage;
