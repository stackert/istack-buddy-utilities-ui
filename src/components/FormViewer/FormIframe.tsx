import React, { useRef, useEffect, useCallback, forwardRef } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";

interface FormIframeProps {
  htmlContent: string;
  title?: string;
  loading?: boolean;
  onMessageReceived?: (message: any) => void;
}

const FormIframe = forwardRef<HTMLIFrameElement, FormIframeProps>(
  (
    { htmlContent, title = "Form Preview", loading = false, onMessageReceived },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Use the forwarded ref if provided, otherwise use internal ref
    const actualRef = ref || iframeRef;

    // Enhanced HTML with injected scripts and improved styling
    const enhancedHtml = useCallback(() => {
      if (!htmlContent) return "";

      const enhancedStyles = `
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        /* Make the form container responsive */
        .fsform-container {
          max-width: 100% !important;
          width: 100% !important;
        }
        
        /* Adjust form width to fit container */
        .fsForm {
          max-width: 100% !important;
          width: 100% !important;
        }
        
        /* Ensure proper scrolling */
        html, body {
          height: auto !important;
          overflow: visible !important;
        }
        
        /* Style adjustments for better appearance */
        .fsSection {
          margin-bottom: 20px;
        }
        
        .fsFieldRow {
          margin-bottom: 15px;
        }

        /* Enhanced field message styling */
        .fs-buddy-field-message {
          margin-top: 5px;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          line-height: 1.4;
          border: 1px solid;
          white-space: pre-wrap;
          font-family: 'Courier New', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        }
        
        .fs-buddy-field-message.error {
          background-color: #ffebee;
          border-color: #f44336;
          color: #c62828;
        }
        
        .fs-buddy-field-message.warn {
          background-color: #fff3e0;
          border-color: #ff9800;
          color: #ef6c00;
        }
        
        .fs-buddy-field-message.info {
          background-color: #e3f2fd;
          border-color: #2196f3;
          color: #1565c0;
        }
        
        .fs-buddy-field-message.success {
          background-color: #e8f5e8;
          border-color: #4caf50;
          color: #2e7d32;
        }

        /* Field highlighting */
        .fs-buddy-field-highlight {
          outline: 3px solid #ff9800 !important;
          outline-offset: 2px;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(255, 152, 0, 0.3) !important;
        }

        /* Debug styling for containers */
        .fs-debug-container {
          border: 2px dashed #ff0000 !important;
          background-color: rgba(255, 0, 0, 0.1) !important;
        }

        /* Orphaned messages container styling */
        .fs-buddy-orphaned-messages-container {
          margin: 20px 0;
          padding: 15px;
          border: 2px solid #9c27b0;
          border-radius: 8px;
          background-color: #f3e5f5;
          box-shadow: 0 2px 8px rgba(156, 39, 176, 0.1);
        }

        .fs-buddy-orphaned-messages-header h3 {
          margin: 0 0 8px 0;
          color: #7b1fa2;
          font-size: 16px;
        }

        .fs-buddy-orphaned-messages-header p {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #6a1b9a;
        }

        .fs-buddy-toggle-orphaned {
          background-color: #9c27b0;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .fs-buddy-toggle-orphaned:hover {
          background-color: #7b1fa2;
        }

        .fs-buddy-orphaned-messages-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .fs-buddy-orphaned-message {
          margin: 8px 0;
          padding: 10px;
          border-radius: 6px;
          border-left: 4px solid;
          background-color: white;
        }

        .fs-buddy-orphaned-message.error {
          border-left-color: #f44336;
          background-color: #ffebee;
        }

        .fs-buddy-orphaned-message.warn {
          border-left-color: #ff9800;
          background-color: #fff3e0;
        }

        .fs-buddy-orphaned-message.info {
          border-left-color: #2196f3;
          background-color: #e3f2fd;
        }

        .fs-buddy-orphaned-message.success {
          border-left-color: #4caf50;
          background-color: #e8f5e8;
        }

        .fs-buddy-orphaned-field-header {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .fs-buddy-orphaned-field-header .field-type {
          color: #666;
          font-weight: normal;
          font-style: italic;
        }

        .fs-buddy-orphaned-field-header .non-visible-badge {
          background-color: #9c27b0;
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          margin-left: 8px;
          font-weight: normal;
        }

        .fs-buddy-orphaned-message-content {
          font-size: 13px;
          line-height: 1.4;
          color: #333;
        }
      </style>
    `;

      const debugScript = ``; // Removed debug logging for performance

      // Find the insertion point for our enhancements
      let enhancedContent = htmlContent;

      // Add styles to head if possible
      if (htmlContent.includes("</head>")) {
        enhancedContent = enhancedContent.replace(
          "</head>",
          `${enhancedStyles}</head>`
        );
      } else if (htmlContent.includes("<head>")) {
        enhancedContent = enhancedContent.replace(
          "<head>",
          `<head>${enhancedStyles}`
        );
      } else {
        // No head tag, add styles at the beginning
        enhancedContent = `${enhancedStyles}${enhancedContent}`;
      }

      // Add scripts before closing body or html
      if (htmlContent.includes("</body>")) {
        enhancedContent = enhancedContent.replace(
          "</body>",
          `${debugScript}<script src="/form-message-utils.js"></script><script src="/iframe-message-relay.js"></script></body>`
        );
      } else if (htmlContent.includes("</html>")) {
        enhancedContent = enhancedContent.replace(
          "</html>",
          `${debugScript}<script src="/form-message-utils.js"></script><script src="/iframe-message-relay.js"></script></html>`
        );
      } else {
        // No closing tags, append scripts
        enhancedContent = `${enhancedContent}${debugScript}<script src="/form-message-utils.js"></script><script src="/iframe-message-relay.js"></script>`;
      }
      return enhancedContent;
    }, [htmlContent]);

    // Message communication setup
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        // Only accept messages from our iframe
        const currentIframe =
          typeof actualRef === "function" ? null : actualRef?.current;
        if (event.source === currentIframe?.contentWindow) {
          if (onMessageReceived) {
            onMessageReceived(event.data);
          }
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [onMessageReceived, actualRef]);

    // Send message to iframe
    const sendMessage = useCallback(
      (type: string, data: any) => {
        const currentIframe =
          typeof actualRef === "function" ? null : actualRef?.current;
        if (currentIframe?.contentWindow) {
          currentIframe.contentWindow.postMessage({ type, data }, "*");
        }
      },
      [actualRef]
    );

    // Expose sendMessage method to parent components
    useEffect(() => {
      const currentIframe =
        typeof actualRef === "function" ? null : actualRef?.current;
      if (currentIframe) {
        (currentIframe as any).sendMessage = sendMessage;
      }
    }, [sendMessage, actualRef]);

    if (loading) {
      return (
        <Paper
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1">Loading form...</Typography>
          </Box>
        </Paper>
      );
    }

    if (!htmlContent) {
      return (
        <Paper
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No form content available
          </Typography>
        </Paper>
      );
    }

    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ mb: 2, px: 2, pt: 2 }}>
          {title}
        </Typography>

        <Paper
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          }}
        >
          <iframe
            ref={actualRef}
            srcDoc={enhancedHtml()}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "white",
            }}
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </Paper>
      </Box>
    );
  }
);

FormIframe.displayName = "FormIframe";

export default FormIframe;
