import { useState } from "react";
import { Typography, Container, Box, Paper, Button } from "@mui/material";
import Navigation from "../components/Navigation";
import ChatWidget from "../components/ChatWidget";
import ChatWindow from "../components/ChatWindow";

export default function ChatTest() {
  const [activeChat, setActiveChat] = useState<{
    conversationId: string;
    initialMessage: string;
  } | null>(null);

  const handleChatStart = (message: string, conversationId: string) => {
    setActiveChat({
      conversationId,
      initialMessage: message,
    });
  };

  const handleChatClose = () => {
    setActiveChat(null);
  };

  const handleResetDemo = () => {
    setActiveChat(null);
  };

  return (
    <Navigation>
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            py: 2,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Chat Client Test
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This is a simple chat client for testing and development purposes.
              Start a conversation using the widget below, then interact with
              the chat window.
            </Typography>
          </Box>

          {!activeChat ? (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Step 1: Start a new chat
              </Typography>
              <ChatWidget onChatStart={handleChatStart} />

              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mt: 2,
                  backgroundColor: "info.main",
                  color: "info.contrastText",
                  maxWidth: 500,
                }}
              >
                <Typography variant="body2">
                  💡 <strong>How it works:</strong>
                  <br />
                  1. Enter your message in the textarea above
                  <br />
                  2. Click "Request Chat" to start a conversation
                  <br />
                  3. The chat window will open with WebSocket-like functionality
                  <br />
                  4. You can send follow-up messages and receive responses
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6">Step 2: Chat in progress</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleResetDemo}
                >
                  Reset Demo
                </Button>
              </Box>

              <ChatWindow
                conversationId={activeChat.conversationId}
                initialMessage={activeChat.initialMessage}
                onClose={handleChatClose}
              />

              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  backgroundColor: "success.main",
                  color: "success.contrastText",
                  maxWidth: 600,
                }}
              >
                <Typography variant="body2">
                  ✅ <strong>Chat Active:</strong> The system is now polling for
                  new messages every 2 seconds.
                  <br />
                  Try sending messages and you should see simulated agent
                  responses.
                  <br />
                  Conversation ID: <code>{activeChat.conversationId}</code>
                </Typography>
              </Paper>
            </Box>
          )}

          <Box
            sx={{
              mt: 4,
              p: 3,
              backgroundColor: "background.paper",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              maxWidth: 700,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Technical Details
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{ lineHeight: 1.8 }}
            >
              <strong>Architecture:</strong>
              <br />• Chat starts with HTTP POST to <code>/api/chat/start</code>
              <br />• Follow-up messages sent via HTTP POST to{" "}
              <code>/api/chat/message</code>
              <br />• Real-time updates via polling{" "}
              <code>/api/chat/websocket</code> (simulating WebSocket)
              <br />
              • In-memory storage for development/testing
              <br />
              • Simulated agent responses with 1.5-2 second delays
              <br />
              <br />
              <strong>Production Considerations:</strong>
              <br />
              • Replace polling with actual WebSocket connections
              <br />
              • Use persistent storage (database/Redis)
              <br />
              • Add authentication and authorization
              <br />• Implement proper error handling and reconnection logic
            </Typography>
          </Box>
        </Box>
      </Container>
    </Navigation>
  );
}
