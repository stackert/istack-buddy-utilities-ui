# ObservationMakers System - Developer Guide

## Overview

The ObservationMakers system provides a flexible, extensible framework for analyzing form configurations and detecting issues across various aspects: fields, calculations, logic, configurations, and more. It uses a structured logging approach to categorize and report findings with different severity levels.

**Key Features:**

- **Extensible Type System**: TypeScript generics with constraints allow custom subject types and observation classes
- **Composite Pattern**: Orchestrate multiple specialized makers for comprehensive analysis
- **Structured Logging**: Consistent metadata with log levels (DEBUG, INFO, WARN, ERROR)
- **Resource-Based Context**: Declarative resource requirements with graceful degradation
- **Rich Filtering API**: Built-in methods for filtering and analyzing results

## Core Architecture

### AbstractObservationMaker Base Class

All observation makers extend `AbstractObservationMaker` with optional generic type parameters:

```typescript
abstract class AbstractObservationMaker<
  TSubjectType extends string = EObservationSubjectType,
  TObservationClass extends string = EObservationClass
> implements IObservationMaker<TSubjectType, TObservationClass>
```

**Required Properties:**

- `messagePrimary`: Fixed descriptive message for this maker
- `subjectType`: The type of entity being analyzed (field, form, etc.)
- `observationClassName`: Category of analysis being performed

**Required Methods:**

- `getRequiredResources()`: Declare required resources
- `makeObservation(context)`: Perform the actual analysis

### Resource-Based Context Pattern

Observation makers declare their resource requirements and receive them through a context object:

```typescript
interface IObservationContext {
  resources: Record<string, any>; // Required data models
  logicTrees?: Record<string, FsFieldVisibilityGraph>; // Optional pre-computed trees
  parentObserver?: string; // For nested observations
}
```

**Common Resources:**

- `formModel`: Form data model (FsModelForm)
- `fieldModel`: Individual field model (IFsModelField)
- `logicSystem`: Pre-computed logic systems for optimization

### Structured Log Items

All observations produce consistent log items with rich metadata:

```typescript
interface IObservationLogItem {
  subjectId: string; // fieldId, formId, etc.
  logLevel: ELogLevel; // DEBUG | INFO | WARN | ERROR
  subjectType: TSubjectType; // Extensible subject type
  observationClassName: TObservationClass; // Extensible observation class
  observationMakerClass: string; // Class name for identification
  message: string; // Primary descriptive message
  messageSecondary: string; // Detailed/specific information
  relatedEntityIds: string[]; // Related field IDs or entities
  parentObserver?: string; // Parent observation maker (if nested)
  isObservationTrue: boolean; // Whether observation condition is met
  additionalDetails?: object; // Extra context data
}
```

## Log Levels

- **`ERROR`**: Critical issues that prevent reliable functioning
  - Example: Form references non-existent fields, calculation errors that break functionality
- **`WARN`**: Potential issues that could lead to problems
  - Example: Duplicate field labels, circular references
- **`INFO`**: Informational observations, 'nice to know' details
  - Example: Field counts, calculation statistics, analysis summaries
- **`DEBUG`**: Extra details for troubleshooting
  - Example: Full JSON descriptions, detailed state information

## Extensible Type System

### Baseline Enums

The system provides baseline types that can be extended:

```typescript
enum EObservationSubjectType {
  FORM = "form",
  FIELD = "field",
  SUBMIT_ACTION = "submitAction",
  EMAIL_NOTIFICATION = "emailNotification",
  EMAIL_CONFIRMATION = "emailConfirmation",
  WEBHOOK = "webhook",
}

enum EObservationClass {
  FieldCalculationObservationMaker = "FieldCalculationObservationMaker",
  FieldLogicObservationMaker = "FieldLogicObservationMaker",
  CompositeFormCalculationObservationMaker = "CompositeFormCalculationObservationMaker",
}
```

### Extending Types

You can extend the type system for custom implementations:

```typescript
// Define custom subject types
enum EMyCustomSubjectType {
  FORM = "form", // Include baseline types
  FIELD = "field",
  CUSTOM_WIDGET = "customWidget", // Add custom types
  REPORT_TEMPLATE = "reportTemplate",
}

// Define custom observation classes
enum EMyCustomObservationClass {
  FieldCalculationObservationMaker = "FieldCalculationObservationMaker", // Include baseline
  SECURITY = "security", // Add custom classes
  PERFORMANCE = "performance",
}

// Create custom observation maker
export class CustomWidgetObservationMaker extends AbstractObservationMaker<
  EMyCustomSubjectType,
  EMyCustomObservationClass
> {
  protected messagePrimary: string = "Custom Widget Validation";
  protected subjectType: EMyCustomSubjectType =
    EMyCustomSubjectType.CUSTOM_WIDGET;
  protected observationClassName: EMyCustomObservationClass =
    EMyCustomObservationClass.SECURITY;

  getRequiredResources(): EObservationResource[] {
    return [EObservationResource.FORM_MODEL, "widgetRegistry"];
  }

  async makeObservation(
    context: IObservationContext
  ): Promise<IObservationResult> {
    // Implementation
  }
}
```

