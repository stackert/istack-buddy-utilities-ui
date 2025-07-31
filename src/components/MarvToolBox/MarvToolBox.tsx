import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface Message {
  id: string;
  content: string;
  author: "user" | "marv";
  dateTime: string;
}

interface MarvToolBoxProps {
  messages?: Message[];
  onMessageSent?: (message: string) => void;
}

// Chat History Component
const ChatHistory: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        p: 2,
        backgroundColor: "#fafafa",
      }}
    >
      {messages.length === 0 ? (
        <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
          No messages yet. Start a conversation!
        </Box>
      ) : (
        <>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                mb: 2,
                display: "flex",
                justifyContent:
                  message.author === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  p: 2,
                  borderRadius: 2,
                  backgroundColor:
                    message.author === "user" ? "primary.main" : "grey.200",
                  color: message.author === "user" ? "white" : "text.primary",
                }}
              >
                <Typography variant="body2">{message.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.7, mt: 0.5, display: "block" }}
                >
                  {new Date(message.dateTime).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
};

// User Input Widget Component
const UserInputWidget: React.FC<{
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: () => void;
}> = ({ newMessage, setNewMessage, onSendMessage }) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          multiline
          rows={4}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={onSendMessage}
          disabled={!newMessage.trim()}
          endIcon={<SendIcon />}
          sx={{ height: 40, minWidth: 120 }}
        >
          Send Message
        </Button>
      </Box>
    </Box>
  );
};

// Main Chat Widget Component
const MarvToolBox: React.FC<MarvToolBoxProps> = ({
  messages = [],
  onMessageSent,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage("");
      // TODO: Handle message sending
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Typography variant="h6">Chat with Marv</Typography>
      </Box>

      {/* Chat History - takes up remaining space */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          minHeight: 0,
          pb: 1, // Small space before input
        }}
      >
        <ChatHistory messages={messages} />
      </Box>

      {/* User Input Widget - fixed height */}
      <Box
        sx={{
          height: "120px", // Fixed height for input area
          flexShrink: 0,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <UserInputWidget
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
        />
      </Box>
    </Box>
  );
};

export default MarvToolBox;
