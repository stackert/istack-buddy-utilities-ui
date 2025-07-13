import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Button,
} from "@mui/material";
import { Chat, Login } from "@mui/icons-material";
import { buildApiUrl } from "../config/api";

interface Conversation {
  id: string;
  participantIds: string[];
  participantRoles: string[];
  messageCount: number;
  lastMessageAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConversationListProps {
  onConversationJoin?: (conversation: Conversation, role: string) => void;
}

export default function ConversationList({
  onConversationJoin,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>(
    {}
  );
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl("/chat/conversations"));

      if (!response.ok) {
        throw new Error(
          `Failed to fetch conversations: ${response.statusText}`
        );
      }

      const data = await response.json();
      setConversations(data);

      // Initialize selected roles
      const initialRoles: { [key: string]: string } = {};
      data.forEach((conv: Conversation) => {
        initialRoles[conv.id] = "cx-customer";
      });
      setSelectedRoles(initialRoles);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch conversations"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRoleChange = (conversationId: string, role: string) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [conversationId]: role,
    }));
  };

  const handleJoinConversation = (conversation: Conversation) => {
    const role = selectedRoles[conversation.id] || "cx-customer";
    if (onConversationJoin) {
      onConversationJoin(conversation, role);
    }
  };

  const handleStartConversation = async () => {
    try {
      setIsStarting(true);
      setError(null);

      const response = await fetch(buildApiUrl("/chat/conversations/start"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.statusText}`);
      }

      // Refresh the conversation list after starting a new one
      await fetchConversations();
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start conversation"
      );
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const paginatedConversations = conversations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={2} sx={{ maxWidth: 1200, margin: "auto" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Chat />
            Conversations ({conversations.length})
          </Typography>
          <Button
            variant="contained"
            onClick={handleStartConversation}
            disabled={isStarting}
            startIcon={isStarting ? <CircularProgress size={16} /> : null}
            size="small"
          >
            {isStarting ? "Starting..." : "Start"}
          </Button>
        </Box>
      </Box>

      {conversations.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No conversations found</Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Conversation ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Messages</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Last Message</TableCell>
                  <TableCell>Join As</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedConversations.map((conversation) => (
                  <TableRow key={conversation.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {conversation.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={conversation.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={conversation.isActive ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{conversation.messageCount}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {conversation.participantRoles.join(", ")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimestamp(conversation.lastMessageAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={
                            selectedRoles[conversation.id] || "cx-customer"
                          }
                          onChange={(e) =>
                            handleRoleChange(conversation.id, e.target.value)
                          }
                        >
                          <MenuItem value="cx-customer">cx-customer</MenuItem>
                          <MenuItem value="cx-agent">cx-agent</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Login />}
                        onClick={() => handleJoinConversation(conversation)}
                      >
                        Join
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={conversations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </>
      )}
    </Paper>
  );
}
