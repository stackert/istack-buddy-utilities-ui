import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  Alert,
} from "@mui/material";
import { Send, Close } from "@mui/icons-material";
import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "../config/api";

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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const initialMessageSent = useRef(false);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup socket.io connection to chat server - EXACTLY like test script
  useEffect(() => {
    const host =
      process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST || "localhost";
    const port =
      process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST_PORT || "3000";
    const serverUrl = `http://${host}:${port}`;

    console.log("CHAT: Connecting to server:", serverUrl);
    console.log("CHAT: Conversation ID:", conversationId);
    console.log("CHAT: Initial message:", initialMessage);

    // Add initial user message to UI immediately - user sees their message
    const initialUserMessage: Message = {
      id: "initial-user",
      content: initialMessage,
      sender: "User",
      timestamp: new Date().toISOString(),
      isFromUser: true,
    };
    setMessages([initialUserMessage]);

    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log("CHAT: Connected to server");
      console.log("CHAT: Socket ID:", socket.id);

      // Join room (exactly like test script)
      console.log("CHAT: Joining room:", conversationId);
      socket.emit("join_room", {
        conversationId: conversationId,
      });

      // Send initial message after short delay (exactly like test script)
      if (!initialMessageSent.current && initialMessage.trim()) {
        setTimeout(() => {
          console.log("CHAT: Sending initial message:", initialMessage);
          socket.emit("send_message", {
            content: initialMessage,
            conversationId: conversationId,
            fromUserId: "web-client-user",
            fromRole: "cx-customer",
            toRole: "robot",
            messageType: "text",
            timestamp: new Date().toISOString(),
          });
          initialMessageSent.current = true;
          console.log("CHAT: Initial message sent, waiting for response...");
        }, 1000);
      }
    });

    // Listen for message responses - SHOW ALL MESSAGES FROM SERVER
    socket.on("new_message", (messageData: any) => {
      console.log("CHAT: Received new_message:", messageData);

      const newMessage: Message = {
        id: messageData.id || Date.now().toString(),
        content: messageData.content,
        sender: messageData.fromRole === "robot" ? "Agent" : "User",
        timestamp:
          messageData.createdAt ||
          messageData.timestamp ||
          new Date().toISOString(),
        isFromUser: messageData.fromRole !== "robot",
      };

      console.log("CHAT: Adding message to UI:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });

    // Handle connection errors
    socket.on("connect_error", (error: any) => {
      console.error("CHAT: Connection failed:", error.message);
      setIsConnected(false);
      setConnectionError(`Connection failed: ${error.message}`);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("CHAT: Disconnected from server:", reason);
      setIsConnected(false);
      if (reason !== "io client disconnect") {
        setConnectionError(`Lost connection: ${reason}`);
      }
    });

    // Debug all socket events
    socket.onAny((eventName, ...args) => {
      console.log("CHAT: Socket event received:", eventName, args);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId, initialMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !socketRef.current?.connected)
      return;

    console.log("CHAT: Sending follow-up message:", newMessage.trim());
    setIsSending(true);
    const messageToSend = newMessage.trim();

    // Add user message to UI immediately - user sees their message
    const userMessage: Message = {
      id: "user-" + Date.now().toString(),
      content: messageToSend,
      sender: "User",
      timestamp: new Date().toISOString(),
      isFromUser: true,
    };

    console.log("CHAT: Adding user message to UI immediately:", userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    try {
      // Send via Socket.io - ALL server responses will also show
      socketRef.current.emit("send_message", {
        content: messageToSend,
        conversationId: conversationId,
        fromUserId: "web-client-user",
        fromRole: "cx-customer",
        toRole: "robot",
        messageType: "text",
        timestamp: new Date().toISOString(),
      });
      console.log(
        "CHAT: Follow-up message sent, will show ALL server responses"
      );
    } catch (error) {
      console.error("CHAT: Error sending message:", error);
      setConnectionError("Failed to send message");
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
              ? "Connected (Socket.io)"
              : connectionError
              ? "Error"
              : "Connecting..."}{" "}
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
          {messages.map((message) => (
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
