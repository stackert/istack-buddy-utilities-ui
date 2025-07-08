import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  Alert,
} from "@mui/material";
import { Send, Close } from "@mui/icons-material";
import { API_CONFIG, buildApiUrl } from "../config/api";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isFromUser: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  initialMessage: string;
  onClose: () => void;
}

export default function ChatWindow({
  conversationId,
  initialMessage,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with the first message
  useEffect(() => {
    const initialMsg: Message = {
      id: "initial",
      content: initialMessage,
      sender: "User",
      timestamp: new Date().toISOString(),
      isFromUser: true,
    };
    setMessages([initialMsg]);
  }, [initialMessage]);

  // Setup real WebSocket connection to chat server
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host =
      process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST || "localhost";
    const port =
      process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST_PORT || "3000";
    const wsUrl = `${protocol}//${host}:${port}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null); // Clear any previous connection errors
        console.log("🔌 WebSocket connected to chat server");

        // Join the conversation room
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              event: API_CONFIG.WS_EVENTS.JOIN_ROOM,
              data: {
                conversationId: conversationId,
                timestamp: new Date().toISOString(),
              },
            })
          );
          console.log(`📥 Joined room: ${conversationId}`);

          // Request existing messages
          ws.send(
            JSON.stringify({
              event: API_CONFIG.WS_EVENTS.GET_MESSAGES,
              data: {
                conversationId: conversationId,
              },
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          console.log("📨 WebSocket message received:", messageData);

          // Handle different types of WebSocket messages
          if (
            messageData.event === "message" ||
            messageData.type === "message"
          ) {
            const newMessage: Message = {
              id:
                messageData.id || messageData.data?.id || Date.now().toString(),
              content:
                messageData.content ||
                messageData.data?.content ||
                messageData.message,
              sender: messageData.sender || messageData.data?.sender || "Agent",
              timestamp:
                messageData.timestamp ||
                messageData.data?.timestamp ||
                new Date().toISOString(),
              isFromUser:
                messageData.isFromUser || messageData.data?.isFromUser || false,
            };

            setMessages((prev) => [...prev, newMessage]);
          } else if (messageData.event === "messages" && messageData.data) {
            // Handle bulk message response (from get_messages)
            if (Array.isArray(messageData.data)) {
              const formattedMessages = messageData.data.map((msg: any) => ({
                id: msg.id || Date.now().toString(),
                content: msg.content || msg.message,
                sender: msg.sender || "Unknown",
                timestamp: msg.timestamp || new Date().toISOString(),
                isFromUser: msg.isFromUser || false,
              }));
              setMessages(formattedMessages);
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        console.log("🔌 WebSocket disconnected from chat server");

        // Only show error if it wasn't a normal close
        if (event.code !== 1000 && event.code !== 1001) {
          setConnectionError(
            "Lost connection to message server. Please refresh to reconnect."
          );
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setIsConnected(false);
        setConnectionError(
          "Can't connect to message server. Please check if the server is running."
        );
      };
    } catch (error) {
      console.error("❌ Error creating WebSocket:", error);
      setIsConnected(false);
      setConnectionError(
        "Message server not available. Please check your connection and try again."
      );
    }

    return () => {
      if (wsRef.current) {
        // Leave room before closing
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              event: API_CONFIG.WS_EVENTS.LEAVE_ROOM,
              data: {
                conversationId: conversationId,
              },
            })
          );
        }
        wsRef.current.close();
      }
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageToSend = newMessage.trim();

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: "User",
      timestamp: new Date().toISOString(),
      isFromUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    try {
      // Send message via WebSocket (preferred) or fallback to HTTP
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send via WebSocket
        wsRef.current.send(
          JSON.stringify({
            event: API_CONFIG.WS_EVENTS.SEND_MESSAGE,
            data: {
              conversationId,
              content: messageToSend,
              timestamp: new Date().toISOString(),
            },
          })
        );
        console.log("📤 Message sent via WebSocket");
      } else {
        // Fallback to HTTP POST
        const response = await fetch(
          buildApiUrl(API_CONFIG.ENDPOINTS.MESSAGES),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationId,
              content: messageToSend,
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to send message via HTTP:",
            response.status,
            response.statusText
          );

          // Check for CORS-related issues
          if (response.type === "opaque" || response.status === 0) {
            setConnectionError(
              "HTTP fallback blocked by CORS policy. Please check server configuration."
            );
            return;
          }

          if (response.status === 403) {
            setConnectionError(
              "HTTP access forbidden. Server may need CORS configuration."
            );
          }
        } else {
          console.log("📤 Message sent via HTTP");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Handle CORS and network errors
      if (error instanceof TypeError) {
        const errorMessage = error.message.toLowerCase();

        if (
          errorMessage.includes("cors") ||
          errorMessage.includes("cross-origin") ||
          errorMessage.includes("not allowed by access-control-allow-origin")
        ) {
          setConnectionError(
            "Message blocked by CORS policy. Please contact support to configure server."
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
            setConnectionError(
              "Message blocked by cross-origin policy (CORS). Server at " +
                serverUrl +
                " needs CORS config for " +
                currentOrigin
            );
          } else {
            setConnectionError(
              "Network error sending message. Please check your connection."
            );
          }
        } else {
          setConnectionError("Failed to send message. Please try again.");
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Helper to detect CORS scenarios
  const isLikelyCorsIssue = () => {
    if (typeof window === "undefined") return false;
    const currentOrigin = window.location.origin;
    const serverUrl = API_CONFIG.CHAT_SERVER_URL;
    return currentOrigin !== serverUrl && !serverUrl.startsWith(currentOrigin);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: "600px",
        maxWidth: "600px",
        margin: "auto",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6">Chat Conversation</Typography>
          <Typography variant="caption" color="text.secondary">
            {isConnected
              ? "Connected"
              : connectionError
              ? "Server Error"
              : "Disconnected"}{" "}
            - ID: {conversationId}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {connectionError}
          {isLikelyCorsIssue() && (
            <Typography variant="body2" sx={{ mt: 1, fontSize: "0.85em" }}>
              <strong>Debug Info:</strong> Cross-origin request from{" "}
              {typeof window !== "undefined"
                ? window.location.origin
                : "unknown"}
              to {API_CONFIG.CHAT_SERVER_URL}. Server needs CORS configuration.
            </Typography>
          )}
        </Alert>
      )}

      {/* Messages List */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          maxHeight: "400px",
        }}
      >
        <List sx={{ p: 1 }}>
          {messages.map((message, index) => (
            <ListItem
              key={message.id}
              sx={{
                display: "flex",
                flexDirection: message.isFromUser ? "row-reverse" : "row",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mx: 1,
                  bgcolor: message.isFromUser
                    ? "primary.main"
                    : "secondary.main",
                }}
              >
                {message.isFromUser ? "U" : "A"}
              </Avatar>
              <Box
                sx={{
                  maxWidth: "70%",
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: message.isFromUser
                    ? "primary.light"
                    : "background.default",
                  color: message.isFromUser
                    ? "primary.contrastText"
                    : "text.primary",
                }}
              >
                <Typography variant="body2">{message.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    opacity: 0.7,
                  }}
                >
                  {formatTimestamp(message.timestamp)}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Message Input */}
      <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "flex-end" }}>
        <TextField
          multiline
          maxRows={3}
          placeholder="Type your follow-up message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSending || !isConnected}
          fullWidth
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || isSending || !isConnected}
          startIcon={isSending ? <CircularProgress size={16} /> : <Send />}
          sx={{ minWidth: "auto", px: 2 }}
        >
          {isSending ? "" : "Send"}
        </Button>
      </Box>
    </Paper>
  );
}
