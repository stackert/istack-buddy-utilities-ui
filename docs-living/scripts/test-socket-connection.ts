#!/usr/bin/env npx ts-node

/**
 * Socket.IO Connection Test Script
 *
 * Based on the server's example at docs-living/scripts/example-send-message-to-server.ts
 *
 * Usage: npx ts-node docs-living/scripts/test-socket-connection.ts
 */

import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("✅ Connected to server");
  console.log(`📡 Socket ID: ${socket.id}`);

  // Join room (using same format as our app)
  socket.emit("join_room", {
    conversationId: "test-room-123",
  });

  // Send message after short delay
  setTimeout(() => {
    console.log("📤 Sending test message...");
    socket.emit("send_message", {
      content: "Hello from test script! Please echo this back.",
      conversationId: "test-room-123",
      fromUserId: "web-client-user",
      fromRole: "cx-customer",
      toRole: "robot",
      messageType: "text",
      timestamp: new Date().toISOString(),
    });
    console.log("📤 Message sent, waiting for response...");
  }, 1000);
});

// Listen for message responses (server sends "new_message")
socket.on("new_message", (message: any) => {
  console.log("📥 Received new_message:", message);
  console.log("📥 Content:", message.content);
  console.log("📥 From Role:", message.fromRole);
  console.log("📥 To Role:", message.toRole);
  console.log("🏁 Test complete - exiting");
  socket.disconnect();
  process.exit(0);
});

// Handle connection errors
socket.on("connect_error", (error: any) => {
  console.error("❌ Connection failed:", error.message);
  console.error("❌ Error details:", error);
  process.exit(1);
});

socket.on("disconnect", (reason: string) => {
  console.log(`👋 Disconnected from server: ${reason}`);
});

// Additional debugging events
socket.on("error", (error: any) => {
  console.error("❌ Socket error:", error);
});

// Exit after 15 seconds if no response
setTimeout(() => {
  console.log("⏰ Timeout - no response received after 15 seconds");
  socket.disconnect();
  process.exit(1);
}, 15000);

console.log("🚀 Test script started, waiting for connection...");
