import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DisplayGraph from './DisplayGraph.jsx'
import { link } from 'd3';

const KrakenTest = () => {
  const [tickerData, setTickerData] = useState([]);
  const [pairData, setPairData] = useState([]);
  const [linksObject, setLinksObject] = useState([]);
  const [nodesObject, setNodesObject] = useState([]);
  const [path, setPath] = useState([]);
  const [showPath, setShowPath] = useState(false);
  const [nodeIdMap, setNodeIdMap] = useState({});
  const [animationRunning, setAnimationRunning] = useState(false);

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

  const postCombinedData = async () => {
    // console.log("linksObj: ", linksObject);
    //combinedData is json containing all of both the ticker and assetPair data. 
    // **NOTE: pairJson is quite large, and a lot of it is unecessary data, consider dropping some before posting!!**
    // if any further data modification has to happen before the post, it can be done here
    const linkData = linksObject.map(link => {
      const newLink = {...link};
      newLink.source = {id: link.source.id, label: link.source.label, index: link.source.index};
      newLink.target = {id: link.target.id, label: link.target.label, index: link.target.index};
      
      // console.log(newLink);

      return newLink;
    })
    // console.log(linkData);


    const nodeData = nodesObject.map(node => {
      const newNode = {...node};

      delete newNode.x;
      delete newNode.y;
      delete newNode.vx;
      delete newNode.vy;

      return newNode;
    })

    const postData = [linkData, nodeData]
    // console.log('postData', postData);

    try{
      // **UPDATE ENDPOINT WHEN USING/TESTING** 
      // console.log("posting data: ", postData);
      const response = await axios.post('http://127.0.0.1:5000/process-graph', postData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    
      setPath(response.data);

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
    const postData = () => {
      if (linksObject.length > 0) {
        postCombinedData();
        // You can use the response here if needed
      }
    };
  
    postData();
  }, [showPath]);

  useEffect(() => {
    console.log("animationRunning: ", animationRunning);
  }, [animationRunning]);


  return (
    <>
      <div className='graph-container'>
          <h2>Graph Representation</h2>
            {(linksObject.length > 0 && nodesObject.length > 0) ? (
              
              <DisplayGraph nodes={nodesObject} links={linksObject} path={path} showPath={showPath} animationRunning={animationRunning} setAnimationRunning={setAnimationRunning}></DisplayGraph>

            ) : (
              <p>Loading...</p>
            )}

      </div>

      <button disabled={animationRunning} onClick={() => toggleShowPath()}>
        Find Optimal Path
      </button>

      {(showPath) ? (
        <button disabled={animationRunning} onClick={() => toggleShowPath()}>Reset</button>
      ) : (
        <></>
      )}

      {/* Return to Homepage button */}
      <button>
        <a href="/">Return to Homepage</a>
      </button>
    </>
  );
};

export default KrakenTest;