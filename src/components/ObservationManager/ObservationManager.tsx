import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import { ELogLevel, EObservationSubjectType } from "istack-buddy-utilities";
import LogItemViewer from "@/components/MarvDebug/LogItemViewer";
import { IObservationLogItem } from "istack-buddy-utilities";

interface ObservationManagerProps {
  allLogItems: IObservationLogItem[];
  formData?: any;
  onFilteredCountChange?: (count: number) => void;
  onSendObservationsToForm?: (observations: IObservationLogItem[]) => void;
}

interface FilterState {
  searchText: string;
  fieldType: string;
  hasLogic: boolean | null;
  hasCalculation: boolean | null;
  logLevel: string;
  subjectType: string;
}

export default function ObservationManager({
  allLogItems,
  formData,
  onFilteredCountChange,
  onSendObservationsToForm,
}: ObservationManagerProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchText: "",
    fieldType: "ALL",
    hasLogic: null,
    hasCalculation: null,
    logLevel: "ALL",
    subjectType: "ALL",
  });

  // Get unique field types
  const uniqueFieldTypes = formData?.fields
    ? Array.from(
        new Set(formData.fields.map((field: any) => field.type || "unknown"))
      )
    : [];

  // Filter log items
  const filteredLogItems = allLogItems.filter((item) => {
    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const messageMatch = item.message?.toLowerCase().includes(searchLower);
      const secondaryMatch = item.messageSecondary
        ?.toLowerCase()
        .includes(searchLower);
      const subjectIdMatch = item.subjectId
        ?.toLowerCase()
        .includes(searchLower);

      if (!messageMatch && !secondaryMatch && !subjectIdMatch) {
        return false;
      }
    }

    // Log level filter
    if (filters.logLevel !== "ALL" && item.logLevel !== filters.logLevel) {
      return false;
    }

    // Subject type filter
    if (
      filters.subjectType !== "ALL" &&
      item.subjectType !== filters.subjectType
    ) {
      return false;
    }

    // Field type filter (only applies to field observations)
    if (
      filters.fieldType !== "ALL" &&
      item.subjectType === EObservationSubjectType.FIELD
    ) {
      const field = formData?.fields?.find((f: any) => f.id === item.subjectId);
      if (!field || field.type !== filters.fieldType) {
        return false;
      }
    }

    // Has logic filter
    if (
      filters.hasLogic !== null &&
      item.subjectType === EObservationSubjectType.FIELD
    ) {
      const field = formData?.fields?.find((f: any) => f.id === item.subjectId);
      const hasLogic =
        field && (field.logic || field.showLogic || field.hideLogic);
      if (hasLogic !== filters.hasLogic) {
        return false;
      }
    }

    // Has calculation filter
    if (
      filters.hasCalculation !== null &&
      item.subjectType === EObservationSubjectType.FIELD
    ) {
      const field = formData?.fields?.find((f: any) => f.id === item.subjectId);
      const hasCalculation = field && field.calculation;
      if (hasCalculation !== filters.hasCalculation) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = (filterName: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleViewOnForm = () => {
    if (onSendObservationsToForm) {
      onSendObservationsToForm(filteredLogItems);
    }
  };

  // Update parent component with filtered count
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredLogItems.length);
    }
  }, [filteredLogItems.length, onFilteredCountChange]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Filter Section */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Filter by:
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          label="Search"
          value={filters.searchText}
          onChange={(e) => handleFilterChange("searchText", e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Logic and Calculation Checkboxes */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hasLogic === true}
                    onChange={(e) => {
                      const newValue = e.target.checked ? true : null;
                      handleFilterChange("hasLogic", newValue);
                    }}
                  />
                }
                label="Has Logic"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hasCalculation === true}
                    onChange={(e) => {
                      const newValue = e.target.checked ? true : null;
                      handleFilterChange("hasCalculation", newValue);
                    }}
                  />
                }
                label="Has Calc"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Filters Grid */}
        <Grid container spacing={1}>
          {/* Log Level */}
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Log Level</InputLabel>
              <Select
                value={filters.logLevel}
                label="Log Level"
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange("logLevel", e.target.value)
                }
              >
                <MenuItem value="ALL">All Levels</MenuItem>
                <MenuItem value={ELogLevel.DEBUG}>Debug</MenuItem>
                <MenuItem value={ELogLevel.INFO}>Info</MenuItem>
                <MenuItem value={ELogLevel.WARN}>Warning</MenuItem>
                <MenuItem value={ELogLevel.ERROR}>Error</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Subject Type */}
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject Type</InputLabel>
              <Select
                value={filters.subjectType}
                label="Subject Type"
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange("subjectType", e.target.value)
                }
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value={EObservationSubjectType.FORM}>Form</MenuItem>
                <MenuItem value={EObservationSubjectType.FIELD}>Field</MenuItem>
                <MenuItem value="SUBMIT_ACTION">Submit Action</MenuItem>
                <MenuItem value="EMAIL">Email</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Field Type */}
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Field Type</InputLabel>
              <Select
                value={filters.fieldType}
                label="Field Type"
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange("fieldType", e.target.value)
                }
              >
                <MenuItem value="ALL">All Types</MenuItem>
                {uniqueFieldTypes.map((type: any) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* View On Form Button */}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleViewOnForm}
            disabled={filteredLogItems.length === 0}
          >
            View On Form ({filteredLogItems.length} observations)
          </Button>
        </Box>
      </Paper>

      {/* Observation List */}
      <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <LogItemViewer
          logItems={filteredLogItems}
          title=""
          hideFilters={true}
        />
      </Box>
    </Box>
  );
}
