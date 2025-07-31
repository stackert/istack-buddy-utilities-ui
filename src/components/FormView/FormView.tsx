import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { IObservationLogItem } from "istack-buddy-utilities";

interface FormViewProps {
  formData?: any;
  formHtml?: string;
  observations?: IObservationLogItem[];
}

export default function FormView({
  formData,
  formHtml,
  observations,
}: FormViewProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Form View
        </Typography>
        {formData && (
          <Typography variant="body2" color="text.secondary">
            Form: {formData.name || formData.id || "Unknown"}
          </Typography>
        )}
      </Paper>

      <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        {formHtml ? (
          <iframe
            srcDoc={formHtml}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              overflow: "auto",
            }}
            title="Form Preview"
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Typography variant="body1">
              No form HTML available for preview
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
