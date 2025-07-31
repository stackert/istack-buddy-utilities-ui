import {
  Models,
  ObservationMakers,
  TreeUtilities,
  IObservationLogItem,
  IObservationResult,
  IObservationContext,
  ELogLevel,
  EObservationSubjectType,
  EObservationClass,
  EObservationResource,
} from "istack-buddy-utilities";

// Import our copied observation makers
import { ObservationMakerFieldCounts } from "@/observation-makers/custom/ObservationMakerFieldCounts";
// import { ObservationMakerCalculationValidation } from "@/observation-makers/custom/ObservationMakerCalculationValidation";
// import { ObservationMakerLogicValidation } from "@/observation-makers/custom/ObservationMakerLogicValidation";
import { FieldDebugJsonObservationMaker } from "@/observation-makers/custom/FieldDebugJsonObservationMaker";

/**
 * Utility function to create logic trees for a form model
 * This handles error cases and checks both getLogicOwn() and visibilityLogicOwn
 */
function createLogicTrees(
  formModel: Models.FsModelForm
): Record<string, InstanceType<typeof TreeUtilities.FsFieldVisibilityGraph>> {
  const logicTrees: Record<
    string,
    InstanceType<typeof TreeUtilities.FsFieldVisibilityGraph>
  > = {};

  try {
    formModel.getFieldIds().forEach((fieldId) => {
      try {
        const field = formModel.getFieldModelById(fieldId);

        // Check both getLogicOwn() and raw visibilityLogicOwn
        if (field?.getLogicOwn() || (field as any)?.visibilityLogicOwn) {
          try {
            const logicTree =
              TreeUtilities.FsFieldVisibilityGraph.fromFormModel(
                fieldId,
                formModel
              );
            logicTrees[fieldId] = logicTree;
          } catch (error) {
            // Skip fields with invalid logic - optional logging
          }
        }
      } catch (error) {
        // Skip individual field processing errors
      }
    });
  } catch (error) {
    // If the entire logic tree creation fails, return empty object
  }

  return logicTrees;
}

export class ObservationService {
  private copiedObservationMakers: any[] = [];
  private libraryObservationMakers: any[] = [];
  private observationMakerNames: Map<string, string> = new Map();

  constructor() {
    // Initialize our copied observation makers
    this.copiedObservationMakers = [
      new FieldDebugJsonObservationMaker(), // Re-enabled - produces multiple field-specific messages
      new ObservationMakerFieldCounts(),
      // new ObservationMakerCalculationValidation(), // Not available - import commented out
      // new ObservationMakerLogicValidation(), // Not available - import commented out
    ];

    // Initialize library observation makers from istack-buddy-utilities
    this.libraryObservationMakers = [
      // Only FieldLogicObservationMaker enabled
      new ObservationMakers.FieldLogicObservationMaker(),
      // Disabled observation makers:
      // new ObservationMakers.FieldCalculationObservationMaker(),
      // new ObservationMakers.FieldConfigurationObservationMaker(),
      // new ObservationMakers.FieldOrphanFieldIdObservationMaker(),
    ];

    // Map constructor names to readable names
    this.setupObservationMakerNames();
  }

  private setupObservationMakerNames() {
    // Map our custom observation makers
    this.observationMakerNames.set(
      "FieldDebugJsonObservationMaker",
      "Field Debug JSON"
    );
    this.observationMakerNames.set(
      "ObservationMakerFieldCounts",
      "Field Counts"
    );
    // this.observationMakerNames.set(
    //   "ObservationMakerCalculationValidation",
    //   "Calculation Validation"
    // );
    // this.observationMakerNames.set(
    //   "ObservationMakerLogicValidation",
    //   "Logic Validation"
    // );

    // Map library observation makers (only active ones)
    this.observationMakerNames.set(
      "FieldLogicObservationMaker",
      "Field Logic Analysis"
    );
    // Disabled observation makers:
    // this.observationMakerNames.set(
    //   "FieldCalculationObservationMaker",
    //   "Field Calculation Analysis"
    // );
    // this.observationMakerNames.set(
    //   "FieldConfigurationObservationMaker",
    //   "Field Configuration Analysis"
    // );
    // this.observationMakerNames.set(
    //   "FieldOrphanFieldIdObservationMaker",
    //   "Field Orphan ID Analysis"
    // );

    // Add fallback names for minified constructors (only active ones)
    this.observationMakerNames.set("v", "Field Debug JSON");
    this.observationMakerNames.set("g", "Field Counts");
    // No library observation maker fallbacks currently mapped
  }

