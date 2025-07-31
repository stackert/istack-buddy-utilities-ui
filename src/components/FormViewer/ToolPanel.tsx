import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Collapse,
  Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  AutoFixHigh as AutoFixHighIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Web as WebIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/appSlice";
import ObservationMakerPanel from "@/components/MarvDebug/ObservationMakerPanel";
import LogItemViewer from "@/components/MarvDebug/LogItemViewer";
import { ObservationService } from "@/services/ObservationService";
import { IObservationLogItem } from "istack-buddy-utilities";
// Initialize custom observation makers
import "@/observationMakers/registry";

interface ToolPanelProps {
  formData?: any;
  iframeReady?: boolean;
  onAddFieldMessage?: (
    fieldId: string,
    message: string,
    errorLevel?: "error" | "warn" | "info" | "success",
    relatedFieldIds?: string[],
    fieldType?: string
  ) => void;
  onHighlightField?: (fieldId: string) => void;
  onClearAllMessages?: () => void;
  onAddObservationResults?: (
    observationResults: any,
    observationMakerName: string
  ) => void;
  onDebugShowFieldContainers?: () => void;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  formData,
  iframeReady = false,
  onAddFieldMessage,
  onHighlightField,
  onClearAllMessages,
  onAddObservationResults,
  onDebugShowFieldContainers,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isDevelopmentMode } = useAppSelector((state) => state.app);

  const [chatMessages, setChatMessages] = useState<
    Array<{ text: string; sender: "user" | "bot" }>
  >([
    {
      text: "Hello! I'm here to help you with form analysis and modifications. How can I assist you today?",
      sender: "bot",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // New state for observation log items
  const [observationLogItems, setObservationLogItems] = useState<
    IObservationLogItem[]
  >([]);
  const [observationService] = useState(() => new ObservationService());
  const [isRunningObservations, setIsRunningObservations] = useState(false);
  const [activeObservationWidget, setActiveObservationWidget] = useState<
    "classic" | "logviewer"
  >("classic");
  const [chatExpanded, setChatExpanded] = useState(false);
  const [observationMakersExpanded, setObservationMakersExpanded] =
    useState(false);
  const [logViewerFilter, setLogViewerFilter] = useState<{
    logLevel: string;
    subjectType: string;
    observationClass: string;
    observationMaker: string;
  } | null>(null);

  // Auto-run observations ONCE when formData first loads
  React.useEffect(() => {
    const runObservationsOnce = async () => {
      if (
        formData &&
        observationLogItems.length === 0 &&
        !isRunningObservations
      ) {
        setIsRunningObservations(true);

        try {
          // First run observations without field decoration
          const result = await observationService.runAllObservations(formData);
          setObservationLogItems(result.logItems);

          // Decorate fields when iframe becomes ready
          // The decoration will happen automatically when iframeReady becomes true
        } catch (error) {
          console.error("Error auto-running observations:", error);
          setObservationLogItems([]);
        } finally {
          setIsRunningObservations(false);
        }
      }
    };

    runObservationsOnce();
  }, [formData?.id]); // Only run when form ID changes

  // Auto-decorate fields when iframe becomes ready and we have observations
  const [hasInitialDecoration, setHasInitialDecoration] = useState(false);

  // Reset decoration state when form changes
  React.useEffect(() => {
    setHasInitialDecoration(false);
  }, [formData?.id]);

  React.useEffect(() => {
    if (
      iframeReady &&
      observationLogItems.length > 0 &&
      onAddFieldMessage &&
      !logViewerFilter &&
      !hasInitialDecoration
    ) {
      // Only auto-decorate ONCE when iframe first becomes ready
      setTimeout(() => {
        observationService.decorateFieldsWithFilteredMessages(
          observationLogItems,
          onAddFieldMessage,
          formData,
          {
            logLevel: "ALL",
            subjectType: "ALL",
            observationClass: "ALL",
            observationMaker: "ALL",
          }
        );
        setHasInitialDecoration(true);
      }, 100);
    }
  }, [iframeReady, observationLogItems.length, hasInitialDecoration]); // MINIMAL dependencies

  // Apply filter when LogViewer filter changes - SIMPLIFIED
  const filterTimeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (observationLogItems.length === 0 || !iframeReady || !onAddFieldMessage)
      return;

    // Clear any existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Clear all messages first
    onClearAllMessages?.();

    // Apply filtered messages after brief delay
    filterTimeoutRef.current = setTimeout(() => {
      if (logViewerFilter) {
        // Apply specific filter
        observationService.decorateFieldsWithFilteredMessages(
          observationLogItems,
          onAddFieldMessage,
          formData,
          logViewerFilter
        );
      } else {
        // Show all messages
        observationService.decorateFieldsWithFilteredMessages(
          observationLogItems,
          onAddFieldMessage,
          formData,
          {
            logLevel: "ALL",
            subjectType: "ALL",
            observationClass: "ALL",
            observationMaker: "ALL",
          }
        );
      }
    }, 50);

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [logViewerFilter]); // ONLY filter changes

  const handleSwitchToAppView = () => {
    dispatch(setViewMode("app"));
    router.push("/app");
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages((prev) => [
        ...prev,
        { text: chatInput, sender: "user" },
        {
          text: "I understand you want to work with the form. This is a demo response - in a real implementation, I would analyze the form and provide specific assistance.",
          sender: "bot",
        },
      ]);
      setChatInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toolButtons = [
    {
      label: "Create Backup",
      icon: <BackupIcon />,
      action: () => {},
    },
    {
      label: "Restore Backup",
      icon: <RestoreIcon />,
      action: () => {},
    },
    {
      label: "Make Field Names Unique",
      icon: <AutoFixHighIcon />,
      action: () => {},
    },
    {
      label: "Observation Makers",
      icon: <AnalyticsIcon />,
      action: () => setObservationMakersExpanded(!observationMakersExpanded),
    },
    {
      label: "Save Changes",
      icon: <SaveIcon />,
      action: () => {},
    },
    {
      label: "Form Settings",
      icon: <SettingsIcon />,
      action: () => {},
    },
    {
      label: "Clear Form Messages",
      icon: <AutoFixHighIcon />,
      action: () => onClearAllMessages && onClearAllMessages(),
      disabled: !iframeReady,
    },
    {
      label: "Debug Field Containers",
      icon: <AnalyticsIcon />,
      action: () => onDebugShowFieldContainers && onDebugShowFieldContainers(),
      disabled: !iframeReady,
    },
    {
      label: "Test Add Field Message",
      icon: <AutoFixHighIcon />,
      action: () => {
        if (onAddFieldMessage && formData?.fields) {
          // Add test messages to ALL fields from the form data
          formData.fields.forEach((field: any, index: number) => {
            if (field.id) {
              const messageTypes = [
                "info",
                "warn",
                "error",
                "success",
              ] as const;
              const messageType = messageTypes[index % messageTypes.length];

              const messages = [
                `Field analysis complete for ${
                  field.label || field.name || "field"
                }`,
                `iStack Buddy detected field type: ${field.type}`,
                `Form validation check passed`,
                `Field ready for data entry`,
                `Logic rules evaluated successfully`,
                `Field configuration verified`,
                `Data validation complete`,
                `Form field optimized`,
              ];

              const message = messages[index % messages.length];

              onAddFieldMessage(
                field.id,
                `${message} (Field ${field.id})`,
                messageType,
                [],
                field.type
              );
            }
          });

          // Also add a summary message
          setTimeout(() => {
            if (formData.fields.length > 0 && onAddFieldMessage) {
              onAddFieldMessage(
                formData.fields[0].id,
                `✅ Analysis complete! Added messages to ${formData.fields.length} fields total.`,
                "success"
              );
            }
          }, 500);
        }
      },
      disabled: !iframeReady || !formData?.fields,
    },
    {
      label: "Test Highlight Fields",
      icon: <AnalyticsIcon />,
      action: () => {
        if (onHighlightField) {
          // Highlight a few fields
          onHighlightField("151701616");
          onHighlightField("163917652");
          onHighlightField("163917660");
        }
      },
      disabled: !iframeReady,
    },
  ];

  const developmentButtons = [
    {
      label: "Switch to App View",
      icon: <WebIcon />,
      action: handleSwitchToAppView,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        pb: 4,
        minHeight: "min-content",
      }}
    >
      {/* Form Info */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Form Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {formData?.id || "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Name: {formData?.name || "Loading..."}
          </Typography>
        </CardContent>
      </Card>

      {/* Chatbot */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            onClick={() => setChatExpanded(!chatExpanded)}
            sx={{ cursor: "pointer" }}
          >
            <Box display="flex" alignItems="center">
              <SmartToyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">AI Assistant</Typography>
            </Box>
            {chatExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>

          <Collapse in={chatExpanded}>
            <Box sx={{ mt: 2 }}>
              <Paper
                sx={{
                  height: 250,
                  overflow: "auto",
                  p: 1,
                  mb: 1,
                  backgroundColor: "background.default",
                }}
              >
                <List dense>
                  {chatMessages.map((message, index) => (
                    <ListItem key={index} sx={{ px: 1 }}>
                      <ListItemText
                        primary={message.text}
                        sx={{
                          textAlign:
                            message.sender === "user" ? "right" : "left",
                          "& .MuiListItemText-primary": {
                            fontSize: "0.875rem",
                            backgroundColor:
                              message.sender === "user"
                                ? "primary.light"
                                : "grey.100",
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            display: "inline-block",
                            color:
                              message.sender === "user"
                                ? "white"
                                : "text.primary",
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Ask about the form..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  color="primary"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Tool Buttons */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Form Tools
            {iframeReady && (
              <Chip
                label="Enhanced Mode Active"
                color="success"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {toolButtons.map((tool, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                startIcon={tool.icon}
                onClick={tool.action}
                disabled={tool.disabled}
                sx={{ justifyContent: "flex-start" }}
              >
                {tool.label}
              </Button>
            ))}
          </Box>

          {/* Development Controls */}
          {isDevelopmentMode && (
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="subtitle2" gutterBottom>
                Development Controls
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {developmentButtons.map((tool, index) => (
                  <Button
                    key={index}
                    variant="contained"
                    size="small"
                    startIcon={tool.icon}
                    onClick={tool.action}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {tool.label}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Observation Makers Panel */}
      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            onClick={() =>
              setObservationMakersExpanded(!observationMakersExpanded)
            }
            sx={{ cursor: "pointer" }}
          >
            <Box display="flex" alignItems="center">
              <AnalyticsIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Observation Makers</Typography>
            </Box>
            {observationMakersExpanded ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </Box>

          <Collapse in={observationMakersExpanded}>
            <Box sx={{ mt: 2 }}>
              {/* Widget Toggle */}
              <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant={
                    activeObservationWidget === "classic"
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setActiveObservationWidget("classic")}
                >
                  Classic View
                </Button>
                <Button
                  size="small"
                  variant={
                    activeObservationWidget === "logviewer"
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setActiveObservationWidget("logviewer")}
                >
                  Log Viewer ({observationLogItems.length} items)
                </Button>
                {isRunningObservations && (
                  <Chip
                    label="Running..."
                    color="info"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {/* Classic ObservationMakerPanel */}
              {activeObservationWidget === "classic" && (
                <ObservationMakerPanel
                  formData={formData}
                  iframeReady={iframeReady}
                  onAddFieldMessage={onAddFieldMessage}
                  onHighlightField={onHighlightField}
                  onClearAllMessages={onClearAllMessages}
                  onAddObservationResults={onAddObservationResults}
                  onDebugShowFieldContainers={onDebugShowFieldContainers}
                />
              )}

              {/* New LogItemViewer */}
              {activeObservationWidget === "logviewer" && (
                <LogItemViewer
                  logItems={observationLogItems}
                  title="Auto-Run Observation Results"
                />
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ToolPanel;
