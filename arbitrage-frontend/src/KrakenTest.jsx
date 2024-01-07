import React, { useState, useEffect } from 'react';
import axios from 'axios'; // for making HTTP requests

const KrakenTest = () => {
  const [tickerData, setTickerData] = useState(null); // Initial value is null

  useEffect(() => { // Effect hook runs once on mount
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.kraken.com/0/public/Ticker?pair=XDGUSD'); // GET request to Kraken API
        const data = response.data;

        if (data && data.result && data.result['XDGUSD']) { 
          setTickerData(data.result['XDGUSD']); // Set tickerData state to response data
        } else {
          console.error('Invalid response from Kraken API:', data);
        }
      } catch (error) {
        console.error('Error fetching data from Kraken:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return (
    <div>
      <h2>Dogecoin (XDG) Information:</h2>
      {tickerData !== null ? (
        <ul>
          <li>{`Last Price: $${tickerData.c[0]}`}</li>
          <li>{`24h High: $${tickerData.h[1]}`}</li>
          <li>{`24h Low: $${tickerData.l[1]}`}</li>
          <li>{`24h Volume: ${tickerData.v[1]}`}</li>
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default KrakenTest;