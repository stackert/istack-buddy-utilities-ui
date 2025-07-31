"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  ButtonGroup,
} from "@mui/material";
import { Models, TreeUtilities } from "istack-buddy-utilities";
import { GenericPojoToGraphNodes } from "../VisibilityGraph/GenericPojoToGraphNodes";

interface CalculationGraphWidgetProps {
  formData: any;
  selectedSystem: string;
  selectedField: string;
}

interface D3Node {
  id: string;
  name: string;
  nodeContent: any;
  children?: D3Node[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// Flatten hierarchy into nodes and links for force-directed layout
function flattenHierarchy(
  node: any,
  parentId?: string
): { nodes: D3Node[]; links: { source: string; target: string }[] } {
  const nodes: D3Node[] = [];
  const links: { source: string; target: string }[] = [];
  const nodeIds = new Set<string>(); // Track unique node IDs

  function traverse(currentNode: any, currentParentId?: string) {
    const nodeId = currentNode.id || currentNode.name;

    // Only add node if we haven't seen it before
    if (!nodeIds.has(nodeId)) {
      nodeIds.add(nodeId);
      nodes.push({
        id: nodeId,
        name: currentNode.name,
        nodeContent: currentNode.nodeContent,
      });
    }

    if (currentParentId) {
      links.push({
        source: currentParentId,
        target: nodeId,
      });
    }

    if (currentNode.children) {
      currentNode.children.forEach((child: any) => traverse(child, nodeId));
    }
  }

  traverse(node, parentId);
  return { nodes, links };
}

const CalculationGraphWidget: React.FC<CalculationGraphWidgetProps> = ({
  formData,
  selectedSystem,
  selectedField,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [layoutType, setLayoutType] = useState<"hierarchy" | "force">(
    "hierarchy"
  );
  const [labelType, setLabelType] = useState<"fieldId" | "value" | "nodeId">(
    "fieldId"
  );
  const [graphData, setGraphData] = useState<any>(null);

  // Generate graph data from calculation tree
  useEffect(() => {
    if (!formData || !selectedSystem || !selectedField) {
      setGraphData(null);
      return;
    }

    try {
      // Create form model from the form data
      const formModel = new Models.FsModelForm(formData, {
        fieldModelVersion: "v2",
      });

      // Create calculation tree for the selected field
      const calculationTree =
        TreeUtilities.FsCalculationGraphDeep.fromFormModel(
          selectedField,
          formModel
        );

      console.log({ calculationTree: calculationTree.toPojoAt() });

      // Convert to D3 nodes using the same transformer
      const calculationPojo = calculationTree.toPojoAt();
      const d3Nodes = GenericPojoToGraphNodes(calculationPojo);

      console.log({ d3Nodes: d3Nodes });

      setGraphData(d3Nodes);
    } catch (error) {
      console.error("Error generating calculation graph:", error);
      setGraphData(null);
    }
  }, [formData, selectedSystem, selectedField]);

  // Render D3 graph
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create the SVG container with zoom support
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .call(zoom as any);

    // Store zoom reference after it's been applied
    zoomRef.current = zoom;

    // Create a group for all elements that will be transformed
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add arrow markers
    g.append("defs")
      .selectAll("marker")
      .data(["end"])
      .enter()
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 7) // Position arrow at the end of the line
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("class", "arrow")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
      .style("font-size", "12px")
      .style("max-width", "300px")
      .style("color", "#000")
      .style("z-index", "1000");

    if (layoutType === "hierarchy") {
      // Create tree layout
      const treeLayout = d3
        .tree<any>()
        .size([
          width - margin.left - margin.right,
          height - margin.top - margin.bottom,
        ]);

      // Create hierarchy from the graph data
      const root = d3.hierarchy(graphData);
      const treeLayoutData = treeLayout(root);

      // Create links
      const link = g
        .append("g")
        .selectAll("path")
        .data(treeLayoutData.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", (d) => {
          // Custom path to stop at node edge
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          const nodeRadius = 20; // Match the node radius

          // Calculate the point on the target node's edge
          const targetX = d.target.x - (dx / dr) * nodeRadius;
          const targetY = d.target.y - (dy / dr) * nodeRadius;

          return `M${d.source.x},${d.source.y}L${targetX},${targetY}`;
        })
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");

      // Create nodes
      const node = g
        .append("g")
        .selectAll("g")
        .data(treeLayoutData.descendants())
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      // Add circles to nodes
      node
        .append("circle")
        .attr("r", 20) // Reduced from 40 to 20
        .attr("fill", (d) => {
          // Check if node content has isError property
          if (d.data.nodeContent && (d.data.nodeContent as any).isError) {
            console.log("Error node found:", d.data.name, d.data.nodeContent);
            return "#ff4444"; // Red for error nodes
          }
          return "#69b3a2"; // Default teal color
        })
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .html(
              `<strong>${d.data.name}</strong><br/><pre>${JSON.stringify(
                d.data.nodeContent,
                null,
                2
              )}</pre>`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });

      // Add text labels
      node
        .append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", "middle")
        .style("font-size", "12px") // Reduced font size for smaller nodes
        .style("fill", "#000000")
        .style("font-weight", "500")
        .each(function (d) {
          const text = d3.select(this);
          const lines = getLabelText(d.data).split("\n");
          lines.forEach((line, i) => {
            text
              .append("tspan")
              .attr("x", 0)
              .attr("dy", i === 0 ? "0" : "1.2em")
              .text(line);
          });
        });
    } else {
      // Force-directed layout
      const { nodes, links } = flattenHierarchy(graphData);

      console.log("Force layout nodes:", nodes);
      console.log("Force layout links:", links);

      simulationRef.current = d3
        .forceSimulation<D3Node>(nodes)
        .force(
          "link",
          d3
            .forceLink<D3Node, d3.SimulationLinkDatum<D3Node>>(links)
            .id((d) => d.id)
            .distance(100) // Reduced distance for smaller nodes
        )
        .force("charge", d3.forceManyBody().strength(-300)) // Reduced repulsion
        .force("center", d3.forceCenter(width / 2, height / 2));

      // Create links
      const link = g
        .append("g")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");

      // Create nodes
      const node = g
        .append("g")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .call(
          d3
            .drag<SVGGElement, D3Node>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended) as any
        );

