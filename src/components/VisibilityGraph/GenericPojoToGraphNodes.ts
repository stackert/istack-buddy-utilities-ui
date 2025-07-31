import { pojoUtilities } from "predicate-tree-advanced-poc";
import type { TTreePojo } from "predicate-tree-advanced-poc";

export interface HierarchyNode<T> {
  name: string;
  nodeContent: T;
  children?: HierarchyNode<T>[];
}

export const GenericPojoToGraphNodes = <T>(
  treePojo: TTreePojo<T>
): HierarchyNode<T> => {
  // Clone the input data to avoid modifying the original
  const clonedPojo = JSON.parse(JSON.stringify(treePojo)) as TTreePojo<T>;
  const rootId = pojoUtilities.parseUniquePojoRootKeyOrThrow(clonedPojo);
  const rootNode = clonedPojo[rootId];

  // Recursive function to build the hierarchy
  const buildHierarchy = (nodeId: string, nodeContent: T): HierarchyNode<T> => {
    const childrenPojo = pojoUtilities.extractChildrenNodes(nodeId, clonedPojo);
    const children = Object.keys(childrenPojo);

    if (children.length === 0) {
      return {
        name: nodeId,
        nodeContent,
      };
    }

    return {
      name: nodeId,
      nodeContent,
      children: children.map((childId) => {
        const childNode = childrenPojo[childId];
        return buildHierarchy(childId, childNode.nodeContent as T);
      }),
    };
  };

  return buildHierarchy(rootId, rootNode.nodeContent);
};
