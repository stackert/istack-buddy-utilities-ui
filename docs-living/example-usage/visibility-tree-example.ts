import { Models, TreeUtilities } from "../../dist";
import * as formJson5375703 from "../../test-data/form-json/5375703.json";

// Create form model from test data
const formModel = new Models.FsModelForm(formJson5375703, {
  fieldModelVersion: "v2",
});

// Create logic systems for the entire form
const logicSystems =
  TreeUtilities.transformers.transformToLogicSystems(formModel);

// For each field in each system, create D3 graph nodes
Object.entries(logicSystems).forEach(([systemKey, systemFields]) => {
  console.log(`\n=== System: ${systemKey} ===`);

  systemFields.forEach((field) => {
    console.log(`\n--- Field: ${field.fieldId} (${field.label}) ---`);

    // Create visibility tree for this field
    const visibilityTree = TreeUtilities.FsFieldVisibilityGraph.fromFormModel(
      field.fieldId,
      formModel
    );

    // Convert to D3 hierarchy graph nodes
    const d3Nodes =
      TreeUtilities.transformers.toD3HierarchyGraphNodes(visibilityTree);

    console.log("D3 Graph Nodes:", JSON.stringify(d3Nodes, null, 2));
  });
});

// Finally, log all logic systems
console.log("\n=== ALL LOGIC SYSTEMS ===");
console.log(JSON.stringify(logicSystems, null, 2));
