

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


const DisplayGraph = () => {
  const graphContainerRef = useRef(null);

  useEffect(() => {
    const svgContainer = d3.select(graphContainerRef.current);

    // Cleanup function
    const cleanup = () => {
      svgContainer.selectAll("*").remove();
      simulation.stop();
    };

    // Sample graph data
    const nodes = [
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' },
      { id: 3, label: 'Node 3' },
      { id: 4, label: 'Node 4' },
    ];

    const links = [
      { source: 1, target: 2, weight: 5 },
      { source: 2, target: 3, weight: 8 },
      { source: 3, target: 4, weight: 3 },
      { source: 4, target: 1, weight: 7 },
    ];

    // Set up the simulation with custom force strengths
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(200, 150));

    // Create SVG container
    svgContainer.selectAll("*").remove(); // Clear existing content
    const svg = svgContainer
      .append("svg")
      .attr("width", 400)
      .attr("height", 300);

    // Create links
    const link = svg.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", d => d.weight);

    // Create nodes
    const node = svg.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );

    // Add circles for nodes
    node.append("circle")
      .attr("r", 10)
      .attr("fill", "blue");

    // Add labels for nodes
    node.append("text")
      .text(d => d.label)
      .attr("dx", 12)
      .attr("dy", 4);

    // Update positions of nodes and links in each simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Cleanup function
    return cleanup;
  }, []); // Empty dependency array ensures the code runs once after initial render

  // Drag functions
  const dragstarted = (event, d) => {
    if (!event.active) d.fx = d.x;
    if (!event.active) d.fy = d.y;
  };

  const dragged = (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  const dragended = (event, d) => {
    if (!event.active) d.fx = null;
    if (!event.active) d.fy = null;
  };

  return (
    <>
        <div ref={graphContainerRef} id="graph-container"></div>
        <button>
            <a href="/">Return to Homepage</a>
        </button>
    </>
    );
};

export default DisplayGraph;
