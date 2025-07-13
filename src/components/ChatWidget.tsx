import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { API_CONFIG, buildApiUrl } from "../config/api";

// Simple random number generator for demo messages
const randomInt = (min: number = 0, max: number = 10000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

interface ChatWidgetProps {
  onChatStart: (message: string, conversationId: string) => void;
}

export default function ChatWidget({ onChatStart }: ChatWidgetProps) {
  const [message, setMessage] = useState(
    randomInt() + " What do to if you catch a tiger by the tail?"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);

    // Generate a conversationId like the test script does
    const conversationId = `chat-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;
    console.log("WIDGET: Generated conversation ID:", conversationId);
    console.log("WIDGET: Starting chat with message:", message.trim());

    // Immediately start the chat - let ChatWindow handle sending the message via socket
    onChatStart(message.trim(), conversationId);
    setMessage(""); // Clear the input
    setIsLoading(false);
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

        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          fullWidth
        >
          {isLoading ? "Starting..." : "Request Chat"}
        </Button>
      </Box>
    </Paper>
  );
}