## Built-in Observation Makers

### Field-Level Makers

#### FieldCalculationObservationMaker

Analyzes field calculations for validity and detects issues.

**Purpose**: Validates calculation expressions, detects circular dependencies, identifies malformed calculations.

**Required Resources**: `fieldModel`

**Example Usage**:

```typescript
const maker = new FieldCalculationObservationMaker();
const context: IObservationContext = {
  resources: { fieldModel: myFieldModel },
};
const result = await maker.makeObservation(context);
```

#### FieldLogicObservationMaker

Examines field visibility logic structure and validates logical coherence.

**Purpose**: Analyzes field visibility logic, detects circular references, validates field references.

**Required Resources**: `fieldModel`, `formModel`

**Example Usage**:

```typescript
const maker = new FieldLogicObservationMaker();
const context: IObservationContext = {
  resources: {
    fieldModel: myFieldModel,
    formModel: myFormModel,
    logicSystem: preComputedLogicSystems,
  },
};
const result = await maker.makeObservation(context);
```

#### FieldConfigurationObservationMaker

Analyzes field configuration settings and completeness.

**Purpose**: Validates field settings, detects configuration issues, ensures completeness.

**Required Resources**: `fieldModel`

#### FieldOrphanFieldIdObservationMaker

Detects orphaned field references and invalid field IDs.

**Purpose**: Identifies references to non-existent fields, validates field ID integrity.

**Required Resources**: `fieldModel`, `formModel`

### Form-Level Makers

#### CompositeFormCalculationObservationMaker

Orchestrates calculation and logic analysis across all fields with form-level summaries.

**Purpose**: Comprehensive form analysis, circular reference detection, statistical summaries.

**Required Resources**: `formModel`, `logicSystem`

**Key Features**:

- Analyzes all fields for calculations and logic
- Detects circular references at form level
- Provides statistical summaries
- Aggregates results from field-level makers

**Example Usage**:

```typescript
const maker = new CompositeFormCalculationObservationMaker();
const context: IObservationContext = {
  resources: {
    formModel: myFormModel,
    logicSystem: transformToLogicSystems(myFormModel),
  },
};
const result = await maker.makeObservation(context);

// Filter results
const calculationErrors = maker.filterBy({
  observationClassName: EObservationClass.FieldCalculationObservationMaker,
  logLevel: ELogLevel.WARN,
});

const formSummary = maker.filterBy({
  subjectType: EObservationSubjectType.FORM,
});
```

#### CompositeFormConfigurationObservationMaker

Analyzes overall form configuration and settings.

**Purpose**: Form-level configuration validation, completeness checks, settings analysis.

**Required Resources**: `formModel`

#### CompositeFormLogicObservationMaker

Comprehensive logic analysis across all fields.

**Purpose**: Form-wide logic validation, circular reference detection, logic system analysis.

**Required Resources**: `formModel`, `logicSystem`

#### CompositeFormOrphanFieldIdObservationMaker

Detects orphaned field references across the entire form.

**Purpose**: Form-wide field reference validation, orphan detection, integrity checks.

**Required Resources**: `formModel`

## Composite Pattern

The composite pattern allows orchestrating multiple specialized makers for comprehensive analysis:

### Creating Composite Makers

```typescript
export class CompositeFormCalculationObservationMaker extends AbstractObservationMaker {
  private fieldCalculationMaker: FieldCalculationObservationMaker;
  private fieldLogicMaker: FieldLogicObservationMaker;

  constructor() {
    super();
    this.fieldCalculationMaker = new FieldCalculationObservationMaker();
    this.fieldLogicMaker = new FieldLogicObservationMaker();
  }

  async makeObservation(
    context: IObservationContext
  ): Promise<IObservationResult> {
    const formModel = context.resources.formModel as FsModelForm;

    // Analyze each field
    for (const fieldId of formModel.getFieldIds()) {
      const field = formModel.getFieldModelById(fieldId);
      if (!field) continue;

      // Create field-specific context
      const fieldContext: IObservationContext = {
        resources: { fieldModel: field },
        parentObserver: this.getObservationMakerClassName(),
      };

      // Run field analysis
      const fieldResult = await this.fieldCalculationMaker.makeObservation(
        fieldContext
      );
      this.logItems.push(...fieldResult.logItems);
    }

    // Add form-level summary
    this.logItems.push(
      this.createInfoLogItem(context, {
        subjectId: formModel.formId,
        messageSecondary: `Form analysis complete: ${
          formModel.getFieldIds().length
        } fields analyzed`,
        additionalDetails: {
          totalFieldsAnalyzed: formModel.getFieldIds().length,
          analysisType: "form_calculation_summary",
        },
      })
    );

    return { logItems: this.getLogItems() };
  }
}
```

