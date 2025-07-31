import React, { useState, useEffect, useRef } from "react";
import { Box, Container, Typography, Alert, Button } from "@mui/material";
import * as d3 from "d3";
import { Models, TreeUtilities } from "istack-buddy-utilities";

export default function GraphTestPage() {
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibilityTree, setVisibilityTree] = useState<any>(null);
  const [d3Nodes, setD3Nodes] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const targetFieldId = "148456734";

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load the test form data
        const response = await fetch("/test-data/forms-json/5375703.json");
        if (!response.ok) {
          throw new Error(`Failed to load form data: ${response.statusText}`);
        }

        const data = await response.json();
        setFormData(data);

        // Create form model
        const formModel = new Models.FsModelForm(data, {
          fieldModelVersion: "v2",
        });

        // Create visibility tree for the specific field
        console.log(`Creating visibility tree for field: ${targetFieldId}`);
        const tree = TreeUtilities.FsFieldVisibilityGraph.fromFormModel(
          targetFieldId,
          formModel
        );
        setVisibilityTree(tree);

        // Log the raw tree structure
        console.log("Raw Visibility Tree:", tree);
        console.log("Tree keys:", Object.keys(tree));
        const fieldKey = `field${targetFieldId}`;
        console.log(
          `Tree ${fieldKey} keys:`,
          Object.keys((tree as any)[fieldKey] || {})
        );

        // Convert to D3 nodes
        console.log("Converting to D3 nodes...");
        const nodes = TreeUtilities.transformers.toD3HierarchyGraphNodes(tree);
        setD3Nodes(nodes);

        console.log("D3 Nodes:", nodes);
        console.log("D3 Nodes structure:", JSON.stringify(nodes, null, 2));

        // Count nodes in the tree
        const treeNodeCount = Object.keys((tree as any)[fieldKey] || {}).length;
        console.log(`Tree has ${treeNodeCount} nodes`);

        // Count nodes in D3 structure
        const d3NodeCount = countNodesInHierarchy(nodes);
        console.log(`D3 structure has ${d3NodeCount} nodes`);
      } catch (err) {
        console.error("Error loading form data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  // Render D3 graph when d3Nodes changes
  useEffect(() => {
    if (!d3Nodes || !svgRef.current) return;

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create the SVG container with zoom support
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .call(
        d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 4])
          .on("zoom", (event) => {
            g.attr("transform", event.transform);
          }) as any
      );

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
      .attr("refX", 20)
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

    // Create tree layout
    const treeLayout = d3
      .tree<any>()
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
      ]);

    // Create hierarchy from the graph data
    const root = d3.hierarchy(d3Nodes);
    const treeLayoutData = treeLayout(root);

    console.log("Tree layout data:", treeLayoutData);
    console.log("Tree layout descendants:", treeLayoutData.descendants());

    // Create links
    const linkGenerator = d3
      .linkVertical<d3.HierarchyLink<any>, d3.HierarchyPointNode<any>>()
      .x((d) => d.x)
      .y((d) => d.y);

    const link = g
      .append("g")
      .selectAll("path")
      .data(treeLayoutData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", linkGenerator)
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
      .attr("r", 20)
      .attr("fill", "#69b3a2")
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
      .text((d) => d.data.name)
      .style("font-size", "12px")
      .style("fill", "#ffffff")
      .style("font-weight", "500");

    return () => {
      // Remove tooltip
      d3.select("body").selectAll(".tooltip").remove();
    };
  }, [d3Nodes]);

  // Helper function to count nodes in hierarchy
  const countNodesInHierarchy = (node: any): number => {
    if (!node) return 0;
    let count = 1;
    if (node.children) {
      count += node.children.reduce(
        (sum: number, child: any) => sum + countNodesInHierarchy(child),
        0
      );
    }
    return count;
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" gutterBottom>
            Graph Test Page
          </Typography>
          <Typography>Loading form data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ p: 2 }}>
          <Typography variant="h4" gutterBottom>
            Graph Test Page
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Graph Test Page
        </Typography>

        <Typography variant="h6" gutterBottom>
          Testing Visibility Graph for Field: {targetFieldId}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Debug Information:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Form Data Loaded: {formData ? "Yes" : "No"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visibility Tree Created: {visibilityTree ? "Yes" : "No"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            D3 Nodes Created: {d3Nodes ? "Yes" : "No"}
          </Typography>
          {visibilityTree && (
            <Typography variant="body2" color="text.secondary">
              Tree Node Count:{" "}
              {
                Object.keys(
                  (visibilityTree as any)[`field${targetFieldId}`] || {}
                ).length
              }
            </Typography>
          )}
          {d3Nodes && (
            <Typography variant="body2" color="text.secondary">
              D3 Node Count: {countNodesInHierarchy(d3Nodes)}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowRawData(!showRawData)}
            sx={{ mb: 2 }}
          >
            {showRawData ? "Hide" : "Show"} Raw Data
          </Button>
        </Box>

        {/* Direct D3 Graph */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            D3 Graph Visualization:
          </Typography>
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

        {showRawData && visibilityTree && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Raw Visibility Tree Data:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                maxHeight: "400px",
                overflow: "auto",
                fontFamily: "monospace",
                fontSize: "0.875rem",
              }}
            >
              <pre>{JSON.stringify(visibilityTree, null, 2)}</pre>
            </Box>
          </Box>
        )}

        {showRawData && d3Nodes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              D3 Nodes Data:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                maxHeight: "400px",
                overflow: "auto",
                fontFamily: "monospace",
                fontSize: "0.875rem",
              }}
            >
              <pre>{JSON.stringify(d3Nodes, null, 2)}</pre>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
}
