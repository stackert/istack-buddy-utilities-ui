import React from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";
import {
  IObservationLogItem,
  ELogLevel,
  EObservationSubjectType,
} from "istack-buddy-utilities";

interface LogItemViewerProps {
  logItems: IObservationLogItem[];
  title?: string;
  hideFilters?: boolean;
}

const LogItemViewer: React.FC<LogItemViewerProps> = ({
  logItems,
  title = "Observation Results",
  hideFilters = false,
}) => {
  const getLogLevelText = (logLevel: ELogLevel): string => {
    switch (logLevel) {
      case ELogLevel.ERROR:
        return "Error";
      case ELogLevel.WARN:
        return "Warn";
      case ELogLevel.INFO:
        return "Info";
      case ELogLevel.DEBUG:
        return "Debug";
      default:
        return "Unknown";
    }
  };

  const getSubjectTypeText = (subjectType: EObservationSubjectType): string => {
    switch (subjectType) {
      case EObservationSubjectType.FORM:
        return "Form";
      case EObservationSubjectType.FIELD:
        return "Field";
      default:
        return subjectType;
    }
  };

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}

      <Box
        sx={{
          border: 2,
          borderColor: "divider",
          borderRadius: 1,
          p: 1,
        }}
      >
        {logItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No observation items to display.
          </Typography>
        ) : (
          logItems.map((item, index) => (
            <Paper
              key={`${item.subjectId}-${item.logLevel}-${index}`}
              variant="outlined"
              sx={{ p: 2, mb: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", mr: 2 }}>
                  subjectId: {item.subjectId}
                </Typography>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  subjectType: {getSubjectTypeText(item.subjectType)}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  logLevel: {getLogLevelText(item.logLevel)}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                message: {item.message}
              </Typography>

              {item.messageSecondary && (
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    backgroundColor: "#f5f5f5",
                    p: 1,
                    borderRadius: 1,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {item.messageSecondary}
                </Typography>
              )}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default LogItemViewer;
