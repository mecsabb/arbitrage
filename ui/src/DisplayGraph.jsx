import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DisplayGraph = ({ nodes, links }) => {
  const graphContainerRef = useRef(null);

  useEffect(() => {
    if (!graphContainerRef.current) return; // Ensure the ref is attached

    const width = window.innerWidth;
    const height = window.innerHeight;

    const zoom = d3.zoom()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform); // Apply transformations to the 'g' element
      });

    const svgContainer = d3.select(graphContainerRef.current);
    svgContainer.selectAll("*").remove(); // Clear previous SVG to prevent duplication

    const svg = d3.select(graphContainerRef.current).append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(zoom) // Apply zoom behavior to the SVG element
      .append('g'); // This is where you append your nodes and links

    const g = svg.append('g'); // Append a 'g' element to the SVG for graphical elements


    // Define the simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2)); // Center based on dynamic dimensions

    // Create the links
    const link = g.selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Create the nodes
  const node = g.selectAll("circle")
  .data(nodes)
  .enter().append("circle")
  .attr("r", 5)
  .attr("fill", "red")
  .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended))
  .on("mouseover", function(event, d) {
    d3.select(this)
      .transition()
      .duration(300)
      .attr("r", 10); // increases radius on mousehover
  })
  .on("mouseout", function(event, d) {
    d3.select(this)
      .transition()
      .duration(300)
      .attr("r", 5); // Revert the radius when mouseout
  });

  node.append("title")
  .text(d => d.label); 


    // Add tick event listener to update positions
    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

      node.attr("cx", d => d.x)
          .attr("cy", d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup function to stop simulation on component unmount
    return () => simulation.stop();
  }, [nodes, links]); // Re-run effect if nodes or links change

  return <div ref={graphContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default DisplayGraph;