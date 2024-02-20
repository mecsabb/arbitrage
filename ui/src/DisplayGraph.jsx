import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './DisplayGraphStyles.css';

const DisplayGraph = ({ nodes, links, path, showPath}) => {
  const graphContainerRef = useRef(null);
  const [totalEdgeWeight, setTotalEdgeWeight] = useState(1);

  useEffect(() => {
    if (!graphContainerRef.current) return; // Ensure the ref is attached
    
    const width = window.innerWidth/1.5;
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
      //.append('g'); // This is where you append your nodes and links

    const g = svg.append('g'); // Append a 'g' element to the SVG for graphical elements

    const tooltip = d3.select(graphContainerRef.current)
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

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
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(100) // makes it appear faster
          .style("opacity", 1); // make it fully visible
        tooltip.html(`${d.source.label} to ${d.target.label} exchange rate: ${d.weight}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
        if(!showPath){
          d3.select(this)
          .attr("stroke", "yellow") // Change color to yellow on mouse over
          .transition()
          .duration(300)
          .attr("stroke-width", 4);
        }
      })
      .on("mouseout", function(event, d) {
          tooltip.transition()
            .duration(300)
            .style("opacity", 0); // fades out
          if(!showPath){
            d3.select(this)
            .attr("stroke", "black") // Revert to original color on mouse out
            .transition()
            .duration(300)
            .attr("stroke-width", 2);
          }
      });

    // Create the nodes
    const node = g.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 4)
      .attr("fill", "#646cff")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(100) // makes it appear faster
          .style("opacity", 1); // make it fully visible
        tooltip.html(`${d.label}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      if(!showPath){
        d3.select(this)
          .transition()
          .duration(300)
          .attr("r", 10); // increases radius on mousehover
      }
    })
      .on("mouseout", function(event, d) {
        tooltip.transition()
          .duration(300)
          .style("opacity", 0); // fades out
        if(!showPath){
          d3.select(this)
          .transition()
          .duration(300)
          .attr("r", 4); // Revert the radius when mouseout
        }    
    });
    
    // Add tick event listener to update positions
    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
      node.attr("cx", d => d.x)
          .attr("cy", d => d.y)
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
 
    if (showPath) {
      setTotalEdgeWeight(1);
      // Reset styles for all nodes and links
      node.attr('fill', '#646cff').attr('r', 2); // Reset to default fill color for nodes
      link.attr('stroke', 'black').attr('stroke-width', 1); // Reset to default stroke for links
  
      // Function to animate the path
      const animatePath = (index) => {
          
        if (index >= path.length){
          return;
        }  // Stop when all nodes have been highlighted
          
          // Highlight current node
          node.filter(d => d.label === path[index])
              .transition()
              .duration(200) // Adjust time as needed
              .attr('fill', 'blue')
              .attr('r', 10);
  
          if (index < path.length - 1) {
              // Find and highlight the link between the current node and the next
              const currentLink = link.filter(d =>  
                  (d.source.label === path[index] && d.target.label === path[index + 1]) ||
                  (d.source.label === path[index + 1] && d.target.label === path[index])
              )

              currentLink.transition()
              .delay(300) // Delay to ensure the node turns blue first
              .duration(750) // Adjust time as needed
              .attr('stroke', 'yellow')
              .attr('stroke-width', 3)
              .on('end', () => {
                const source = currentLink.data()[0].source.label;
                const target = currentLink.data()[0].target.label;
                // FINISH THIS! Need to get the edge weight from the correct link and setTotalEdgeWeight              
                // if (source === path[index]) {

                // } else if (target === path[index]) {
                // }
                animatePath(index + 1)
              
              }); // Move to the next node after the transition

              

          }else if (index === path.length - 1){
            link.filter(d => 
              (d.source.label === path[index] && d.target.label === path[0]) ||
              (d.source.label === path[0] && d.target.label === path[index])
            )
            .transition()
              .delay(300) // Delay to ensure the node turns blue first
              .duration(750) // Adjust time as needed
              .attr('stroke', 'yellow')
              .attr('stroke-width', 3)
              .on('end', () => animatePath(index + 1)); // Move to the next node after the transition
          }

      };
  
      // Start the animation with the first node
      animatePath(0);
    }
    
    // Cleanup function to stop simulation on component unmount
    return () => simulation.stop();
  }, [nodes, links, path, showPath]); // Re-run effect if nodes, links or showPath change



  return (
  <>
  
    <div className='graph' ref={graphContainerRef} />
  
    <div className='card'>
      Edge weight of path: {totalEdgeWeight}
    </div>

  </>
  );
};

export default DisplayGraph;
