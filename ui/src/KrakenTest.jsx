import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DisplayGraph from './DisplayGraph.jsx'

//TO-DOS: 
// 4) Potentially remove ticker info now that it's redundant
// 5) Write conditions to not include nodes that only have one edge (They can't be in the cycle anyways)

const KrakenTest = () => {
  const [tickerData, setTickerData] = useState([]);
  const [pairData, setPairData] = useState([]);
  const [linksObject, setLinksObject] = useState([]);
  const [nodesObject, setNodesObject] = useState([]);
  const [path, setPath] = useState([]);
  const [showPath, setShowPath] = useState(false);
  const [nodeIdMap, setNodeIdMap] = useState({});

  const toggleShowPath = () => {
    setShowPath(!showPath);
  }

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
      const node = pair.pairName[0];
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
    setNodeIdMap(nodesMap);


    pairData.forEach(pair => {
      //Won't add any links of nodes that weren't added to the nodeMap (i.e. won't add any links containing USD or EUR)
      if(nodesMap[pair.pairName[0]] && nodesMap[pair.pairName[1]]){
        const sourceId = nodesMap[pair.pairName[0]];
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
        //Removed reading of the base, pairName[0] will give base
      }));
      setPairData(pairsArray);
      
      //CURRENTLY COMMENTED OUT THE FOLLOWING CODE FOR TESTING OF THE GRAPH REPRESENTATION ON FRONTEND, THIS CODE WOULD POST THE INFO TO THE BACKEND
      // Here I believe the response will be the output of the model, i.e. the shortest path in some sort of representation
      // TO-DO: write code to handle the response, put into graph format and display

      //const response = await postCombinedData(tickerJson, pairJson);
      // return response;

      // All we need is the name and order of the nodes, doesn't have to be formatted nicely.
      const dummyList = ['XBT', 'MATIC', 'USDT', 'ETH'];
      const dummyIdList = dummyList.map(nodeName => nodeIdMap[nodeName]); //convert to their respective IDs
      setPath(dummyList);

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
  }, [tickerData, pairData]);

  useEffect(() => {
    console.log("path has been updated to:", path);
    // Any code here will run after `showPath` has been updated and the component has re-rendered.
  }, [path]);


  return (
    <>
      {/* Display tickers three-column layout */}
     
      <div>
          <h2>Graph Representation</h2>
            {(linksObject.length > 0 && nodesObject.length > 0 && path.length > 0) ? (
              
              <DisplayGraph nodes={nodesObject} links={linksObject} path={path} showPath={showPath} setShowPath={setShowPath}></DisplayGraph>

            ) : (
              <p>Loading...</p>
            )}

      </div>

      <button onClick={() => toggleShowPath()}>
        Find Optimal Path
      </button>

      {/* Return to Homepage button */}
      <button>
        <a href="/">Return to Homepage</a>
      </button>
    </>
  );
};

export default KrakenTest;