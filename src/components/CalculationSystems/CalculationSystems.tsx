import React, { useEffect, useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { TreeUtilities, Models } from "istack-buddy-utilities";

interface CalculationSystemsProps {
  formData: any;
  selectedCalculationSystem: string | null;
  onCalculationSystemChange?: (system: string) => void;
}

const CalculationSystems: React.FC<CalculationSystemsProps> = ({
  formData,
  selectedCalculationSystem,
  onCalculationSystemChange,
}) => {
  const [systems, setSystems] = useState<Record<string, any>>({});

  useEffect(() => {
    if (formData) {
      try {
        const formModel = new Models.FsModelForm(formData, {
          fieldModelVersion: "v2",
        });
        const calculationSystems =
          TreeUtilities.transformers.transformToCalculationSystems(formModel);
        setSystems(calculationSystems);
        if (
          !selectedCalculationSystem &&
          Object.keys(calculationSystems).length > 0
        ) {
          const firstSystemKey = Object.keys(calculationSystems)[0];
          onCalculationSystemChange?.(firstSystemKey);
        }
      } catch (error) {
        console.error("Error extracting calculation systems:", error);
      }
    }
  }, [formData, selectedCalculationSystem, onCalculationSystemChange]);

  const handleSystemChange = (event: SelectChangeEvent) => {
    onCalculationSystemChange?.(event.target.value);
  };

  const formatSystemOption = (systemKey: string, systemFields: any[]) => {
    if (systemFields.length === 0) return systemKey;

    // Get the identifying node (first field in the system)
    const identifyingField = systemFields[0];
    const label = identifyingField.label || "No Label";

    // Format: "fieldId - label (truncated to 50 chars)"
    const truncatedLabel =
      label.length > 50 ? label.substring(0, 47) + "..." : label;
    return `${identifyingField.fieldId} - ${truncatedLabel}`;
  };

  if (!formData) {
    return (
      <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
        Please load form data to view calculation systems.
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Calculation System</InputLabel>
          <Select
            value={selectedCalculationSystem || ""}
            label="Calculation System"
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
    </Box>
  );
};

export default CalculationSystems;
