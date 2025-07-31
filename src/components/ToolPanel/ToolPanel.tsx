import React, { useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ObservationManager from "@/components/ObservationManager/ObservationManager";
import MarvToolBox from "@/components/MarvToolBox/MarvToolBox";
import MarvToolBoxButtons from "@/components/MarvToolBox/MarvToolBoxButtons";
import CalculationSystems from "@/components/CalculationSystems/CalculationSystems";
import VisibilitySystems from "@/components/VisibilitySystems/VisibilitySystems";
import { IObservationLogItem } from "istack-buddy-utilities";

interface Message {
  id: string;
  content: string;
  author: "user" | "marv";
  dateTime: string;
}

interface ToolPanelProps {
  allLogItems: IObservationLogItem[];
  formData?: any;
  expandedTool?: string | false;
  onExpandedToolChange?: (tool: string | false) => void;
  onChatMessage?: (message: Message) => void;
  onVisibilitySystemChange?: (system: string) => void;
  selectedVisibilitySystem?: string;
  onCalculationSystemChange?: (system: string) => void;
  selectedCalculationSystem?: string;
  onFilteredCountChange?: (count: number) => void;
  onSendObservationsToForm?: (observations: IObservationLogItem[]) => void;
}

// Fake second tool component for demonstration
function FakeTool() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Fake Tool
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This is a placeholder tool to demonstrate the accordion functionality.
        When you expand this tool, it will show its content while other tools
        collapse.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">• Tool features would go here</Typography>
        <Typography variant="body2">• Configuration options</Typography>
        <Typography variant="body2">• Action buttons</Typography>
      </Box>
    </Box>
  );
}

export default function ToolPanel({
  allLogItems,
  formData,
  expandedTool = "marv-tool-box",
  onExpandedToolChange,
  onChatMessage,
  onVisibilitySystemChange,
  selectedVisibilitySystem,
  onCalculationSystemChange,
  selectedCalculationSystem,
  onFilteredCountChange,
  onSendObservationsToForm,
}: ToolPanelProps) {
  const [filteredCount, setFilteredCount] = useState(allLogItems.length);

  const handleMarvButtonClick = (prompt: string) => {
    // Add user message with the prompt
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      author: "user",
      dateTime: new Date().toLocaleString(),
    };
    onChatMessage?.(userMessage);

    // Add Marv response based on the prompt
    setTimeout(() => {
      let response = "";
      if (prompt.includes("create logic and calculation stash")) {
        response =
          "Creating logic and calculation stash... Backup completed successfully! Your form configuration has been saved.";
      } else if (prompt.includes("restore logic and calculation stash")) {
        response =
          "Restoring logic and calculation stash... Form configuration has been restored from the latest backup.";
      } else if (
        prompt.includes("add unique slug to the beginning of each label")
      ) {
        response =
          "Adding unique slugs to labels... All field labels now have unique identifiers at the beginning.";
      } else if (prompt.includes("remove label unique slugs")) {
        response =
          "Removing unique slugs from labels... All field labels have been cleaned up and unique identifiers removed.";
      } else {
        response =
          "I understand you want to perform that action. Let me process that for you.";
      }

      const marvMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        author: "marv",
        dateTime: new Date().toLocaleString(),
      };
      onChatMessage?.(marvMessage);
    }, 500);
  };

  const handleAccordionChange =
    (toolId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      console.log(`Accordion clicked: ${toolId}, isExpanded: ${isExpanded}`);
      onExpandedToolChange?.(isExpanded ? toolId : false);
    };

  return (
    <Box
      sx={{
        width: "25%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: 1,
        borderColor: "divider",
        overflow: "hidden",
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
        <Typography variant="h6">Tools</Typography>
      </Paper>

      <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <Accordion
          expanded={expandedTool === "marv-tool-box"}
          onChange={handleAccordionChange("marv-tool-box")}
          sx={{ borderRadius: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor:
                expandedTool === "marv-tool-box" ? "action.hover" : "inherit",
            }}
          >
            <Typography variant="subtitle1">Marv Tool Box</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <MarvToolBoxButtons onButtonClick={handleMarvButtonClick} />
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedTool === "calculation-systems"}
          onChange={handleAccordionChange("calculation-systems")}
          sx={{ borderRadius: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor:
                expandedTool === "calculation-systems"
                  ? "action.hover"
                  : "inherit",
            }}
          >
            <Typography variant="subtitle1">Calculation Systems</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <CalculationSystems
              formData={formData}
              selectedCalculationSystem={selectedCalculationSystem || null}
              onCalculationSystemChange={onCalculationSystemChange}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedTool === "visibility-systems"}
          onChange={handleAccordionChange("visibility-systems")}
          sx={{ borderRadius: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor:
                expandedTool === "visibility-systems"
                  ? "action.hover"
                  : "inherit",
            }}
          >
            <Typography variant="subtitle1">Visibility Systems</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <VisibilitySystems
              formData={formData}
              onVisibilitySystemChange={onVisibilitySystemChange}
              selectedVisibilitySystem={selectedVisibilitySystem}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedTool === "observation-manager"}
          onChange={handleAccordionChange("observation-manager")}
          sx={{ borderRadius: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor:
                expandedTool === "observation-manager"
                  ? "action.hover"
                  : "inherit",
            }}
          >
            <Box>
              <Typography variant="subtitle1">Observation Manager</Typography>
              <Typography variant="caption" color="text.secondary">
                ({filteredCount} of {allLogItems.length} observations)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <ObservationManager
              allLogItems={allLogItems}
              formData={formData}
              onFilteredCountChange={setFilteredCount}
              onSendObservationsToForm={onSendObservationsToForm}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
