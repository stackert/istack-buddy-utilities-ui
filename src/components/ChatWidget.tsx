import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { API_CONFIG, buildApiUrl } from "../config/api";

interface ChatWidgetProps {
  onChatStart: (message: string, conversationId: string) => void;
}

const randomInt = (min: number = 0, max: number = 10000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function ChatWidget({ onChatStart }: ChatWidgetProps) {
  const [message, setMessage] = useState(
    randomInt() + " What do to if you catch a tiger by the tail?"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Helper to detect CORS scenarios
  const isLikelyCorsIssue = () => {
    if (typeof window === "undefined") return false;
    const currentOrigin = window.location.origin;
    const serverUrl = API_CONFIG.CHAT_SERVER_URL;
    return currentOrigin !== serverUrl && !serverUrl.startsWith(currentOrigin);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setServerError(null); // Clear any previous errors

    try {
      // HTTP POST to create new message (real server endpoint)
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.MESSAGES), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        try {
          const data = await response.json();
          // The real server response might include conversationId or we may need to extract it
          const conversationId =
            data.conversationId || data.conversation_id || data.id || "default";
          onChatStart(message.trim(), conversationId);
          setMessage(""); // Clear the input
          setServerError(null); // Clear any errors on success
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          setServerError("Server returned invalid response. Please try again.");
        }
      } else {
        console.error(
          "Failed to send message:",
          response.status,
          response.statusText
        );

        // Check for CORS-related issues
        if (response.type === "opaque" || response.status === 0) {
          setServerError(
            "Server access blocked by browser security policy (CORS). Please contact support."
          );
          return;
        }

        try {
          const errorData = await response.text();
          console.error("Server response:", errorData);
        } catch (textError) {
          // This often indicates CORS or other access issues
          console.error("Cannot read error response:", textError);
          setServerError(
            "Server access blocked. Please check server CORS configuration."
          );
          return;
        }

        // Set user-friendly error message based on status
        if (response.status >= 500) {
          setServerError(
            "Message server is experiencing issues. Please try again later."
          );
        } else if (response.status === 404) {
          setServerError(
            "Chat service not found. Please check if the server is running."
          );
        } else if (response.status === 403) {
          setServerError(
            "Access forbidden. Server may need CORS configuration."
          );
        } else {
          setServerError("Unable to send message. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error starting chat:", error);

      // Handle network/connection errors with user-friendly messages
      if (error instanceof TypeError) {
        const errorMessage = error.message.toLowerCase();

        // Check for CORS-specific error patterns
        if (
          errorMessage.includes("cors") ||
          errorMessage.includes("cross-origin") ||
          errorMessage.includes("not allowed by access-control-allow-origin")
        ) {
          setServerError(
            "Server access blocked by CORS policy. Please contact support to configure server."
          );
        } else if (
          errorMessage.includes("fetch") ||
          errorMessage.includes("network") ||
          errorMessage.includes("failed to fetch")
        ) {
          // For "Failed to fetch" errors, check if we're making cross-origin requests
          const serverUrl = API_CONFIG.CHAT_SERVER_URL;
          const currentOrigin = window.location.origin;

          if (
            serverUrl !== currentOrigin &&
            !serverUrl.startsWith(currentOrigin)
          ) {
            setServerError(
              "Cross-origin request blocked (likely CORS issue). Server needs CORS configuration for " +
                currentOrigin
            );
          } else {
            setServerError(
              "Can't connect to message server. Please check your connection and try again."
            );
          }
        } else {
          setServerError("Connection error. Please try again later.");
        }
      } else {
        setServerError("Message server not available. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 400,
        margin: "auto",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Start Chat
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          multiline
          rows={4}
          placeholder="Enter your message to start a chat..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          fullWidth
          variant="outlined"
        />

        {serverError && (
          <Alert
            severity="error"
            onClose={() => setServerError(null)}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setServerError(null);
                  if (message.trim()) {
                    handleSend();
                  }
                }}
              >
                Try Again
              </Button>
            }
          >
            {serverError}
            {isLikelyCorsIssue() && (
              <Typography variant="body2" sx={{ mt: 1, fontSize: "0.85em" }}>
                <strong>Debug Info:</strong> Client is running on{" "}
                {typeof window !== "undefined"
                  ? window.location.origin
                  : "unknown"}
                , trying to connect to {API_CONFIG.CHAT_SERVER_URL}. This
                requires CORS headers on the server.
              </Typography>
            )}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
          fullWidth
        >
          {isLoading ? "Starting Chat..." : "Request Chat"}
        </Button>
      </Box>
    </Paper>
  );
}