## Rich API for Result Analysis

### Filtering Methods

```typescript
// Filter by various criteria
const errors = maker.filterBy({ logLevel: ELogLevel.ERROR });
const fieldIssues = maker.filterBy({
  subjectType: EObservationSubjectType.FIELD,
});
const calculationProblems = maker.filterBy({
  observationClassName: EObservationClass.FieldCalculationObservationMaker,
});

// Filter by log level
const warnings = maker.filterByLogLevel(ELogLevel.WARN);

// Get counts
const errorCount = maker.getCountBy({ logLevel: ELogLevel.ERROR });

// Get unique messages
const uniqueMessages = maker.getUniquePrimaryMessages();
```

### Log Item Creation

The base class provides convenient methods for creating log items:

```typescript
// Create different log levels
this.createDebugLogItem(context, {
  subjectId: fieldId,
  messageSecondary: "Detailed debug information",
});

this.createInfoLogItem(context, {
  subjectId: fieldId,
  messageSecondary: "Informational observation",
  additionalDetails: { analysisType: "field_analysis" },
});

this.createWarnLogItem(context, {
  subjectId: fieldId,
  messageSecondary: "Potential issue detected",
  relatedEntityIds: [relatedFieldId],
});

this.createErrorLogItem(context, {
  subjectId: fieldId,
  messageSecondary: "Critical error found",
  additionalDetails: { errorType: "calculation_error" },
});
```

## Usage Patterns

### Basic Field Analysis

```typescript
import { FieldCalculationObservationMaker } from "./FieldCalculationObservationMaker";
import { FsModelForm } from "../lib-tree/models";

// Setup
const formModel = new FsModelForm(formData);
const maker = new FieldCalculationObservationMaker();

// Analyze specific field
const field = formModel.getFieldModelById("field123");
const context: IObservationContext = {
  resources: { fieldModel: field },
};

const result = await maker.makeObservation(context);

// Process results
result.logItems.forEach((item) => {
  console.log(`[${item.logLevel}] ${item.message}: ${item.messageSecondary}`);
});
```

### Comprehensive Form Analysis

```typescript
import { CompositeFormCalculationObservationMaker } from "./CompositeFormCalculationObservationMaker";
import { transformToLogicSystems } from "../lib-tree/tree-systems";

// Setup
const formModel = new FsModelForm(formData);
const logicSystems = transformToLogicSystems(formModel);
const maker = new CompositeFormCalculationObservationMaker();

// Run comprehensive analysis
const context: IObservationContext = {
  resources: {
    formModel: formModel,
    logicSystem: logicSystems,
  },
};

const result = await maker.makeObservation(context);

// Analyze results
const criticalIssues = maker.filterBy({
  logLevel: ELogLevel.ERROR,
});

const calculationWarnings = maker.filterBy({
  observationClassName: EObservationClass.FieldCalculationObservationMaker,
  logLevel: ELogLevel.WARN,
});

const formSummary = maker.filterBy({
  subjectType: EObservationSubjectType.FORM,
});

// Generate report
const report = {
  totalObservations: result.logItems.length,
  criticalIssues: criticalIssues.length,
  calculationWarnings: calculationWarnings.length,
  fieldsWithIssues: new Set(criticalIssues.map((item) => item.subjectId)).size,
};
```

### Custom Observation Maker

