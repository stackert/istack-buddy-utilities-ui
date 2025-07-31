// Registry for custom observation makers
import { registerCustomObservationMaker } from "./index";
import { SimpleFormSummaryMaker } from "./custom/SimpleFormSummaryMaker";

// Import external ObservationMaker adapters
import {
  FieldCountsObservationMakerAdapter,
  CalculationValidationObservationMakerAdapter,
  LogicValidationObservationMakerAdapter,
} from "@/components/ObservationMakers/ObservationMakerAdapters";

// Initialize and register all custom observation makers

// Register the Simple Form Summary Maker
const simpleFormSummaryMaker = new SimpleFormSummaryMaker();
registerCustomObservationMaker("simple-form-summary", simpleFormSummaryMaker);

// Register external ObservationMaker adapters

const fieldCountsAdapter = new FieldCountsObservationMakerAdapter();
registerCustomObservationMaker("external-field-counts", fieldCountsAdapter);

const calculationValidationAdapter =
  new CalculationValidationObservationMakerAdapter();
registerCustomObservationMaker(
  "external-calculation-validation",
  calculationValidationAdapter
);

const logicValidationAdapter = new LogicValidationObservationMakerAdapter();
registerCustomObservationMaker(
  "external-logic-validation",
  logicValidationAdapter
);
