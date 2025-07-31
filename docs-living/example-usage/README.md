# Example Usage

This directory contains example scripts demonstrating how to use the istack-buddy-utilities library.

## Visibility Tree Example

The `visibility-tree-example.ts` script demonstrates:

1. **Creating a Form Model** - Loading form data from JSON and creating a `FsModelForm` instance
2. **Building Logic Systems** - Creating logic systems for the entire form using `transformToLogicSystems`
3. **Creating Individual Visibility Trees** - Creating `FsFieldVisibilityGraph` for each field in each system
4. **Converting to D3 Nodes** - Using `toD3HierarchyGraphNodes` to generate D3-compatible graph nodes for each field

### Running the Example

```bash
# From the project root
npx ts-node docs-living/example-usage/visibility-tree-example.ts
```

### What the Example Does

The example uses the test form data from `test-data/form-json/5375703.json` which contains a form with complex logic chains and circular references.

The script will output:

1. **Individual Field Visibility Trees** - For each field in each logic system, showing the visibility tree structure as D3 hierarchy graph nodes
2. **Logic Systems Summary** - All logic systems in the form, including circular reference systems

The visibility trees show:

- Virtual root nodes
- Junction nodes (AND/OR operators)
- Predicate nodes (field conditions)
- Error nodes (for circular references)

The logic systems show:

- Groups of interconnected logic fields
- Circular reference detection across the entire form
- Field details including labels and sort order

### Key Concepts

- **Form Model**: Wraps Formstack API responses with utility methods
- **Logic Systems**: Groups of fields that are interconnected through visibility logic
- **Visibility Tree**: Represents field visibility logic as a directed graph
- **D3 Nodes**: Hierarchical structure suitable for D3.js visualization
- **Circular Logic**: Automatically detected and marked as error nodes

## Calculation Tree Example

The `calculation-tree-example.ts` script demonstrates:

1. **Creating a Form Model** - Loading form data from JSON and creating a `FsModelForm` instance
2. **Building a Calculation Tree** - Creating a `FsCalculationGraphDeep` for a specific field (183969730)
3. **Converting to POJO** - Using `toPojoAt()` to generate a tree structure for visualization

### Running the Example

```bash
# From the project root
npx ts-node docs-living/example-usage/calculation-tree-example.ts
```

### What the Example Does

The example uses the test form data from `test-data/form-json/6221310.json` which contains a form with multiple calculation anti-patterns including Ring, Big Dipper, BowTie, and broken expressions.

The script will output:

1. **Individual Field Calculation Trees** - For each field in each calculation system, showing the calculation breakdown as POJO structures
2. **Calculation Systems Summary** - All calculation systems in the form, including circular reference systems

The calculation tree shows:

- Operator nodes (mathematical operations like +, -, \*, /)
- Operand nodes (field references and constants)
- Error nodes (for circular references or invalid calculations)

The calculation systems show:

- Groups of interconnected calculation fields
- Circular reference detection across the entire form
- Field details including labels and sort order

### Key Concepts

- **Form Model**: Wraps Formstack API responses with utility methods
- **Calculation Tree**: Represents field calculation logic as a directed graph
- **Deep Tree**: Dereferences all field references to show the complete calculation chain
- **POJO**: Plain Old JavaScript Object structure suitable for visualization
- **Calculation Systems**: Groups of fields that are interconnected through calculations, automatically detecting circular references
