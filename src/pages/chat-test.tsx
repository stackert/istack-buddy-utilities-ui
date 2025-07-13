import { useState } from "react";
import { Typography, Container, Box, Paper, Button } from "@mui/material";
import Navigation from "../components/Navigation";
import ChatWidget from "../components/ChatWidget";
import ChatWindow from "../components/ChatWindow";
import ConversationList from "../components/ConversationList";

export default function ChatTest() {
  const [activeChat1, setActiveChat1] = useState<{
    conversationId: string;
    initialMessage: string;
  } | null>(null);

  const [activeChat2, setActiveChat2] = useState<{
    conversationId: string;
    initialMessage: string;
  } | null>(null);

  const handleConversationJoin = (conversation: any, role: string) => {
    console.log("Joining conversation:", conversation.id, "as:", role);

    // Open in first available chat window
    if (!activeChat1) {
      setActiveChat1({
        conversationId: conversation.id,
        initialMessage: `Joined as ${role}`,
      });
    } else if (!activeChat2) {
      setActiveChat2({
        conversationId: conversation.id,
        initialMessage: `Joined as ${role}`,
      });
    } else {
      // Both windows occupied, replace the first one
      setActiveChat1({
        conversationId: conversation.id,
        initialMessage: `Joined as ${role}`,
      });
    }
  };

  const handleChatClose1 = () => {
    setActiveChat1(null);
  };

  const handleChatClose2 = () => {
    setActiveChat2(null);
  };

  return (
    <Navigation>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            py: 2,
          }}
        >
          {/* Conversation List at Top */}
          <Box sx={{ width: "100%" }}>
            <ConversationList onConversationJoin={handleConversationJoin} />
          </Box>

          {/* Two Chat Windows Side by Side */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
              minHeight: "600px",
            }}
          >
            {/* Chat Window 1 */}
            <Box sx={{ flex: 1 }}>
              {activeChat1 ? (
                <ChatWindow
                  conversationId={activeChat1.conversationId}
                  initialMessage={activeChat1.initialMessage}
                  onClose={handleChatClose1}
                />
              ) : (
                <Paper
                  elevation={1}
                  sx={{
                    height: "600px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.default",
                    border: 2,
                    borderStyle: "dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Chat Window 1
                    <br />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Select a conversation above to start chatting
                    </Typography>
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Chat Window 2 */}
            <Box sx={{ flex: 1 }}>
              {activeChat2 ? (
                <ChatWindow
                  conversationId={activeChat2.conversationId}
                  initialMessage={activeChat2.initialMessage}
                  onClose={handleChatClose2}
                />
              ) : (
                <Paper
                  elevation={1}
                  sx={{
                    height: "600px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.default",
                    border: 2,
                    borderStyle: "dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Chat Window 2
                    <br />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Select a conversation above to start chatting
                    </Typography>
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Navigation>
  );
}
