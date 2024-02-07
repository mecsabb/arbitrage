import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DisplayGraph from './DisplayGraph.jsx'

//TO-DOS: 
// 1) Make the background colour of the fetch kraken example different than the div colour for ease of scrolling
// 2) Improve the hover labelling, make it so you don't have to hover for like 5 seconds before it shows up
// 3) Add edge highlighting and edgeWeight display on hover over edges
// 4) Potentially remove ticker info now that it's redundant
// 5) Write conditions to not include nodes that only have one edge (They can't be in the cycle anyways)

const KrakenTest = () => {
  const [tickerData, setTickerData] = useState([]);
  const [pairData, setPairData] = useState([]);
  const [linksObject, setLinksObject] = useState([]);
  const [nodesObject, setNodesObject] = useState([]);

  const fetchTickerData = async () => {
    try{
      const response = await axios.get('https://api.kraken.com/0/public/Ticker?');
      return response.data.result;

    } catch (error) {
      console.error("error fetching ticker data from Kraken", error)
      return null
    }
  }

  const fetchPairData = async () => {
    try{
      const response = await axios.get('https://api.kraken.com/0/public/AssetPairs?');
      return response.data.result;

    } catch (error) {
      console.error("error fetching ticker data from Kraken", error)
      return null
    }
  }

  const postCombinedData = async (tickerJson, pairJson) => {
    
    //combinedData is json containing all of both the ticker and assetPair data. 
    // **NOTE: pairJson is quite large, and a lot of it is unecessary data, consider dropping some before posting!!**
    // if any further data modification has to happen before the post, it can be done here
    const combinedData = {
      tickerJson, 
      pairJson
    };
    try{
      // **UPDATE ENDPOINT WHEN USING/TESTING** 
      console.log("posting combined data: ", combinedData);
      const response = await axios.post('http://127.0.0.1:5000/process-graph', combinedData);
    
    
    } catch(error) {
      console.error("error posting to backend", error);
    }
  }


  const createGraphData = () => {
    let nodes = [];
    let links = [];
    const nodesMap = {};
    let nodeID = 1;

    pairData.forEach(pair => {
      const node = pair.origin;
      const destination = pair.pairName[1];
      
      //Won't add USD or EUR as a node
      if(node != "USD" && node != "EUR" && destination != "USD" && destination != "EUR"){
        if(!nodesMap[node]){
          nodesMap[node] = nodeID;
          nodes.push({id: nodeID, label: node})
          nodeID++;
        }
  
        if(!nodesMap[destination]){
          nodesMap[destination] = nodeID;
          nodes.push({id: nodeID, label: destination})
          nodeID++;
        }
      }
    });

    pairData.forEach(pair => {
      //Won't add any links of nodes that weren't added to the nodeMap (i.e. won't add any links containing USD or EUR)
      if(nodesMap[pair.origin] && nodesMap[pair.pairName[1]]){
        const sourceId = nodesMap[pair.origin];
        const targetId = nodesMap[pair.pairName[1]];
        const jointName = pair.name;
        const edgeWeight = tickerData.find(ticker => ticker.name === jointName)?.lastPrice;
  
        // if it doesn't find the edgeweight it will return undefined, and this will not run
        if(edgeWeight){
          links.push({source: sourceId, target: targetId, weight: edgeWeight});
        }
      }
      
    });
    
    setLinksObject(links);
    setNodesObject(nodes);
  }

  const processData = async () => {
    try {
      // Will wait until both fetches are complete
      const [tickerJson, pairJson] = await Promise.all([fetchTickerData(), fetchPairData()]);

      const tickersArray = Object.entries(tickerJson).map(([name, info]) => ({
        name,
        lastPrice: info.c[0],
      }));
      setTickerData(tickersArray);

      const pairsArray = Object.entries(pairJson).map(([name, info]) => ({
        name,
        pairName: info.wsname.split('/'),
        origin: info.base, 
      }));
      setPairData(pairsArray);
      
      //CURRENTLY COMMENTED OUT THE FOLLOWING CODE FOR TESTING OF THE GRAPH REPRESENTATION ON FRONTEND, THIS CODE WOULD POST THE INFO TO THE BACKEND
      // Here I believe the response will be the output of the model, i.e. the shortest path in some sort of representation
      // TO-DO: write code to handle the response, put into graph format and display

      //const response = await postCombinedData(tickerJson, pairJson);
      // return response;

    } catch (error) {
      console.error("error processing data", error);
      return null;
    }
  }

  // Since processData() calls both fetches, recieves them, processes them, and calls the post function, it's the only function
  // we need to call in the useEffect. Empty dependency array => will run on render, if we want it to wait until a button is pressed or something
  // like that we'll need to update this.
  useEffect(() => {
    processData();
  }, []);

  useEffect(() => {
    if(tickerData.length > 0 && pairData.length > 0){
      createGraphData();
    }
    console.log("links obj, ", linksObject);
  }, [tickerData, pairData]);



  return (
    <>
      {/* Display tickers three-column layout */}
      <div>
        <h2>Cryptocurrency Tickers:</h2>
        {tickerData.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', overflowY: 'scroll', maxHeight: '600px', scrollbarWidth: 'thin', scrollbarColor: '#ddd #fff' }}>
            {tickerData.map(({ name, lastPrice }, index) => (
              <div key={index} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h3>{`Ticker: ${name}`}</h3>
                <p>{`Last Price: $${lastPrice}`}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div>
          <h2>Graph Representation</h2>
            {(linksObject.length > 0 && nodesObject.length > 0) ? (
              
              <DisplayGraph nodes={nodesObject} links={linksObject}></DisplayGraph>

            ) : (
              <p>Loading...</p>
            )}

      </div>

      {/* Return to Homepage button */}
      <button>
        <a href="/">Return to Homepage</a>
      </button>
    </>
  );
};

export default KrakenTest;