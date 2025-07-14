import { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { io, Socket } from "socket.io-client";
import Navigation from "../components/Navigation";

interface Conversation {
  id: string;
  participantIds: string[];
  participantRoles: string[];
  messageCount: number;
  lastMessageAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Participant {
  userId: string;
  userRole: string;
  joinedAt: Date;
}

export default function CXConversationMonitor() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io("http://localhost:3002");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setConnectionStatus("Connected");

      // Join dashboard to receive conversation events
      newSocket.emit("join_dashboard");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setConnectionStatus("Disconnected");
    });

    // Listen for conversation events
    newSocket.on(
      "conversation_created",
      (data: {
        conversation: Conversation;
        createdBy: string;
        initialParticipants: Participant[];
        timestamp: string;
      }) => {
        console.log("New conversation created:", data);
        setConversations((prev) => [...prev, data.conversation]);
      }
    );

    newSocket.on(
      "conversation_updated",
      (data: {
        conversationId: string;
        changes: { messageCount: number; lastMessageAt: Date; updatedAt: Date };
        timestamp: string;
      }) => {
        console.log("Conversation updated:", data);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === data.conversationId
              ? { ...conv, ...data.changes }
              : conv
          )
        );
      }
    );

    newSocket.on(
      "conversation_participant_added",
      (data: {
        conversationId: string;
        participant: Participant;
        action: string;
        timestamp: string;
      }) => {
        console.log("Participant added:", data);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === data.conversationId
              ? {
                  ...conv,
                  participantIds: [
                    ...conv.participantIds,
                    data.participant.userId,
                  ],
                  participantRoles: [
                    ...conv.participantRoles,
                    data.participant.userRole,
                  ],
                }
              : conv
          )
        );
      }
    );

    newSocket.on(
      "conversation_participant_removed",
      (data: {
        conversationId: string;
        participant: Participant;
        action: string;
        timestamp: string;
      }) => {
        console.log("Participant removed:", data);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === data.conversationId
              ? {
                  ...conv,
                  participantIds: conv.participantIds.filter(
                    (id) => id !== data.participant.userId
                  ),
                  participantRoles: conv.participantRoles.filter(
                    (role, index) =>
                      conv.participantIds[index] !== data.participant.userId
                  ),
                }
              : conv
          )
        );
      }
    );

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Navigation>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Monitor CX Conversations
          </Typography>
          <Chip
            label={connectionStatus}
            color={connectionStatus === "Connected" ? "success" : "error"}
            sx={{ mb: 2 }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Conversation ID</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Messages</TableCell>
                <TableCell>Last Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conversations.map((conversation) => (
                <TableRow key={conversation.id}>
                  <TableCell>{conversation.id}</TableCell>
                  <TableCell>{conversation.participantIds.length}</TableCell>
                  <TableCell>{conversation.messageCount}</TableCell>
                  <TableCell>
                    {conversation.lastMessageAt
                      ? formatDate(conversation.lastMessageAt)
                      : "No messages"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={conversation.isActive ? "Active" : "Inactive"}
                      color={conversation.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(conversation.createdAt)}</TableCell>
                </TableRow>
              ))}
              {conversations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No active conversations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Navigation>
  );
}
