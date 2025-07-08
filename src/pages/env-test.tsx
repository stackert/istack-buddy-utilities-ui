import { Typography, Container, Box, Paper } from "@mui/material";
import Navigation from "../components/Navigation";
import { API_CONFIG } from "../config/api";

export default function EnvTest() {
  const host = process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST;
  const port = process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST_PORT;

  return (
    <Navigation>
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            py: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Environment Configuration Test
          </Typography>

          <Paper
            elevation={2}
            sx={{
              p: 3,
              backgroundColor: "background.paper",
              width: "100%",
              maxWidth: 600,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Environment Variables:
            </Typography>

            <Box sx={{ fontFamily: "monospace", mt: 2 }}>
              <Typography variant="body2">
                <strong>NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST:</strong>{" "}
                {host || "undefined"}
              </Typography>
              <Typography variant="body2">
                <strong>NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST_PORT:</strong>{" "}
                {port || "undefined"}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Computed API Configuration:
            </Typography>

            <Box sx={{ fontFamily: "monospace", mt: 2 }}>
              <Typography variant="body2">
                <strong>Chat Server URL:</strong> {API_CONFIG.CHAT_SERVER_URL}
              </Typography>
              <Typography variant="body2">
                <strong>Messages Endpoint:</strong> {API_CONFIG.CHAT_SERVER_URL}
                {API_CONFIG.ENDPOINTS.MESSAGES}
              </Typography>
              <Typography variant="body2">
                <strong>Conversations Endpoint:</strong>{" "}
                {API_CONFIG.CHAT_SERVER_URL}
                {API_CONFIG.ENDPOINTS.CONVERSATIONS}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              CORS Configuration Check:
            </Typography>

            <Box
              sx={{
                fontFamily: "monospace",
                mt: 2,
                p: 2,
                bgcolor: "background.default",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                <strong>Client Origin:</strong>{" "}
                {typeof window !== "undefined"
                  ? window.location.origin
                  : "Loading..."}
              </Typography>
              <Typography variant="body2">
                <strong>Server URL:</strong> {API_CONFIG.CHAT_SERVER_URL}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                <strong>Cross-Origin Request:</strong>{" "}
                {typeof window !== "undefined" &&
                window.location.origin !== API_CONFIG.CHAT_SERVER_URL
                  ? "⚠️ YES - CORS configuration required on server"
                  : "✅ NO - Same origin, no CORS needed"}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Instructions:
            </Typography>

            <Typography variant="body2" component="div">
              <ol>
                <li>
                  Environment variables should be loaded from{" "}
                  <code>.env.local</code>
                </li>
                <li>
                  If values show "undefined", the environment file may not be
                  loaded
                </li>
                <li>
                  Check that <code>.env.local</code> exists in the project root
                </li>
                <li>
                  Restart the dev server after making changes to environment
                  files
                </li>
                <li>
                  <strong>CORS Issue:</strong> If you see cross-origin warning
                  above, your server needs CORS headers for the client origin
                </li>
              </ol>
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Navigation>
  );
}
