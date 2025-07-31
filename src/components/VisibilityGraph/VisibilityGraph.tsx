import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Models, TreeUtilities } from "istack-buddy-utilities";
import VisibilityGraphWidget from "./VisibilityGraphWidget";

interface VisibilityGraphProps {
  formData: any;
  selectedSystem: string;
  selectedField: string;
  onVisibilityFieldChange?: (fieldId: string) => void;
}

const VisibilityGraph: React.FC<VisibilityGraphProps> = ({
  formData,
  selectedSystem,
  selectedField,
  onVisibilityFieldChange,
}) => {
  const [systems, setSystems] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!formData) return;

    try {
      // Create form model from the form data
      const formModel = new Models.FsModelForm(formData, {
        fieldModelVersion: "v2",
      });

      // Create logic systems for the entire form
      const logicSystems =
        TreeUtilities.transformers.transformToLogicSystems(formModel);

      setSystems(logicSystems);
    } catch (error) {
      console.error("Error extracting visibility systems:", error);
    }
  }, [formData]);

  // Set the first field as default when a system is selected
  useEffect(() => {
    if (selectedSystem && !selectedField) {
      const systemFields = systems[selectedSystem] || [];
      if (systemFields.length > 0) {
        const firstField = systemFields[0];
        onVisibilityFieldChange?.(firstField.fieldId);
      }
    }
  }, [selectedSystem, selectedField, systems, onVisibilityFieldChange]);

  const handleFieldChange = (event: SelectChangeEvent) => {
    onVisibilityFieldChange?.(event.target.value);
  };

  const systemFields = systems[selectedSystem] || [];

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Field</InputLabel>
          <Select
            value={selectedField || ""}
            label="Field"
            onChange={handleFieldChange}
          >
            {systemFields.map((field) => (
              <MenuItem key={field.fieldId} value={field.fieldId}>
                {field.label || field.fieldId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <VisibilityGraphWidget
        formData={formData}
        selectedSystem={selectedSystem}
        selectedField={selectedField}
      />
    </Box>
  );
};

export default VisibilityGraph;
