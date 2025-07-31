import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ObservationService } from "@/services/ObservationService";
import ToolPanel from "@/components/ToolPanel/ToolPanel";
import FormView from "@/components/FormView/FormView";
import MarvToolBox from "@/components/MarvToolBox/MarvToolBox";
import VisibilityGraph from "@/components/VisibilityGraph/VisibilityGraph";
import CalculationGraph from "@/components/CalculationGraph/CalculationGraph";
import {
  IObservationLogItem,
  ELogLevel,
  EObservationSubjectType,
} from "istack-buddy-utilities";
import {
  Box,
  Container,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface FormData {
  id: string;
  name: string;
  fields: any[];
  [key: string]: any;
}

interface FormMarvPageProps {
  sessionToken: string;
  formId: string;
}

export const getServerSideProps: GetServerSideProps<FormMarvPageProps> = async (
  context
) => {
  const { "session-token": sessionToken, formId } = context.params || {};

  return {
    props: {
      sessionToken: sessionToken as string,
      formId: formId as string,
    },
  };
};

export default function FormMarvPage({
  sessionToken,
  formId,
}: FormMarvPageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [allLogItems, setAllLogItems] = useState<IObservationLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormFile, setSelectedFormFile] =
    useState<string>("5375703.json");
  const [expandedTool, setExpandedTool] = useState<string | false>(
    "observation-manager"
  );
  const [selectedVisibilitySystem, setSelectedVisibilitySystem] =
    useState<string>("");
  const [selectedVisibilityField, setSelectedVisibilityField] =
    useState<string>("");
  const [selectedCalculationSystem, setSelectedCalculationSystem] =
    useState<string>("");
  const [selectedCalculationField, setSelectedCalculationField] =
    useState<string>("");
  const [observationsToShow, setObservationsToShow] = useState<
    IObservationLogItem[]
  >([]);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "1",
      content:
        "Hello! I'm Marv, your form analysis assistant. How can I help you today?",
      author: "marv",
      dateTime: new Date().toLocaleString(),
    },
    {
      id: "2",
      content:
        "I can help you analyze forms, validate configurations, create backups, and much more. Try clicking one of the buttons in the Marv Tool Box!",
      author: "marv",
      dateTime: new Date().toLocaleString(),
    },
    {
      id: "3",
      content:
        "I see you're working with form 5375703. This form has some interesting logic patterns.",
      author: "marv",
      dateTime: new Date(Date.now() - 300000).toLocaleString(),
    },
    {
      id: "4",
      content: "What would you like to do with this form?",
      author: "marv",
      dateTime: new Date(Date.now() - 300000).toLocaleString(),
    },
    {
      id: "5",
      content: "I'd like to create a backup first",
      author: "user",
      dateTime: new Date(Date.now() - 250000).toLocaleString(),
    },
    {
      id: "6",
      content:
        "Great idea! Creating backup of current form configuration... Backup completed successfully!",
      author: "marv",
      dateTime: new Date(Date.now() - 250000).toLocaleString(),
    },
    {
      id: "7",
      content: "Now let's validate the form",
      author: "user",
      dateTime: new Date(Date.now() - 200000).toLocaleString(),
    },
    {
      id: "8",
      content:
        "Running form validation... Found 3 issues: 2 calculation errors and 1 missing field label.",
      author: "marv",
      dateTime: new Date(Date.now() - 200000).toLocaleString(),
    },
    {
      id: "9",
      content: "Can you show me the calculation errors?",
      author: "user",
      dateTime: new Date(Date.now() - 150000).toLocaleString(),
    },
    {
      id: "10",
      content:
        "The first error is in field 'total_amount' - it references a non-existent field 'subtotal'. The second error is in field 'tax_rate' - it has a circular reference.",
      author: "marv",
      dateTime: new Date(Date.now() - 150000).toLocaleString(),
    },
    {
      id: "11",
      content: "Thanks for the details. Can you export the configuration?",
      author: "user",
      dateTime: new Date(Date.now() - 100000).toLocaleString(),
    },
    {
      id: "12",
      content:
        "Exporting form configuration to JSON... Export completed. File saved as 'form-config.json'",
      author: "marv",
      dateTime: new Date(Date.now() - 100000).toLocaleString(),
    },
    {
      id: "13",
      content: "Perfect! Now generate a report",
      author: "user",
      dateTime: new Date(Date.now() - 50000).toLocaleString(),
    },
    {
      id: "14",
      content:
        "Generating comprehensive form analysis report... Report ready! 15 observations found.",
      author: "marv",
      dateTime: new Date(Date.now() - 50000).toLocaleString(),
    },
    {
      id: "15",
      content:
        "The report shows that your form has 12 fields with logic, 8 fields with calculations, and 3 validation issues that need attention.",
      author: "marv",
      dateTime: new Date(Date.now() - 30000).toLocaleString(),
    },
    {
      id: "16",
      content: "Would you like me to help you fix the validation issues?",
      author: "marv",
      dateTime: new Date(Date.now() - 30000).toLocaleString(),
    },
    {
      id: "17",
      content: "Yes, please help me fix them",
      author: "user",
      dateTime: new Date(Date.now() - 20000).toLocaleString(),
    },
    {
      id: "18",
      content:
        "I'll help you fix the validation issues. Let's start with the missing field label. Which field would you like to add a label to?",
      author: "marv",
      dateTime: new Date(Date.now() - 20000).toLocaleString(),
    },
    {
      id: "19",
      content: "The field without a label is 'field_123'",
      author: "user",
      dateTime: new Date(Date.now() - 10000).toLocaleString(),
    },
    {
      id: "20",
      content:
        "Got it! I've added a label 'Total Amount' to field_123. Now let's fix the calculation errors.",
      author: "marv",
      dateTime: new Date(Date.now() - 10000).toLocaleString(),
    },
    {
      id: "21",
      content:
        "For the 'total_amount' field, you need to either create a 'subtotal' field or change the calculation to reference an existing field.",
      author: "marv",
      dateTime: new Date(Date.now() - 5000).toLocaleString(),
    },
    {
      id: "22",
      content:
        "And for the 'tax_rate' field, you have a circular reference that needs to be resolved.",
      author: "marv",
      dateTime: new Date(Date.now() - 5000).toLocaleString(),
    },
    {
      id: "23",
      content:
        "Would you like me to suggest alternative calculations for these fields?",
      author: "marv",
      dateTime: new Date(Date.now() - 2000).toLocaleString(),
    },
    {
      id: "24",
      content: "Yes, please suggest alternatives",
      author: "user",
      dateTime: new Date(Date.now() - 1000).toLocaleString(),
    },
    {
      id: "25",
      content:
        "For 'total_amount', I suggest using 'item_total' instead of 'subtotal'. For 'tax_rate', I recommend removing the self-reference and using a fixed rate of 8.5%.",
      author: "marv",
      dateTime: new Date(Date.now() - 1000).toLocaleString(),
    },
  ]);

  const getValidFormId = (inputFormId: string | undefined): string => {
    if (!inputFormId) return "5375703";
    const numericFormId = inputFormId.replace(/[^0-9]/g, "");
    if (!numericFormId || isNaN(Number(numericFormId))) {
      return "5375703";
    }
    return numericFormId;
  };

  const validFormId = getValidFormId(formId);

  const handleChatMessage = (message: any) => {
    setChatMessages((prev) => [...prev, message]);
  };

  const handleVisibilitySystemChange = (system: string) => {
    setSelectedVisibilitySystem(system);
    setSelectedVisibilityField(""); // Reset field when system changes
  };

  const handleVisibilityFieldChange = (field: string) => {
    setSelectedVisibilityField(field);
  };

  const handleCalculationSystemChange = (system: string) => {
    setSelectedCalculationSystem(system);
    setSelectedCalculationField(""); // Reset field when system changes
  };

  const handleCalculationFieldChange = (field: string) => {
    setSelectedCalculationField(field);
  };

  const handleSendObservationsToForm = (
    observations: IObservationLogItem[]
  ) => {
    setObservationsToShow(observations);
  };

  // Load form and run observations
  useEffect(() => {
    if (!validFormId) return;

    const loadFormAndRunObservations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load form data based on selection
        const response = await fetch(
          `/test-data/forms-json/${selectedFormFile}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load form data: ${response.statusText}`);
        }

        const data = await response.json();
        setFormData(data);

        // Run observations
        console.log(`Starting observations for form: ${selectedFormFile}`);
        const observationService = new ObservationService();
        try {
          const result = await observationService.runAllObservations(data);
          console.log(
            `Observations completed for ${selectedFormFile}:`,
            result.logItems.length,
            "items"
          );
          setAllLogItems(result.logItems);
        } catch (observationError) {
          console.error("Error running observations:", observationError);
          setError(
            `Observation error: ${
              observationError instanceof Error
                ? observationError.message
                : "Unknown observation error"
            }`
          );
        }
      } catch (err) {
        console.error("Error loading form or running observations:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadFormAndRunObservations();
  }, [validFormId, selectedFormFile]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          Error: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Debug Form Selector - Top Right */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
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

      {/* Main Content */}
      <Box sx={{ display: "flex", height: "calc(100vh - 200px)" }}>
        {/* Tool Panel - 25% width */}
        <ToolPanel
          allLogItems={allLogItems}
          formData={formData}
          expandedTool={expandedTool}
          onExpandedToolChange={setExpandedTool}
          onChatMessage={handleChatMessage}
          onVisibilitySystemChange={handleVisibilitySystemChange}
          selectedVisibilitySystem={selectedVisibilitySystem}
          onCalculationSystemChange={handleCalculationSystemChange}
          selectedCalculationSystem={selectedCalculationSystem}
          onFilteredCountChange={(count) => {
            // This will be handled by the ToolPanel internally
          }}
          onSendObservationsToForm={handleSendObservationsToForm}
        />

        {/* Main Content Area - 75% width */}
        {expandedTool === "marv-tool-box" ? (
          <MarvToolBox messages={chatMessages} />
        ) : expandedTool === "visibility-systems" ? (
          <VisibilityGraph
            selectedSystem={selectedVisibilitySystem}
            selectedField={selectedVisibilityField}
            formData={formData}
            onVisibilityFieldChange={handleVisibilityFieldChange}
          />
        ) : expandedTool === "calculation-systems" ? (
          <CalculationGraph
            selectedSystem={selectedCalculationSystem}
            selectedField={selectedCalculationField}
            formData={formData}
            onCalculationFieldChange={handleCalculationFieldChange}
          />
        ) : (
          <FormView
            formData={formData}
            formHtml={formData?.v4html}
            observations={observationsToShow}
          />
        )}
      </Box>
    </Box>
  );
}
