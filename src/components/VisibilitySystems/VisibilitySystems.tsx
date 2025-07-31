import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Models, TreeUtilities } from "istack-buddy-utilities";

interface VisibilitySystemsProps {
  formData?: any;
  onVisibilitySystemChange?: (system: string) => void;
  selectedVisibilitySystem?: string;
}

interface SystemField {
  fieldId: string;
  label: string;
  sort: number;
}

const VisibilitySystems: React.FC<VisibilitySystemsProps> = ({
  formData,
  onVisibilitySystemChange,
  selectedVisibilitySystem,
}) => {
  const [systems, setSystems] = useState<Record<string, SystemField[]>>({});

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

      // Set the first system as default if no system is currently selected
      if (!selectedVisibilitySystem && Object.keys(logicSystems).length > 0) {
        const firstSystemKey = Object.keys(logicSystems)[0];
        onVisibilitySystemChange?.(firstSystemKey);
      }
    } catch (error) {
      console.error("Error extracting visibility systems:", error);
    }
  }, [formData, selectedVisibilitySystem, onVisibilitySystemChange]);

  const handleSystemChange = (event: SelectChangeEvent) => {
    const newSystem = event.target.value;
    onVisibilitySystemChange?.(newSystem);
    console.log(`Visibility System selected: ${newSystem}`);
  };

  const formatSystemOption = (
    systemKey: string,
    systemFields: SystemField[]
  ) => {
    if (systemFields.length === 0) return systemKey;

    // Get the identifying node (first field in the system)
    const identifyingField = systemFields[0];
    const label = identifyingField.label || "No Label";

    // Format: "fieldId - label (truncated to 50 chars)"
    const truncatedLabel =
      label.length > 50 ? label.substring(0, 47) + "..." : label;
    return `${identifyingField.fieldId} - ${truncatedLabel}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select Visibility System:
      </Typography>

      <FormControl fullWidth size="small">
        <InputLabel>System</InputLabel>
        <Select
          value={selectedVisibilitySystem || ""}
          label="System"
          onChange={handleSystemChange}
        >
          {Object.entries(systems).map(([systemKey, systemFields]) => (
            <MenuItem key={systemKey} value={systemKey}>
              {formatSystemOption(systemKey, systemFields)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default VisibilitySystems;
