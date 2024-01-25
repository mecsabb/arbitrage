import { useState } from 'react'
import './App.css'

function App() {
  return (
    <>
      <div className="card">
        <div>
          <button>
            <a href="/display-graph">Generate Optimal Path</a>
          </button>
        </div>
        <div>
          <button>
            <a href="/kraken-test">Kraken API Fetch Example</a>
          </button>
        </div>
      </div>
    </>
  );
}

export default App
