import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KrakenTest = () => {
  const [tickerData, setTickerData] = useState([]);
  const [pairData, setPairData] = useState([]);
  const [graphJson, setGraphJson] = useState();

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

  // THIS IS UNFINISHED AND ISN'T CALLED ANYWHERE YET, CALL IT IN PROCESS DATA AND THEN CALL SETGRAPHJSON() 
  // MAKE THIS GO DIRECTLY TO D3.JS FORMAT
  const createGraphData = () => {
    const graphData = {};

    pairData.forEach(pair => {
      const node = pair.origin;
      const target = pair.pairName[1];
      const jointName = pair.name;

      // If the node hasn't been added yet, add it and initialize with an empty list
      if(!graphData[node]){
        graphData[node] = []
      }

      //NOTE: if not found, it will return 'undefined'
      const edgeWeight = tickerData.find(ticker => ticker.name === jointName)?.lastPrice;
      
      //Thus, it only gets added if an actual value is returned
      if(edgeWeight){
        graphData[node].push([target, edgeWeight]);
      }
    });

    return graphData;

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
 

      // Here I believe the response will be the output of the model, i.e. the shortest path in some sort of representation
      // TO-DO: write code to handle the response, put into graph format and display
      const response = await postCombinedData(tickerJson, pairJson);
      return response;

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
  }, [])



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



      {/* Return to Homepage button */}
      <button>
        <a href="/">Return to Homepage</a>
      </button>
    </>
  );
};

export default KrakenTest;