import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KrakenTest = () => {
  const [tickerData, setTickerData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tickers from Kraken
        const response = await axios.get('https://api.kraken.com/0/public/Ticker?');
        const data = response.data;

        if (data && data.result) {
          const tickersArray = Object.entries(data.result).map(([name, info]) => ({
            name,
            lastPrice: info.c[0],
          }));
          setTickerData(tickersArray);

          // Format tickers into a graph structure
          const graphData = {
            graph: {
              edges: [], // Add edges if needed
              nodes: tickersArray.map(({ name }) => ({
                id: name,
                neighbours: [] // Add neighbours if needed
              })),
            },
            shortestPath: null, // Set to null as this is not available in the Kraken API response
          };

          // Example: Post the formatted graph in JSON form to the Flask endpoint
          console.log('Sending graph data:', graphData);
          await axios.post('http://127.0.0.1:5000/process-graph', graphData);
        } else {
          console.error('Invalid response from Kraken API:', data);
        }
      } catch (error) {
        console.error('Error fetching data from Kraken:', error);
      }
    };

    fetchData();
  }, []);

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