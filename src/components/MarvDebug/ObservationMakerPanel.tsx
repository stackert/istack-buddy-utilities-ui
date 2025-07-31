import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import {
  getAllObservationMakers,
  runObservationMaker,
  ObservationMakerRegistration,
} from "@/observationMakers";

interface ObservationMakerPanelProps {
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

interface ObservationResult {
  makerId: string;
  makerName: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

const ObservationMakerPanel: React.FC<ObservationMakerPanelProps> = ({
  formData,
  iframeReady = false,
  onAddFieldMessage,
  onHighlightField,
  onClearAllMessages,
  onAddObservationResults,
  onDebugShowFieldContainers,
}) => {
  const [results, setResults] = useState<ObservationResult[]>([]);
  const [running, setRunning] = useState<Set<string>>(new Set());

  const observationMakers = getAllObservationMakers();

  const handleRunObservationMaker = async (
    maker: ObservationMakerRegistration
  ) => {
    setRunning((prev) => new Set(prev).add(maker.id));

    try {
      const result = await runObservationMaker(maker.id, formData);

      const observationResult: ObservationResult = {
        makerId: maker.id,
        makerName: maker.name,
        success: result.success,
        data: result.data,
        error: result.error,
        timestamp: Date.now(),
      };

      setResults((prev) => {
        // Remove any previous result for this maker and add the new one
        const filtered = prev.filter((r) => r.makerId !== maker.id);
        return [observationResult, ...filtered];
      });

      // Send results to iframe if available and successful
      if (iframeReady && result.success && onAddObservationResults) {
        onAddObservationResults(result, maker.name);
      }
    } catch (error) {
      const observationResult: ObservationResult = {
        makerId: maker.id,
        makerName: maker.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };

      setResults((prev) => {
        const filtered = prev.filter((r) => r.makerId !== maker.id);
        return [observationResult, ...filtered];
      });
    } finally {
      setRunning((prev) => {
        const newSet = new Set(prev);
        newSet.delete(maker.id);
        return newSet;
      });
    }
  };

  const renderObservationResult = (result: ObservationResult) => {
    if (!result.success) {
      return (
        <Alert severity="error" sx={{ mt: 1 }}>
          <Typography variant="body2">{result.error}</Typography>
        </Alert>
      );
    }

    if (result.data?.observations) {
      return (
        <Box sx={{ mt: 1 }}>
          {result.data.observations.map((obs: any, index: number) => (
            <Alert
              key={index}
              severity={
                obs.severity === "high"
                  ? "error"
                  : obs.severity === "medium"
                  ? "warning"
                  : "info"
              }
              sx={{ mb: 1 }}
            >
              <Typography variant="body2">{obs.message}</Typography>
            </Alert>
          ))}

          {result.data.summary && (
            <Paper sx={{ p: 2, mt: 1, backgroundColor: "background.default" }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontSize: "0.75rem" }}
              >
                {JSON.stringify(result.data.summary, null, 2)}
              </Typography>
            </Paper>
          )}
        </Box>
      );
    }

    return (
      <Paper sx={{ p: 2, mt: 1, backgroundColor: "background.default" }}>
        <Typography
          variant="body2"
          component="pre"
          sx={{ fontSize: "0.75rem" }}
        >
          {JSON.stringify(result.data, null, 2)}
        </Typography>
      </Paper>
    );
  };

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <ScienceIcon />
        Observation Makers
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Run observation makers to analyze form structure, logic, and potential
        issues.
      </Typography>

      {/* Available Observation Makers */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Available Analyzers ({observationMakers.length})
          </Typography>

          <List dense>
            {observationMakers.map((maker) => (
              <ListItem key={maker.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">{maker.name}</Typography>
                      <Chip
                        label={maker.source}
                        size="small"
                        variant="outlined"
                        color={
                          maker.source === "library" ? "primary" : "secondary"
                        }
                      />
                    </Box>
                  }
                  secondary={maker.description}
                />
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      running.has(maker.id) ? (
                        <CircularProgress size={16} />
                      ) : (
                        <PlayArrowIcon />
                      )
                    }
                    onClick={() => handleRunObservationMaker(maker)}
                    disabled={running.has(maker.id) || !formData}
                  >
                    {running.has(maker.id) ? "Running..." : "Run"}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {!formData && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Form data is required to run observation makers.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Analysis Results
            </Typography>

            {results.map((result, index) => (
              <Accordion
                key={`${result.makerId}-${result.timestamp}`}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    {result.success ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {result.makerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {renderObservationResult(result)}
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ObservationMakerPanel;
