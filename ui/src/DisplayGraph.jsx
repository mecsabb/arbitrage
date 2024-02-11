import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './DisplayGraphStyles.css';

const DisplayGraph = ({ nodes, links, path, showPath, setShowPath}) => {
  const graphContainerRef = useRef(null);
  
  const toggleShowPath = () => {
    setShowPath(!showPath);
  }


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
          .attr("r", 5); // Revert the radius when mouseout
        }    
    });
        
      
      
      link.on("mouseover", function(event, d) {
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
          .attr("stroke-width", 5);
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
      // Reset styles for all nodes and links
      node.attr('fill', 'red').attr('r', 2); // Default fill color for nodes
      link.attr('stroke', 'black').attr('stroke-width', 1); // Default stroke for links

      // Highlight nodes in the path
      path.forEach(label => {
        node.filter(d => d.label === label)
            .attr('fill', 'blue')
            .attr('r', 10) // Highlight color for nodes
        
      });

    
      // Highlight links in the path
      for (let i = 0; i < path.length - 1; i++) {
        link.filter(d =>  
            (d.source.label === path[i] && d.target.label === path[i + 1]) || // Check for the link in the order specified in the path
            (d.source.label === path[i + 1] && d.target.label === path[i]) // Check for the link in the reverse order
        )
            .attr('stroke', 'yellow') // Highlight color for links
            .attr('stroke-width', 3);
        

      }
      link.filter(d =>  
        (d.source.label === path[path.length-1] && d.target.label === path[0]) || // Check for the link in the order specified in the path
        (d.source.label === path[0] && d.target.label === path[path.length-1]) // Check for the link in the reverse order
      )
        .attr('stroke', 'yellow') // Highlight color for links
        .attr('stroke-width', 3);

      

        
    }else{
      d3.select(".tooltip").style("opacity", 0);
    }
    
    // Cleanup function to stop simulation on component unmount
    return () => simulation.stop();
  }, [nodes, links, showPath]); // Re-run effect if nodes, links or showPath change


  
  return <div className='graph' ref={graphContainerRef} />;
};

export default DisplayGraph;