```typescript
export class CustomFieldValidationMaker extends AbstractObservationMaker {
  protected messagePrimary: string = "Custom Field Validation";
  protected subjectType: EObservationSubjectType =
    EObservationSubjectType.FIELD;
  protected observationClassName: EObservationClass =
    EObservationClass.FieldCalculationObservationMaker;

  static readonly observationMakerClassName: string =
    "CustomFieldValidationMaker";

  getRequiredResources(): EObservationResource[] {
    return [EObservationResource.FIELD_MODEL];
  }

  async makeObservation(
    context: IObservationContext
  ): Promise<IObservationResult> {
    const fieldModel = context.resources.fieldModel as IFsModelField;
    const logItems: IObservationLogItem[] = [];

    // Custom validation logic
    const fieldType = fieldModel.getFieldType();
    if (fieldType === "text" && fieldModel.getCalculationString()) {
      logItems.push(
        this.createWarnLogItem(context, {
          subjectId: fieldModel.fieldId,
          messageSecondary: `Text field '${fieldModel.fieldId}' has a calculation configured`,
          additionalDetails: {
            fieldType: fieldType,
            calculationString: fieldModel.getCalculationString(),
          },
        })
      );
    }

    return { logItems };
  }
}
```

## Best Practices

### 1. Resource Declaration

Always declare required resources explicitly:

```typescript
getRequiredResources(): EObservationResource[] {
  return [EObservationResource.FIELD_MODEL, EObservationResource.FORM_MODEL];
}
```

### 2. Graceful Degradation

Handle missing optional resources gracefully:

```typescript
const logicSystem = context.resources.logicSystem;
if (logicSystem) {
  // Use pre-computed logic for optimization
} else {
  // Fall back to on-demand computation
}
```

### 3. Specific Messages

Use `messageSecondary` for detailed, actionable information:

```typescript
this.createWarnLogItem(context, {
  subjectId: fieldId,
  messageSecondary: `Field '${fieldId}' references non-existent field '${invalidFieldId}'`,
});
```

### 4. Related Entities

Include `relatedEntityIds` for cross-references:

```typescript
this.createErrorLogItem(context, {
  subjectId: fieldId,
  messageSecondary: "Circular reference detected",
  relatedEntityIds: [dependentField1, dependentField2],
});
```

### 5. Appropriate Log Levels

- Use `ERROR` sparingly, only for true blockers
- Use `WARN` for potential issues that could cause problems
- Use `INFO` for positive findings and summaries
- Use `DEBUG` for troubleshooting details

### 6. Performance Awareness

Design for large forms with many fields:

```typescript
// Pre-compute expensive resources
const logicSystems = transformToLogicSystems(formModel);
const context: IObservationContext = {
  resources: { formModel, logicSystem: logicSystems },
};
```

### 7. Type Safety

Use generic constraints when extending types:

```typescript
export class CustomMaker extends AbstractObservationMaker<
  MyCustomSubjectType,
  MyCustomObservationClass
> {
  // Full type safety with custom types
}
```

### 8. Naming Conventions

Use clear, descriptive names for custom types:

```typescript
// Good
enum EMyAppSubjectType {
  FORM = "form",
  FIELD = "field",
  USER_ROLE = "userRole",
  INTEGRATION_ENDPOINT = "integrationEndpoint",
}

// Avoid
enum EUnclearType {
  THING1 = "thing1",
  STUFF = "stuff",
}
```

## Error Handling

Observation makers should handle errors gracefully and provide meaningful error messages:

```typescript
async makeObservation(context: IObservationContext): Promise<IObservationResult> {
  const logItems: IObservationLogItem[] = [];

  try {
    // Analysis logic
  } catch (error) {
    logItems.push(
      this.createErrorLogItem(context, {
        subjectId: fieldModel.fieldId,
        messageSecondary: `Error analyzing field: ${error}`,
        additionalDetails: {
          errorType: "field_analysis_error",
          error: String(error)
        }
      })
    );
  }

  return { logItems };
}
```

## Future Extensions

The system is designed to be extensible for future needs:

### Planned Makers

- `SubmitActionObservationMaker`: Validate submit action configurations
- `EmailNotificationObservationMaker`: Analyze notification email logic
- `EmailConfirmationObservationMaker`: Validate confirmation email setup
- `WebhookObservationMaker`: Examine webhook configurations
- `FormValidationObservationMaker`: Comprehensive form-level validation

### Integration Context

Future context structure for complete analysis:

```typescript
interface IDebugFormSessionContext extends IObservationContext {
  resources: {
    formModel: FsModelForm;
    formConfig?: FormConfig;
    submitActions?: Record<string, SubmitActionModel>;
    emailsConfirmation?: Record<string, EmailModel>;
    emailsNotification?: Record<string, EmailModel>;
    webhooks?: Record<string, WebhookModel>;
  };
  calculationTrees?: Record<string, CalcTree>;
  logicTrees?: Record<string, LogicTree>;
  sumoLogMessages?: LogMessage[]; // For runtime validation
}
```

The ObservationMakers system provides a robust foundation for form analysis and validation, with extensibility for custom requirements and comprehensive tooling for result analysis and reporting.
