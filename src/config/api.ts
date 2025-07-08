// API Configuration for Chat Client
const getServerUrl = (): string => {
  const host = process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST || "localhost";
  const port = process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST_PORT || "3000";
  const serverUrl = `http://${host}:${port}`;

  // Debug logging (can be removed in production)
  if (typeof window !== "undefined") {
    console.log("🌐 Chat Client Server Configuration:", {
      host,
      port,
      serverUrl,
      envHost: process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST,
      envPort: process.env.NEXT_PUBLIC_ISTACK_BUDDY_SERVER_HOST_PORT,
    });
  }

  return serverUrl;
};

export const API_CONFIG = {
  // Chat server base URL - configured via environment variables
  CHAT_SERVER_URL: getServerUrl(),

  // Real server API endpoints (from 12000.1-chat-endpoints-dev-debug.md)
  ENDPOINTS: {
    MESSAGES: "/chat/messages",
    CONVERSATIONS: "/chat/conversations",
    CONVERSATION_MESSAGES: "/chat/conversations", // /:id/messages will be appended
    JOIN_CONVERSATION: "/chat/conversations", // /:id/join will be appended
  },

  // WebSocket events
  WS_EVENTS: {
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    SEND_MESSAGE: "send_message",
    GET_MESSAGES: "get_messages",
    TYPING_START: "typing_start",
    TYPING_STOP: "typing_stop",
    SHARE_ROBOT_MESSAGE: "share_robot_message",
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.CHAT_SERVER_URL}${endpoint}`;
};
