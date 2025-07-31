import {
  ELogLevel,
  EObservationSubjectType,
  EObservationClass,
  IObservationContext,
  IObservationResult,
  IObservationLogItem,
  Models,
  ObservationMakers,
} from "istack-buddy-utilities";

export class FieldDebugJsonObservationMaker extends ObservationMakers.AbstractObservationMaker {
  protected messagePrimary: string = "Field Debug JSON Output";
  protected subjectType = EObservationSubjectType.FIELD;
  protected observationClass = this.constructor.name;

  getRequiredResources(): string[] {
    return ["formModel"];
  }

  async makeObservation(
    context: IObservationContext
  ): Promise<IObservationResult> {
    const logItems: IObservationLogItem[] = [];
    const formModel = context.resources.formModel as Models.FsModelForm;

    // Iterate through all field IDs
    formModel.getFieldIds().forEach((fieldId) => {
      try {
        // Get the field model
        const fieldModel = formModel.getFieldModelById(fieldId);

        if (!fieldModel) {
          console.warn(`Field model not found for fieldId: ${fieldId}`);
          return;
        }

        // Extract just the _rawJson property from the field
        let rawFieldJson: any;

        // Method 1: Check if fieldModel has _rawJson property (preferred)
        if ((fieldModel as any)._rawJson) {
          rawFieldJson = (fieldModel as any)._rawJson;
        }
        // Method 2: Check if fieldModel has a rawData or originalData property
        else if ((fieldModel as any).rawData) {
          rawFieldJson = (fieldModel as any).rawData;
        }
        // Method 3: Check if it has the original field data
        else if ((fieldModel as any).fieldData) {
          rawFieldJson = (fieldModel as any).fieldData;
        }
        // Method 4: Try to reconstruct from available properties
        else {
          rawFieldJson = {
            id: fieldId,
            type: fieldModel.getFieldType?.() || "unknown",
            label: fieldModel.labelUserFriendly?.() || "",
            required: (fieldModel as any).required || false,
            calculation: fieldModel.getCalculationString?.() || "",
            logic: fieldModel.getLogicOwn?.() || null,
            // Add any other properties we can extract
            ...(fieldModel as any), // Spread to capture other properties
          };
        }

        // Format JSON for text display (not HTML) with proper indentation
        const formatJsonForText = (obj: any): string => {
          return JSON.stringify(obj, null, 2);
        };

        // Create debug log item with the field JSON
        const logItem: IObservationLogItem = this.createDebugLogItem(context, {
          subjectId: fieldId,
          messageSecondary: `[analysis] field json { ${fieldId} }\n\n${formatJsonForText(
            rawFieldJson
          )}`,
          relatedEntityIds: [fieldId],
          additionalDetails: {
            fieldId: fieldId,
            fieldType: rawFieldJson.type || "unknown",
            rawFieldJson: rawFieldJson,
            analysisType: "field_debug_json",
            timestamp: new Date().toISOString(),
          },
        });

        logItems.push(logItem);
      } catch (error) {
        console.error(`Error processing field ${fieldId}:`, error);

        // Add error log item
        const errorLogItem: IObservationLogItem = this.createErrorLogItem(
          context,
          {
            subjectId: fieldId,
            messageSecondary: `Error extracting JSON for field ${fieldId}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            relatedEntityIds: [fieldId],
            additionalDetails: {
              fieldId: fieldId,
              error: error instanceof Error ? error.message : String(error),
              analysisType: "field_debug_json_error",
            },
          }
        );

        logItems.push(errorLogItem);
      }
    });

    const isObservationTrue = logItems.length > 0;

    return {
      logItems,
      isObservationTrue,
    };
  }
}