      // Add circles to nodes
      node
        .append("circle")
        .attr("r", 20) // Reduced from 40 to 20
        .attr("fill", (d) => {
          // Check if node content has isError property
          if (d.nodeContent && (d.nodeContent as any).isError) {
            console.log("Error node found:", d.name, d.nodeContent);
            return "#ff4444"; // Red for error nodes
          }
          return "#69b3a2"; // Default teal color
        })
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .html(
              `<strong>${d.name}</strong><br/><pre>${JSON.stringify(
                d.nodeContent,
                null,
                2
              )}</pre>`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });

      // Add text labels
      node
        .append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", "middle")
        .style("font-size", "12px") // Reduced font size for smaller nodes
        .style("fill", "#000000")
        .style("font-weight", "500")
        .each(function (d) {
          const text = d3.select(this);
          const lines = getLabelText(d).split("\n");
          lines.forEach((line, i) => {
            text
              .append("tspan")
              .attr("x", 0)
              .attr("dy", i === 0 ? "0" : "1.2em")
              .text(line);
          });
        });

      // Update positions on each tick
      simulationRef.current.on("tick", () => {
        link.attr("d", (d) => {
          // Custom path to stop at node edge for force layout
          const source = d.source as any;
          const target = d.target as any;

          // Check for valid coordinates
          if (
            !source.x ||
            !source.y ||
            !target.x ||
            !target.y ||
            isNaN(source.x) ||
            isNaN(source.y) ||
            isNaN(target.x) ||
            isNaN(target.y)
          ) {
            return `M0,0L0,0`; // Fallback path
          }

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);

          // Check for zero distance
          if (dr === 0) {
            return `M${source.x},${source.y}L${source.x},${source.y}`;
          }

          const nodeRadius = 20; // Match the node radius

          // Calculate the point on the target node's edge
          const targetX = target.x - (dx / dr) * nodeRadius;
          const targetY = target.y - (dy / dr) * nodeRadius;

          return `M${source.x},${source.y}L${targetX},${targetY}`;
        });

        node.attr("transform", (d) => {
          const x = d.x || 0;
          const y = d.y || 0;
          return `translate(${x},${y})`;
        });
      });
    }

    function dragstarted(
      event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>,
      d: D3Node
    ) {
      if (!event.active && simulationRef.current)
        simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(
      event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>,
      d: D3Node
    ) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>,
      d: D3Node
    ) {
      if (!event.active && simulationRef.current)
        simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      // Remove tooltip
      d3.select("body").selectAll(".tooltip").remove();
    };
  }, [graphData, layoutType, labelType]); // Added labelType to dependencies

  const handleLayoutChange = (event: SelectChangeEvent) => {
    setLayoutType(event.target.value as "hierarchy" | "force");
  };

  // Zoom functions
  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const currentTransform = d3.zoomTransform(svg.node()!);
      const newScale = Math.min(currentTransform.k * 1.5, 4); // Cap at max zoom
      const newTransform = d3.zoomIdentity
        .scale(newScale)
        .translate(currentTransform.x, currentTransform.y);
      svg
        .transition()
        .duration(300)
        .call(zoomRef.current!.transform, newTransform);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const currentTransform = d3.zoomTransform(svg.node()!);
      const newScale = Math.max(currentTransform.k / 1.5, 0.1); // Cap at min zoom
      const newTransform = d3.zoomIdentity
        .scale(newScale)
        .translate(currentTransform.x, currentTransform.y);
      svg
        .transition()
        .duration(300)
        .call(zoomRef.current!.transform, newTransform);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(300)
        .call(zoomRef.current!.transform, d3.zoomIdentity);
    }
  };

  // Helper function to get label text based on label type
  const getLabelText = (nodeData: any): string => {
    const nodeContent = nodeData.nodeContent || nodeData;

    switch (labelType) {
      case "fieldId":
        // Show directOwnerFieldId
        return nodeContent.directOwnerFieldId || nodeData.name || "";

      case "value":
        // If node contains an 'operandValue' property, show '{subjectId} {operator} operandValue' on 3 lines
        // Otherwise just show the operator
        if (nodeContent.operandValue !== undefined) {
          const lines = [
            nodeContent.subjectId || "",
            nodeContent.operator || "",
            nodeContent.operandValue || "",
          ].filter((line) => line !== "");
          return lines.join("\n");
        }
        return (
          nodeContent.operator || nodeContent.subjectId || nodeData.name || ""
        );

      case "nodeId":
        // Show everything after _root_: in node IDs
        const nodeId = nodeData.name || "";
        if (nodeId.startsWith("_root_:")) {
          const parts = nodeId.split(":");
          if (parts.length > 1) {
            const result = parts.slice(1).join(":");
            return result || "vRoot";
          }
          return "vRoot";
        }
        return nodeId;

      default:
        return nodeData.name || "";
    }
  };

  if (!selectedSystem || !selectedField) {
    return (
      <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
        Please select a system and field to view the calculation graph.
      </Box>
    );
  }

  if (!graphData) {
    return (
      <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
        Loading calculation graph...
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Layout Type</InputLabel>
          <Select
            value={layoutType}
            label="Layout Type"
            onChange={handleLayoutChange}
          >
            <MenuItem value="hierarchy">Hierarchy</MenuItem>
            <MenuItem value="force">Force-Directed</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          Field: <strong>{selectedField}</strong> | System:{" "}
          <strong>{selectedSystem}</strong>
        </Box>
      </Box>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={labelType}
            onChange={(e) =>
              setLabelType(e.target.value as "fieldId" | "value" | "nodeId")
            }
          >
            <FormControlLabel
              value="fieldId"
              control={<Radio />}
              label="Field ID"
            />
            <FormControlLabel value="value" control={<Radio />} label="Value" />
            <FormControlLabel
              value="nodeId"
              control={<Radio />}
              label="Node ID"
            />
          </RadioGroup>
        </FormControl>

        <ButtonGroup size="small" variant="outlined">
          <Button onClick={handleZoomIn} title="Zoom In">
            +
          </Button>
          <Button onClick={handleZoomOut} title="Zoom Out">
            −
          </Button>
          <Button onClick={handleResetZoom} title="Reset Zoom">
            ⌂
          </Button>
        </ButtonGroup>
      </Box>

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <svg ref={svgRef}></svg>
      </Box>
    </Box>
  );
};

export default CalculationGraphWidget;