  private getReadableMakerName(constructorName: string): string {
    return this.observationMakerNames.get(constructorName) || constructorName;
  }

  private fixCircularReferenceLogLevel(item: IObservationLogItem): ELogLevel {
    // Fix circular reference messages - they should be WARN, not ERROR
    if (
      item.logLevel === ELogLevel.ERROR &&
      (item.message?.toLowerCase().includes("circular") ||
        item.messageSecondary?.toLowerCase().includes("circular"))
    ) {
      return ELogLevel.WARN;
    }
    return item.logLevel;
  }

  private fixSubjectType(item: IObservationLogItem): EObservationSubjectType {
    // Fix subject type for summary/analysis messages
    if (
      item.subjectId === "analysis" ||
      item.messageSecondary?.includes("Analyzed") ||
      item.messageSecondary?.includes("analyzed") ||
      item.message?.includes("Analyzed") ||
      item.message?.includes("analyzed")
    ) {
      return EObservationSubjectType.FORM;
    }

    // If subjectId is numeric (field ID), it's field level
    if (item.subjectId && /^\d+$/.test(item.subjectId)) {
      return EObservationSubjectType.FIELD;
    }

    // Default to original value
    return item.subjectType;
  }

  async runAllObservations(
    formData: any,
    onAddFieldMessage?: (
      fieldId: string,
      message: string,
      errorLevel?: "error" | "warn" | "info" | "success",
      relatedFieldIds?: string[],
      fieldType?: string
    ) => void
  ): Promise<IObservationResult> {
    const allLogItems: IObservationLogItem[] = [];

    try {
      // Create proper form model using Models.FsModelForm
      const formModel = new Models.FsModelForm(formData);

      // Create logic trees for fields that have logic with error handling
      let logicTrees: Record<
        string,
        InstanceType<typeof TreeUtilities.FsFieldVisibilityGraph>
      > = {};
      try {
        logicTrees = createLogicTrees(formModel);
      } catch (error) {
        // Failed to create logic trees, continuing with empty logic trees
      }

      // Create observation context following the example pattern
      const resources = {
        formModel: formModel,
        formConfig: {
          formId: formData.id?.toString() || "unknown",
          // Add any other config properties as needed
        },
      };

      const context: IObservationContext = {
        resources,
        logicTrees,
      };

      // Run copied observation makers first

      for (const maker of this.copiedObservationMakers) {
        try {
          const result = await maker.makeObservation(context);

          // Convert result to proper log items format
          const logItems = this.convertToLogItems(
            result,
            this.getReadableMakerName(maker.constructor.name),
            formData
          );
          allLogItems.push(...logItems);
        } catch (error) {
          console.error(
            `FUCKING COPIED OBSERVATION MAKER ERROR - ${maker.constructor.name}:`,
            error
          );
          console.error(
            "Error stack:",
            error instanceof Error ? error.stack : "No stack"
          );
          // Add error log item
          allLogItems.push({
            subjectId: formData.id?.toString() || "unknown",
            logLevel: ELogLevel.ERROR,
            subjectType: EObservationSubjectType.FORM,
            observationClass: EObservationClass.ANALYSIS,
            observationMakerClass: this.getReadableMakerName(
              maker.constructor.name
            ),
            message: "Observation Maker Error",
            messageSecondary: `Error running ${this.getReadableMakerName(
              maker.constructor.name
            )}: ${error instanceof Error ? error.message : "Unknown error"}`,
            relatedEntityIds: [],
            isObservationTrue: true,
            additionalDetails: {
              error: error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
        }
      }

      // Run library observation makers
      for (const maker of this.libraryObservationMakers) {
        try {
          // Check if this is a field-level observation maker
          const requiredResources = maker.getRequiredResources();
          const isFieldLevelMaker = requiredResources.includes(
            EObservationResource.FIELD_MODEL
          );

          if (isFieldLevelMaker) {
            // Run the maker for each field
            const fieldIds = formModel.getFieldIds();
            for (const fieldId of fieldIds) {
              const field = formModel.getFieldModelById(fieldId);
              if (!field) continue;
              try {
                const fieldContext: IObservationContext = {
                  resources: {
                    ...context.resources,
                    fieldModel: field,
                  },
                  logicTrees,
                };

                const result = await maker.makeObservation(fieldContext);

                if (result && result.logItems) {
                  // Update observation maker class names to be readable and fix log levels
                  const updatedLogItems = result.logItems.map(
                    (item: IObservationLogItem) => ({
                      ...item,
                      observationMakerClass: this.getReadableMakerName(
                        item.observationMakerClass
                      ),
                      // Fix circular reference log levels from ERROR to WARN
                      logLevel: this.fixCircularReferenceLogLevel(item),
                      // Fix subject type for analysis summary messages
                      subjectType: this.fixSubjectType(item),
                    })
                  );
                  allLogItems.push(...updatedLogItems);
                }
              } catch (fieldError) {
                console.error(
                  `Field-level observation maker error for field ${field.fieldId}:`,
                  fieldError
                );
                // Add error log item for this field
                allLogItems.push({
                  subjectId: field.fieldId,
                  logLevel: ELogLevel.ERROR,
                  subjectType: EObservationSubjectType.FIELD,
                  observationClass: EObservationClass.ANALYSIS,
                  observationMakerClass: this.getReadableMakerName(
                    maker.constructor.name
                  ),
                  message: "Field Observation Maker Error",
                  messageSecondary: `Error running ${this.getReadableMakerName(
                    maker.constructor.name
                  )} for field ${field.fieldId}: ${
                    fieldError instanceof Error
                      ? fieldError.message
                      : "Unknown error"
                  }`,
                  relatedEntityIds: [],
                  additionalDetails: {
                    fieldId: field.fieldId,
                    error:
                      fieldError instanceof Error
                        ? fieldError.message
                        : String(fieldError),
                  },
                });
              }
            }
          } else {
            // Run form-level observation makers as before
            const result = await maker.makeObservation(context);

            // Library observation makers should return proper IObservationResult format
            if (result && result.logItems) {
              // Log calculation observation maker results specifically
              if (
                maker.constructor.name === "FieldCalculationObservationMaker" ||
                maker.constructor.name === "r"
              ) {
                console.log("=== FieldCalculationObservationMaker Results ===");
                console.log("Raw result:", result);
                console.log("Log items count:", result.logItems.length);
                result.logItems.forEach(
                  (item: IObservationLogItem, index: number) => {
                    console.log(`Calculation Item ${index + 1}:`, {
                      level: item.logLevel,
                      subject: item.subjectType,
                      subjectId: item.subjectId,
                      message: item.message,
                      secondary: item.messageSecondary,
                      maker: item.observationMakerClass,
                    });
                  }
                );
                console.log("=== End Calculation Results ===");
              }

              // Update observation maker class names to be readable and fix log levels
              const updatedLogItems = result.logItems.map(
                (item: IObservationLogItem) => ({
                  ...item,
                  observationMakerClass: this.getReadableMakerName(
                    item.observationMakerClass
                  ),
                  // Fix circular reference log levels from ERROR to WARN
                  logLevel: this.fixCircularReferenceLogLevel(item),
                  // Fix subject type for analysis summary messages
                  subjectType: this.fixSubjectType(item),
                })
              );
              allLogItems.push(...updatedLogItems);
            }
          }
        } catch (error) {
          console.error(
            `FUCKING LIBRARY OBSERVATION MAKER ERROR - ${maker.constructor.name}:`,
            error
          );
          console.error(
            "Error stack:",
            error instanceof Error ? error.stack : "No stack"
          );
          // Add error log item
          allLogItems.push({
            subjectId: formData.id?.toString() || "unknown",
            logLevel: ELogLevel.ERROR,
            subjectType: EObservationSubjectType.FORM,
            observationClass: EObservationClass.ANALYSIS,
            observationMakerClass: this.getReadableMakerName(
              maker.constructor.name
            ),
            message: "Library Observation Maker Error",
            messageSecondary: `Error running ${this.getReadableMakerName(
              maker.constructor.name
            )}: ${error instanceof Error ? error.message : "Unknown error"}`,
            relatedEntityIds: [],
            additionalDetails: {
              error: error instanceof Error ? error.message : String(error),
              stackTrace: error instanceof Error ? error.stack : undefined,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error in ObservationService.runAllObservations:", error);

      // Add general error log item
      allLogItems.push({
        subjectId: formData.id?.toString() || "unknown",
        logLevel: ELogLevel.ERROR,
        subjectType: EObservationSubjectType.FORM,
        observationClass: EObservationClass.ANALYSIS,
        observationMakerClass: "ObservationService",
        message: "Service Error",
        messageSecondary: `Error in observation service: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        relatedEntityIds: [],
        isObservationTrue: true,
        additionalDetails: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }

    // Auto-decorate form fields with observation messages
    if (onAddFieldMessage) {
      this.decorateFieldsWithMessages(allLogItems, onAddFieldMessage, formData);
    }

    return {
      logItems: allLogItems,
      isObservationTrue: allLogItems.some((item) => item.isObservationTrue),
    };
  }

  private convertToLogItems(
    result: any,
    observationMakerClass: string,
    formData: any
  ): IObservationLogItem[] {
    const logItems: IObservationLogItem[] = [];

    try {
      // Handle different result formats from our copied observation makers
      if (result && typeof result === "object") {
        // Handle the adapter result format we've been using
        if (result.success && result.details) {
          const details = result.details;

          // Convert main result to log item
          logItems.push({
            subjectId: formData.id?.toString() || "unknown",
            logLevel: this.determineLogLevel(result, details),
            subjectType: EObservationSubjectType.FORM,
            observationClass: this.determineObservationClass(
              observationMakerClass
            ),
            observationMakerClass,
            message: result.summary || "Observation completed",
            messageSecondary: this.generateDetailedMessage(result, details),
            relatedEntityIds: this.extractRelatedEntityIds(details),
            isObservationTrue: details.isObservationTrue || false,
            additionalDetails: {
              rawResult: result,
              formName: details.formName || formData.name || "Unknown Form",
              timestamp: details.timestamp || new Date().toISOString(),
            },
          });

          // Handle specific field-level issues if available
          if (details.messages && Array.isArray(details.messages)) {
            details.messages.forEach((message: string, index: number) => {
              const relatedFields = details.relatedEntities || [];
              const fieldId =
                relatedFields[index] || relatedFields[0] || "unknown";

              logItems.push({
                subjectId: fieldId,
                logLevel: ELogLevel.INFO,
                subjectType: EObservationSubjectType.FIELD,
                observationClass: this.determineObservationClass(
                  observationMakerClass
                ),
                observationMakerClass,
                message: "Field-specific observation",
                messageSecondary: message,
                relatedEntityIds: [fieldId],
                isObservationTrue: true,
                additionalDetails: {
                  fieldMessage: message,
                  messageIndex: index,
                },
              });
            });
          }
        }

        // Handle direct array of log items (if observation makers return this format)
        else if (Array.isArray(result)) {
          result.forEach((item: any) => {
            if (item && typeof item === "object") {
              logItems.push(this.normalizeLogItem(item, observationMakerClass));
            }
          });
        }

        // Handle object with logItems property
        else if (result.logItems && Array.isArray(result.logItems)) {
          result.logItems.forEach((item: any) => {
            logItems.push(this.normalizeLogItem(item, observationMakerClass));
          });
        }

        // Fallback: create a single log item from the result
        else {
          logItems.push({
            subjectId: formData.id?.toString() || "unknown",
            logLevel: ELogLevel.INFO,
            subjectType: EObservationSubjectType.FORM,
            observationClass: this.determineObservationClass(
              observationMakerClass
            ),
            observationMakerClass,
            message: "Observation completed",
            messageSecondary: JSON.stringify(result),
            relatedEntityIds: [],
            isObservationTrue: true,
            additionalDetails: { rawResult: result },
          });
        }
      }
    } catch (error) {
      console.error(
        `Error converting result to log items for ${observationMakerClass}:`,
        error
      );

      // Add error log item
      logItems.push({
        subjectId: formData.id?.toString() || "unknown",
        logLevel: ELogLevel.ERROR,
        subjectType: EObservationSubjectType.FORM,
        observationClass: EObservationClass.ANALYSIS,
        observationMakerClass,
        message: "Result Conversion Error",
        messageSecondary: `Error converting result to log items: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        relatedEntityIds: [],
        isObservationTrue: true,
        additionalDetails: {
          conversionError:
            error instanceof Error ? error.message : String(error),
          rawResult: result,
        },
      });
    }

    return logItems;
  }

  private normalizeLogItem(
    item: any,
    observationMakerClass: string
  ): IObservationLogItem {
    return {
      subjectId: item.subjectId || item.fieldId || "unknown",
      logLevel: item.logLevel || ELogLevel.INFO,
      subjectType: item.subjectType || EObservationSubjectType.FORM,
      observationClass:
        item.observationClass ||
        this.determineObservationClass(observationMakerClass),
      observationMakerClass:
        item.observationMakerClass || observationMakerClass,
      message: item.message || "Observation",
      messageSecondary: item.messageSecondary || item.details || "",
      relatedEntityIds: item.relatedEntityIds || [],
      parentObserver: item.parentObserver,
      isObservationTrue:
        item.isObservationTrue !== undefined ? item.isObservationTrue : true,
      additionalDetails: item.additionalDetails || item,
    };
  }

  private determineLogLevel(result: any, details: any): ELogLevel {
    // Determine log level based on result content
    if (details.errors || result.summary?.toLowerCase().includes("error")) {
      return ELogLevel.ERROR;
    }
    if (details.warnings || result.summary?.toLowerCase().includes("warn")) {
      return ELogLevel.WARN;
    }
    if (details.isObservationTrue || details.logItemCount > 0) {
      return ELogLevel.INFO;
    }
    return ELogLevel.DEBUG;
  }

  private determineObservationClass(
    observationMakerClass: string
  ): EObservationClass {
    // Map observation maker class names to observation classes
    const className = observationMakerClass.toLowerCase();

    if (className.includes("calculation")) {
      return EObservationClass.CALCULATION;
    }
    if (className.includes("logic")) {
      return EObservationClass.LOGIC;
    }
    if (className.includes("validation")) {
      return EObservationClass.VALIDATION;
    }
    if (className.includes("label")) {
      return EObservationClass.LABEL;
    }
    if (className.includes("config")) {
      return EObservationClass.CONFIGURATION;
    }

    return EObservationClass.ANALYSIS;
  }

  private generateDetailedMessage(result: any, details: any): string {
    const parts: string[] = [];

    if (details.isObservationTrue) {
      parts.push("Observations found");
    } else {
      parts.push("No issues detected");
    }

    if (details.logItemCount !== undefined) {
      parts.push(`${details.logItemCount} log items`);
    }

    if (details.messages && details.messages.length > 0) {
      parts.push(`${details.messages.length} field messages`);
    }

    if (details.relatedEntities && details.relatedEntities.length > 0) {
      parts.push(`affecting ${details.relatedEntities.length} fields`);
    }

    return parts.join(", ");
  }

  private extractRelatedEntityIds(details: any): string[] {
    const entityIds: string[] = [];

    if (details.relatedEntities && Array.isArray(details.relatedEntities)) {
      entityIds.push(
        ...details.relatedEntities.map((id: any) => id.toString())
      );
    }

    if (details.fieldIds && Array.isArray(details.fieldIds)) {
      entityIds.push(...details.fieldIds.map((id: any) => id.toString()));
    }

    return Array.from(new Set(entityIds)); // Remove duplicates
  }

  private decorateFieldsWithMessages(
    logItems: IObservationLogItem[],
    onAddFieldMessage: (
      fieldId: string,
      message: string,
      errorLevel?: "error" | "warn" | "info" | "success",
      relatedFieldIds?: string[],
      fieldType?: string
    ) => void,
    formData: any
  ): void {
    // Filter log items that are field-specific or have related entities
    const fieldLogItems = logItems.filter(
      (item) =>
        item.subjectType === EObservationSubjectType.FIELD ||
        (item.relatedEntityIds && item.relatedEntityIds.length > 0)
    );

    fieldLogItems.forEach((logItem, index) => {
      try {
        // Determine which fields to message
        const fieldsToMessage = new Set<string>();

        // If the log item is about a specific field, add that field
        if (
          logItem.subjectType === EObservationSubjectType.FIELD &&
          logItem.subjectId
        ) {
          fieldsToMessage.add(logItem.subjectId);
        }

        // Add all related entity IDs
        if (logItem.relatedEntityIds) {
          logItem.relatedEntityIds.forEach((fieldId) =>
            fieldsToMessage.add(fieldId)
          );
        }

        // Convert ELogLevel to our field message format
        const errorLevel = this.convertLogLevelToFieldLevel(logItem.logLevel);

        // Create field message content
        const fieldMessage = this.createFieldMessageContent(logItem);

        // Find field type for better context
        const getFieldType = (fieldId: string): string => {
          const field = formData.fields?.find(
            (f: any) => f.id?.toString() === fieldId
          );
          return field?.type || "unknown";
        };

        // Send messages to all relevant fields
        fieldsToMessage.forEach((fieldId) => {
          const fieldType = getFieldType(fieldId);
          const relatedFieldIds = Array.from(fieldsToMessage).filter(
            (id) => id !== fieldId
          );

          onAddFieldMessage(
            fieldId,
            fieldMessage,
            errorLevel,
            relatedFieldIds,
            fieldType
          );
        });
      } catch (error) {
        console.error(`Error decorating field for log item ${index}:`, error);
      }
    });
  }

  private convertLogLevelToFieldLevel(
    logLevel: ELogLevel
  ): "error" | "warn" | "info" | "success" {
    switch (logLevel) {
      case ELogLevel.ERROR:
        return "error";
      case ELogLevel.WARN:
        return "warn";
      case ELogLevel.INFO:
        return "info";
      case ELogLevel.DEBUG:
        return "info";
      default:
        return "info";
    }
  }

  private createFieldMessageContent(logItem: IObservationLogItem): string {
    // For debug JSON messages, show the full JSON content directly
    if (logItem.observationMakerClass === "FieldDebugJsonObservationMaker") {
      // Return the full JSON message directly (no brackets or maker name)
      return logItem.messageSecondary || logItem.message;
    }

    // Create a comprehensive but concise message for other observation types
    const parts: string[] = [];

    // Add the observation class as context (but not for debug messages)
    parts.push(`[${logItem.observationClass}]`);

    // Use the secondary message if available, otherwise primary
    const mainMessage = logItem.messageSecondary || logItem.message;
    if (mainMessage) {
      parts.push(mainMessage);
    }

    // Add maker attribution for debugging
    if (logItem.observationMakerClass) {
      parts.push(`(${logItem.observationMakerClass})`);
    }

    return parts.join(" ");
  }

  // Get available observation makers
  getAvailableObservationMakers(): string[] {
    return [
      ...this.copiedObservationMakers.map((maker) => maker.constructor.name),
      ...this.libraryObservationMakers.map((maker) => maker.constructor.name),
    ];
  }

  // Run a specific observation maker
  async runSpecificObservation(
    observationMakerName: string,
    formData: any,
    onAddFieldMessage?: (
      fieldId: string,
      message: string,
      errorLevel?: "error" | "warn" | "info" | "success",
      relatedFieldIds?: string[],
      fieldType?: string
    ) => void
  ): Promise<IObservationResult> {
    const allMakers = [
      ...this.copiedObservationMakers,
      ...this.libraryObservationMakers,
    ];
    const maker = allMakers.find(
      (m) => m.constructor.name === observationMakerName
    );

    if (!maker) {
      throw new Error(`Observation maker ${observationMakerName} not found`);
    }

    // Create proper form model
    const formModel = new Models.FsModelForm(formData);
    const logicTrees = createLogicTrees(formModel);

    const context: IObservationContext = {
      resources: {
        formModel: formModel,
        formConfig: {
          formId: formData.id?.toString() || "unknown",
        },
      },
      logicTrees,
    };

    const result = await maker.makeObservation(context);

    let logItems: IObservationLogItem[];

    if (this.libraryObservationMakers.includes(maker)) {
      // Library makers return proper format
      logItems = result.logItems || [];
    } else {
      // Copied makers need conversion
      logItems = this.convertToLogItems(result, observationMakerName, formData);
    }

    // Auto-decorate form fields with observation messages
    if (onAddFieldMessage) {
      this.decorateFieldsWithMessages(logItems, onAddFieldMessage, formData);
    }

    return {
      logItems,
      isObservationTrue: logItems.some((item) => item.isObservationTrue),
    };
  }

  /**
   * Filter and decorate form fields with observation messages based on active filters
   */
  decorateFieldsWithFilteredMessages(
    logItems: IObservationLogItem[],
    onAddFieldMessage: (
      fieldId: string,
      message: string,
      errorLevel?: "error" | "warn" | "info" | "success",
      relatedFieldIds?: string[],
      fieldType?: string
    ) => void,
    formData: any,
    filter: {
      logLevel: string;
      subjectType: string;
      observationClass: string;
      observationMaker: string;
    }
  ): void {
    // Filter log items based on the provided filter
    const filteredLogItems = logItems.filter((item) => {
      if (filter.logLevel !== "ALL" && item.logLevel !== filter.logLevel)
        return false;
      if (
        filter.subjectType !== "ALL" &&
        item.subjectType !== filter.subjectType
      )
        return false;
      if (
        filter.observationClass !== "ALL" &&
        item.observationClass !== filter.observationClass
      )
        return false;
      if (
        filter.observationMaker !== "ALL" &&
        item.observationMakerClass !== filter.observationMaker
      )
        return false;
      return true;
    });

    // Apply the filtered messages to form fields
    this.decorateFieldsWithMessages(
      filteredLogItems,
      onAddFieldMessage,
      formData
    );
  }
}
