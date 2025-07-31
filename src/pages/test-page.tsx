import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import VisibilityGraphWidget from "@/components/VisibilityGraph/VisibilityGraphWidget";

export default function TestPage() {
  const [selectedFormFile, setSelectedFormFile] =
    React.useState<string>("5375703.json");
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetFieldId = "148456734";

  // Load form data when selectedFormFile changes
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/test-data/forms-json/${selectedFormFile}`
        );
        if (!response.ok) {
          throw new Error(`Failed to load form data: ${response.statusText}`);
        }

        const data = await response.json();
        setFormData(data);
      } catch (err) {
        console.error("Error loading form data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [selectedFormFile]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Debug Form Selector - Top Right */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          flexShrink: 0,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Test Form</InputLabel>
          <Select
            value={selectedFormFile}
            label="Test Form"
            onChange={(e: SelectChangeEvent) =>
              setSelectedFormFile(e.target.value)
            }
          >
            <MenuItem value="5375703.json">5375703.json (Logic)</MenuItem>
            <MenuItem value="6221310.json">
              6221310.json (circular calculations)
            </MenuItem>
            <MenuItem value="6201623.json">
              6201623.json (malformed calculations)
            </MenuItem>
            <MenuItem value="5456371.json">
              5456371.json (label validation)
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Bordered Box Content */}
      <Box
        sx={{
          border: 2,
          borderColor: "primary.main",
          borderRadius: 0,
          p: 2,
          m: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          height: "calc(100vh - 200px)", // Direct height calculation
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Test Page - Visibility Graph
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Testing Visibility Graph for Field: {targetFieldId}
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error: {error}
          </Alert>
        )}

        {formData && !loading && (
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <VisibilityGraphWidget
              formData={formData}
              selectedSystem="test-system"
              selectedField={targetFieldId}
            />
          </Box>
        )}

        {!formData && !loading && !error && (
          <Typography variant="body1" color="text.secondary">
            Loading form data...
          </Typography>
        )}
      </Box>
    </Box>
  );
}
