import React from "react";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useAppSelector } from "@/store/hooks";

const Custom404: React.FC = () => {
  const router = useRouter();
  const { isDevelopmentMode } = useAppSelector((state) => state.app);

  const goToDemo = () => {
    router.push("/public/form-marv/demo-token/demo-form-id");
  };

  const goToApp = () => {
    router.push("/app");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Card sx={{ maxWidth: 600, textAlign: "center" }}>
        <CardContent>
          <Typography variant="h3" gutterBottom color="error">
            404 - Page Not Found
          </Typography>

          <Typography variant="body1" paragraph>
            This application only serves content at specific URLs.
          </Typography>

          <Typography variant="body2" paragraph color="text.secondary">
            Valid URL: <code>/public/form-marv/demo-token/demo-form-id</code>
          </Typography>

          {isDevelopmentMode && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Development Options
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button variant="contained" onClick={goToDemo}>
                  Go to Demo Form MARV
                </Button>
                <Button variant="outlined" onClick={goToApp}>
                  Go to App View
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Custom404;
