import React, { useEffect, useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { TreeUtilities, Models } from "istack-buddy-utilities";
import CalculationGraphWidget from "./CalculationGraphWidget";

interface CalculationGraphProps {
  formData: any;
  selectedSystem: string;
  selectedField: string;
  onCalculationFieldChange?: (field: string) => void;
}

const CalculationGraph: React.FC<CalculationGraphProps> = ({
  formData,
  selectedSystem,
  selectedField,
  onCalculationFieldChange,
}) => {
  const [systemFields, setSystemFields] = useState<
    Array<{ fieldId: string; label?: string }>
  >([]);

  useEffect(() => {
    if (!formData || !selectedSystem) {
      setSystemFields([]);
      return;
    }

    try {
      const formModel = new Models.FsModelForm(formData, {
        fieldModelVersion: "v2",
      });
      const calculationSystems =
        TreeUtilities.transformers.transformToCalculationSystems(formModel);
      console.log({ calculationSystems });

      const system = calculationSystems[selectedSystem];
      console.log({ system });
      if (system) {
        // Extract field IDs from the calculation system
        const fields = system.map((field) => ({
          fieldId: field.fieldId,
          label: field.label || field.fieldId,
        }));
        console.log({ fields });
        setSystemFields(fields);

        // Auto-select first field if none selected
        if (!selectedField && fields.length > 0) {
          onCalculationFieldChange?.(fields[0].fieldId);
        }
      }
    } catch (error) {
      console.error("Error extracting calculation fields:", error);
      setSystemFields([]);
    }
  }, [formData, selectedSystem, selectedField, onCalculationFieldChange]);

  const handleFieldChange = (event: SelectChangeEvent) => {
    onCalculationFieldChange?.(event.target.value);
  };

  if (!selectedSystem) {
    return (
      <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
        Please select a calculation system to view the calculation graph.
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Field</InputLabel>
          <Select
            value={selectedField}
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
      <CalculationGraphWidget
        formData={formData}
        selectedSystem={selectedSystem}
        selectedField={selectedField}
      />
    </Box>
  );
};

export default CalculationGraph;
