import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './DisplayGraphStyles.css';

const DisplayGraph = ({ nodes, links, path, showPath, animationRunning, setAnimationRunning}) => {
  const graphContainerRef = useRef(null);
  const [totalEdgeWeight, setTotalEdgeWeight] = useState(1);
  const [edgeWeightList, setEdgeWeightList] = useState([]);
  const lastProcessedIndexRef = useRef(-1);
  
  useEffect(() => {    
    if (!graphContainerRef.current) return; // Ensure the ref is attached
    
    const width = window.innerWidth/1.5;
    const height = window.innerHeight/1;


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
    
    let stopAnimation = false; //used to stop animation when button is pressed again

    if (!showPath) {
      return;
    }

    if (showPath) {
      
      // Reset styles for all nodes and links
      node.attr('fill', '#646cff').attr('r', 2); // make non-path nodes smaller
      link.attr('stroke', 'black').attr('stroke-width', 1); // make non-path links smaller
      // Function to animate the path
      const animatePath = (index) => {
        setAnimationRunning(true);
        if (stopAnimation || index >= path.length){
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
              );
              console.log('currentLink source: ', currentLink.datum());
              
              let newWeight = currentLink.datum().weight;
              console.log('target, path, T/F', currentLink.datum().target.label, path[index], currentLink.datum().target.label === path[index]);
              if (path[index] === currentLink.datum().target.label) {
                newWeight = 1/newWeight;
              }
              console.log('newWeight', newWeight);
              if (index === 0){
                setEdgeWeightList(edgeWeightList => [{w: newWeight, s: path[index], t: path[index+1]}]); //add newest edge weight/node label to the edgeWeightList
              } else {
                setEdgeWeightList(edgeWeightList => [...edgeWeightList, {w: newWeight, s: path[index], t: path[index+1]}]); //add newest edge weight/node label to the edgeWeightList
              }
              setTotalEdgeWeight(totalEdgeWeight => (totalEdgeWeight * newWeight).toFixed(8)); 

              

              currentLink.on('end', null);
              currentLink.transition()
              .delay(300) // Delay to ensure the node turns blue first
              .duration(750) // Adjust time as needed
              .attr('stroke', 'yellow')
              .attr('stroke-width', 3)
              .on('end', () => {
                //updateEdgeWeights(currentLink, index);
                animatePath(index + 1)
                setAnimationRunning(false);
              }); // Move to the next node after the transition

          }

      };
  
      // Start the animation with the first node
      animatePath(0);
    }
    
    // Cleanup function to stop simulation on component unmount
    return () => {
      stopAnimation = true;
      simulation.stop();
      setTotalEdgeWeight(1);
      setEdgeWeightList([])
      setAnimationRunning(false);
    }
  }, [nodes, links, showPath, path]); // Re-run effect if nodes, links, path or showPath change

  useEffect(() => {
    if(!showPath){
      setEdgeWeightList([]);
      setTotalEdgeWeight(1);
    }
  }, [showPath])

  return (
  <>
  
    <div className='flex-box'>
      <div className='graph' ref={graphContainerRef} />
        <div className='console-container'>
          <div className='logs'>
            {edgeWeightList.map((obj, index) => (
              // (index === 0) ? (
              //   <></>
              // ) : (
              //   <div className='console-line' key={index}>Exchange Rate of {obj.s}/{obj.t}: {obj.w}</div>
              // )
              <div className='console-line' key={index}>Exchange Rate of {obj.s}/{obj.t}: {obj.w}</div>

            ))}
        </div>
      
        <div className='running-total'>
          {(totalEdgeWeight !== 1) ? (
            
            
            
            <>Net Exchange Rate: {totalEdgeWeight}</>
          ) : (
            <>Press 'Find Optimal Path' to view the output of the model</>
          )}
        </div>
      
      </div>
    </div>

  </>
  );
};

export default DisplayGraph;

