// Adapter wrappers for external ObservationMakers
import { IObservationMaker } from "@/observationMakers/index";

// Import the external ObservationMakers
import { ObservationMakerFieldCounts } from "./ObservationMakerFieldCounts";
import { ObservationMakerCalculationValidation } from "./ObservationMakerCalculationValidation";
import { ObservationMakerLogicValidation } from "./ObservationMakerLogicValidation";

// Simple form model adapter to convert JSON form data to the expected interface
class SimpleFormModelAdapter {
  private formData: any;
  private fieldIds: string[];

  constructor(formData: any) {
    this.formData = formData;
    this.fieldIds = this.extractFieldIds(formData);
  }

  private extractFieldIds(formData: any): string[] {
    // Extract field IDs from the form's fields array
    if (formData?.fields && Array.isArray(formData.fields)) {
      return formData.fields
        .map((field: any) => field.id || field.name || "")
        .filter(Boolean);
    }
    return [];
  }

  getFieldIds(): string[] {
    return this.fieldIds;
  }

  getFieldModelByIdOrThrow(fieldId: string): any {
    const field = this.formData?.fields?.find(
      (f: any) => f.id === fieldId || f.name === fieldId
    );
    if (!field) {
      throw new Error(`Field with id ${fieldId} not found`);
    }

    // Create a simple field model adapter
    return {
      getFieldType: () => field.type || "text",
      getCalculationString: () => field.calculation || "",
      getLogicString: () => (field.logic ? JSON.stringify(field.logic) : ""),
      getLabel: () => field.label || "",
      getName: () => field.name || "",
      getId: () => field.id || "",
      getFieldData: () => field,
    };
  }

  // Additional methods that might be needed
  getName(): string {
    return this.formData?.name || "Unknown Form";
  }

  getId(): string {
    return this.formData?.id || "unknown";
  }

  get formId(): string {
    return this.getId();
  }
}

// Create a simple observation context adapter
class SimpleObservationContextAdapter {
  public resources: any;

  constructor(formData: any) {
    this.resources = {
      formModel: new SimpleFormModelAdapter(formData),
    };
  }
}

// Base adapter class for external ObservationMakers
abstract class ExternalObservationMakerAdapter implements IObservationMaker {
  protected externalMaker: any;

  constructor(externalMaker: any) {
    this.externalMaker = externalMaker;
  }

  abstract get name(): string;
  abstract get description(): string;

  getRequiredResources(): string[] {
    if (
      this.externalMaker &&
      typeof this.externalMaker.getRequiredResources === "function"
    ) {
      return this.externalMaker.getRequiredResources();
    }
    return ["formModel"];
  }

  async makeObservation(formData: any, resources?: any): Promise<any> {
    try {
      // Create a context adapter
      const context = new SimpleObservationContextAdapter(formData);

      // Call the external maker with the adapted context
      const result = await this.externalMaker.makeObservation(context);

      // Transform the result to our expected format
      return this.transformResult(result, formData);
    } catch (error) {
      console.error(`Error in ${this.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: null,
      };
    }
  }

  protected transformResult(result: any, formData: any): any {
    // Transform the structured result into our simple format
    const logItems = result?.logItems || [];
    const isObservationTrue = result?.isObservationTrue || false;

    // Extract meaningful information from log items
    const messages = logItems
      .map((item: any) => item?.messageSecondary || item?.message || "")
      .filter(Boolean);
    const relatedEntities = logItems.reduce((acc: string[], item: any) => {
      if (item?.relatedEntityIds && Array.isArray(item.relatedEntityIds)) {
        acc.push(...item.relatedEntityIds);
      }
      return acc;
    }, []);

    return {
      success: true,
      summary: `${this.name} completed - ${
        isObservationTrue ? "Observations found" : "No issues detected"
      }`,
      details: {
        isObservationTrue,
        logItemCount: logItems.length,
        messages,
        relatedEntities: Array.from(new Set(relatedEntities)), // Remove duplicates
        rawResult: result,
      },
      formName: formData?.name || "Unknown Form",
      formId: formData?.id || "unknown",
      timestamp: new Date().toISOString(),
    };
  }
}

// Specific adapter implementations
export class FieldCountsObservationMakerAdapter extends ExternalObservationMakerAdapter {
  constructor() {
    super(new ObservationMakerFieldCounts());
  }

  get name(): string {
    return "Field Counts Analysis";
  }

  get description(): string {
    return "Analyzes field types, counts, and form structure metrics";
  }
}

export class CalculationValidationObservationMakerAdapter extends ExternalObservationMakerAdapter {
  constructor() {
    super(new ObservationMakerCalculationValidation());
  }

  get name(): string {
    return "Calculation Validation";
  }

  get description(): string {
    return "Validates field calculations for errors and consistency";
  }
}

export class LogicValidationObservationMakerAdapter extends ExternalObservationMakerAdapter {
  constructor() {
    super(new ObservationMakerLogicValidation());
  }

  get name(): string {
    return "Logic Validation";
  }

  get description(): string {
    return "Validates field logic rules and dependencies";
  }
}
