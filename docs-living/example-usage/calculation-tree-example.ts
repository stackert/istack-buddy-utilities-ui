import { Models, TreeUtilities } from "../../dist";
import * as formJson6221310 from "../../test-data/form-json/6221310.json";

// Create form model from test data
const formModel = new Models.FsModelForm(formJson6221310, {
  fieldModelVersion: "v2",
});

// Create calculation systems for the entire form
const calculationSystems =
  TreeUtilities.transformers.transformToCalculationSystems(formModel);

// For each field in each system, create D3 graph nodes
Object.entries(calculationSystems).forEach(([systemKey, systemFields]) => {
  console.log(`\n=== System: ${systemKey} ===`);

  systemFields.forEach((field) => {
    console.log(`\n--- Field: ${field.fieldId} (${field.label}) ---`);

    // Create calculation tree for this field
    const calculationTree = TreeUtilities.FsCalculationGraphDeep.fromFormModel(
      field.fieldId,
      formModel
    );

    // Convert to POJO (Plain Old JavaScript Object) for visualization
    const treePojo = calculationTree.toPojoAt();

    console.log("Calculation Tree POJO:", JSON.stringify(treePojo, null, 2));
  });
});

// Finally, log all calculation systems
console.log("\n=== ALL CALCULATION SYSTEMS ===");
console.log(JSON.stringify(calculationSystems, null, 2));
