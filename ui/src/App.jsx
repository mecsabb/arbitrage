import React, { useState, useEffect } from 'react';
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS CSS file

function App() {
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State to track popup visibility
  const [isPastHome, setIsPastHome] = useState(false); // State to track whether scrolled past home section
  const [activeSection, setActiveSection] = useState('home'); // State to track active section

  // Function to toggle popup visibility
  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  // Function to handle scrolling and determine active section
  const handleScroll = () => {
    const sections = ['home', 'results', 'arbitrage', 'methods'];

    // Find the section that is currently in the middle of the viewport
    const middleSection = sections.find(section => {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
      }
      return false;
    });

    // Set isPastHome based on the activeSection
    setIsPastHome(middleSection !== 'home');

    if (middleSection) {
      setActiveSection(middleSection);
    }
  };

  // useEffect to attach scroll event listener when component mounts
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Run only once after component mount

  useEffect(() => {
    AOS.init({
      // Global settings:
      disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
      startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
      initClassName: 'aos-init', // class applied after initialization
      animatedClassName: 'aos-animate', // class applied on animation
      useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
      disableMutationObserver: false, // disables automatic mutations' detections (advanced)
      debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
      throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)

      // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
      offset: 120, // offset (in px) from the original trigger point
      delay: 0, // values from 0 to 3000, with step 50ms
      duration: 400, // values from 0 to 3000, with step 50ms
      easing: 'ease', // default easing for AOS animations
      once: false, // whether animation should happen only once - while scrolling down
      mirror: false, // whether elements should animate out while scrolling past them
      anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation
    });
  }, []); // Run only once after component mount

  return (
    <div className="container">
      <nav>
        <a className='qmind' href='https://qmind.ca/' target='_blank'> 
          <img src="/assets/qmind.svg" alt='qmind logo'></img>
        </a>
        <ul className={`nav-links ${isPastHome ? 'opacity-low' : ''}`}>
          <li className="upward"><a href="#" className={activeSection === 'home' ? 'active' : ''}>Home</a></li>
          <li className="upward"><a href="#arbitrage" className={activeSection === 'arbitrage' ? 'active' : ''}>Arbitrage</a></li>
          <li className="upward"><a href="#methods" className={activeSection === 'methods' ? 'active' : ''}>Methods</a></li>
          <li className="upward"><a href="#results" className={activeSection === 'results' ? 'active' : ''}>Results</a></li>
        </ul>
      </nav>
      <div className="content-box" id="home">
        <div className="content">
          <div className="text">
            <h2>A Reinforcement Learning Approach to Finding Cryptocurrency Arbitrage Paths</h2>
            <p>This study, conducted by a group of 7 undergraduate students at Queen's University, presents a novel approach to finding optimal arbitrage paths in cryptocurrency exchanges using reinforcement learning techniques inspired by DeepMind's AlphaGo Zero. By reframing the problem as a Markov Decision Process and leveraging Monte Carlo Tree Search with a Graph Neural Network, we demonstrate promising convergence towards optimal solutions. Despite computational constraints, our model outperforms random strategies and exhibits significant speed gains compared to traditional methods like Depth First Search. Further research avenues include exploring different GNN architectures and training on specialized currency market graphs before considering deployment in live trading scenarios.</p>
            <div className="card">
                <a href="/kraken-test">
                  <button>
                    Generate Optimal Path
                  </button>
                </a>
            </div>
          </div>
          <div className="image">
            <img src="/assets/cryptorobot.jpg" alt="crypto robot" className="image"/>
          </div>
        </div>
      </div>
      <div data-aos="zoom-in" data-aos-offset="200" className="about" id="arbitrage">
        <h2>Arbitrage</h2>
        <hr />
        <div className="content">
          <div className="text">
          <h3>Currency Arbitrage</h3>
            <p>Arbitrage is the term for trading that results in risk-free profit. This is traditionally done by exploiting a difference in price of the same asset in two different markets - buying an asset in one market, and selling for a higher price in another. Another form of arbitrage is currency arbitrage, also known as triangle arbitrage. This is the process of generating risk-free profit via a series of cyclic trades in a currency exchange, ending with more of the original currency than was started with. Typically, any obvious discrepancies in stock or currency markets are so quickly capitalized on that they often disappear before many people can take advantage of them. This has reduced the profitability of arbitrage in stock and currency markets.
              <br></br><br></br>
            <h3>A Pathfinding Problem</h3>
            In order to find currency arbitrage paths in a cryptocurrency market, we must represent the cryptocurrency exchange as a graph. In this graph, each node represents a currency and each edge a potential trade. Lastly, the edge weight of each edge is the exchange rate between the respective source and target node (see this adjacent graph for an example of this). The problem of finding the optimal arbitrage path given a graph is equivalent to finding the longest path containing a cycle, a known NP-Hard problem. This means there is no known polynomial-time solution. In this project, we apply reinforcement learning techniques to approximate the Optimal Arbitrage Problem.</p>
          </div>
          <div className="text-image">
            <img src="/assets/arbitrage.jpg" alt="arbitrage" className="image" />
          </div>
        </div>
      </div>
      <div data-aos="fade-left" className="about" id="methods">
        <h2>Methods</h2>
        <hr />
        
        <p>We apply a method for solving NP-Hard problems proposed in the research paper CombOpt Zero. In their paper, they modify the techniques used by Google DeepMind’s AlphaGo Zero team. In order to do so, they rephrase the NP-Hard problem as a discrete, one player game (also known as a Markov Decision Process, or MDP), they apply Monte Carlo Tree Search to instances of their MDP to generate self-play data and fit a Graph Neural Network on the data via offline reinforcement learning. We attempt to extend their research to the Optimal Arbitrage Problem.</p>
        <h3>Optimal Arbitrage Game</h3>
        <p>A Deterministic Markov Decision Process is a rigorous way of defining a game with discrete game states. It requires the definition of a set of states, <em>S</em>, an action space (the available actions at some state) <em>A<sub>s</sub></em>, and a reward function <em>R</em>, that maps an action from a state to a real number, <em>r</em>, representing the reward for taking the action. The goal of the game is to optimize the total rewards given an initial state.
            <br></br><br></br>
            In the Optimal Arbitrage Game, a state is a currency in the graph, the action space of each state is all available trades to another currency, and the reward for an action is the logarithm of the exchange rate from one currency to another. Defining the optimal arbitrage game allows us to generate self-play data from instances of the game using Monte Carlo Tree Search.
        </p>
        <h3>Graph Convolutional Network (GCN)</h3>
        <p>In our method, we use a Graph Convolutional Network to learn a policy to solve the Optimal Arbitrage Game. Graph neutral networks are a type of neural network that can accept a graph as input. In our case, since we are training a neural network to make predictions on Optimal Arbitrage Game states, which are represented as graphs, we need to use a model that can accurately recognize graph inputs.
          <br></br><br></br>
          Our graph neural network accepts Optimal Arbitrage Game states (stored as a Pytorch Geometric Graph) as input, and produces a value and policy vector. The value vector has one index for each currency representing an estimate of the total rewards we can obtain by trading into each currency. Similarly, the policy vector represents a recommendation of with what probability to take each action.</p>

        <div className="vis-graph" data-aos="zoom-in">
          <iframe frameborder="0"
            src="https://observablehq.com/embed/@ameyasd/neighbourhoods-for-cnns-and-gnns?cells=cnn_svg%2Csvg"></iframe>
        </div>
        <div className="content-double">
          <div className="text-image">
            <img src="/assets/mcts_desc.webp" alt="method-one" className="text-image" id="mcts"/>
          </div>
          <div className="text">
            <h3>Monte Carlo Tree Search</h3>
            <p>MCTS is a computationally intensive algorithm used to find a policy from an initial game state. It does so in a similar way you’d think about a chain of possible moves in a game like chess. Following a specified formula, in this case the Upper Confidence Bound (UCB), it considers different actions from the initial game state and keeps track of the rewards generated from choosing each option. In doing so, the algorithm forms a decision tree (see the adjacent figure) of all moves it has considered, hence the name. After running for a specified number of iterations, the algorithm outputs a policy for the initial state, which is a recommendation of the probability with which each move should be taken. In our case, this algorithm incorporates the policy and value predictions from our graph neural network, and returns an enhanced policy recommendation that we use to tune the network’s policy vector.</p>

          </div>
        </div>
        <div className="content-double">
        <div className="text">
            <h3>Training</h3>
            <p>There are two major components to our training system: a data generation system and a model evaluator.  Before running, we initialize an untrained Graph Convolutional Network, <em>f</em>.
            <br></br><br></br>
              The goal of the data generator is to collect samples of the form <em>(S, A, &pi;, R)</em>. Here, <em>A</em> is the action taken from state <em>S</em> chosen according to the MCTS enhanced policy, <em>&pi;</em>, and <em>R</em> is the cumulative reward generated from <em>S</em>. The data generator does so by initializing random instances of Optimal Arbitrage Game objects <em>(S)</em>, and running MCTS with <em>f</em> to generate an enhanced policy, <em>&pi;</em>. It samples the action, <em>A</em> from <em>&pi;</em> receiving a reward, <em>r</em>. This is repeated until the game reaches a terminal state, and each sample is saved. 
            <br></br><br></br>
              After doing so for a specified number of graphs, <em>f</em> is trained on randomly sampled batches of the data using MSE loss to fit its value vector on <em>R</em>, and CrossEntropy loss to fit its policy vector to <em>&pi;</em>, obtaining a trained model, <em>f<sub>1</sub></em>. The model evaluator compares the average performance of <em>f</em> and <em>f<sub>1</sub></em> on random game instances, and keeps the better performer. The entire system then repeats, using the better of the two models.
            </p>
            
          </div>
          <div className="text-image">
            <img src="/assets/Training.webp" alt="Training" className="text-image" id="training"/>
          </div>
        </div>
      </div>
      <div data-aos="fade-right" className="about" id="results">
        <h2>Results</h2>
        <hr />
        <div className="content-double">
          <div className="text">
            <p>The model was trained for 72 hours in total, and saved in 24 hour intervals. The cumulative average performance of each model was recorded over 50 runs on 1000 random Games.
              As seen in the adjacent cumulative reward graph, the model clearly outperforms the randomly generated paths. Further, each successive training cycle also showed evident improvement, indicating convergence toward a solution to the Optimal Arbitrage Problem. 
              <br></br><br></br>
              Overall, we consider our results to be a success, with justification to further explore our techniques using more compute. This is particularly important considering the restraints faced as we were training the model on a Mac M1. An analogous model, DeepMind's AlphaGo Zero, took 41 TPU years to reach superhuman ability, costing them over $35 million.
              </p>
          </div>
          <div className="text-image">
            <img src="/assets/results.jpg" alt="results" className="text-image" id="results"/>
            
          </div>
        </div>
        <div className="content-double">
        <div className="text-image">
            <img src="/assets/Speed_tables_CUCAI.png" alt="results" className="text-image" id="results"/>
          </div>
          <div className="text">
            <p>
              Due to the high volatility of cryptocurrency markets, another key metric of success for this project is the speed at which the model was able to predict these paths. A deterministic solution to the problem, Depth First Search, took over 20 minutes to find a path for a model with just 15 nodes. In contrast, our model was able to predict arbitrage paths for graphs with 500 nodes with an average time of under a tenth of a second.
              <br></br><br></br>
              Future research would include testing different GNN architectures, and training on graphs more specialized to currency markets. Finally, additional research like maximum model drawdown would need to be analyzed before it is used in live trading.
            </p>
          </div>
        </div>
      </div>
      <div data-aos="fade-up" data-aos-duration="1000">
        <a
          href="https://www.overleaf.com/project/65c2dc3d38eab49cd8ba2af9"
          className="btn btn-more"
          target="_blank"
          >Learn More <i className="fas fa-chevron-right"></i></a>
      </div>
      {isPopupVisible && (
        <div className="popup visible">
          <h3>Authors</h3>
          <hr />
          <a href="https://www.linkedin.com/in/mitchell-sabbadini/" target="_blank">Mitchell Sabbadini</a>
          <a href="https://www.linkedin.com/in/armin-heirani-871141217/" target="_blank">Armin Heirani</a>
          <a href="https://www.linkedin.com/in/colin-gould15/" target="_blank">Colin Gould</a>
          <a href="https://www.linkedin.com/in/elliotthoburn/" target="_blank">Elliot Thoburn</a>
          <a href="https://www.linkedin.com/in/isaiahiruoha/" target="_blank">Isaiah Iruoha</a>
          <a href="https://www.linkedin.com/in/daryanfadavi/" target="_blank">Daryan Fadavi</a>
          <a href="https://www.linkedin.com/in/john-liu-1720b2266/" target="_blank">John Liu</a>
        </div>
      )}
      <div className="icon-background" onClick={togglePopup}>
        <svg className={`authors ${isPopupVisible ? 'rotate' : ''}`} fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
        viewBox="0 0 964.07 964.07" xml:space="preserve">
      <g>
        <path d="M850.662,877.56c-0.77,0.137-4.372,0.782-10.226,1.831c-230.868,41.379-273.337,48.484-278.103,49.037
          c-11.37,1.319-19.864,0.651-25.976-2.042c-3.818-1.682-5.886-3.724-6.438-4.623c0.268-1.597,2.299-5.405,3.539-7.73
          c1.207-2.263,2.574-4.826,3.772-7.558c7.945-18.13,2.386-36.521-14.51-47.999c-12.599-8.557-29.304-12.03-49.666-10.325
          c-12.155,1.019-225.218,36.738-342.253,56.437l-57.445,45.175c133.968-22.612,389.193-65.433,402.622-66.735
          c11.996-1.007,21.355,0.517,27.074,4.4c3.321,2.257,2.994,3.003,2.12,4.997c-0.656,1.497-1.599,3.264-2.596,5.135
          c-3.835,7.189-9.087,17.034-7.348,29.229c1.907,13.374,11.753,24.901,27.014,31.626c8.58,3.78,18.427,5.654,29.846,5.654
          c4.508,0,9.261-0.292,14.276-0.874c9.183-1.065,103.471-17.67,280.244-49.354c5.821-1.043,9.403-1.686,10.169-1.821
          c9.516-1.688,15.861-10.772,14.172-20.289S860.183,875.87,850.662,877.56z"/>
        <path d="M231.14,707.501L82.479,863.005c-16.373,17.127-27.906,38.294-33.419,61.338l211.087-166.001
          c66.081,29.303,118.866,38.637,159.32,38.637c71.073,0,104.065-28.826,104.065-28.826c-66.164-34.43-75.592-98.686-75.592-98.686
          c50.675,21.424,156.235,46.678,156.235,46.678c140.186-93.563,213.45-296.138,213.45-296.138
          c-14.515,3.99-28.395,5.652-41.475,5.652c-65.795,0-111-42.13-111-42.13l183.144-39.885C909.186,218.71,915.01,0,915.01,0
          L358.176,495.258C295.116,551.344,250.776,625.424,231.14,707.501z"/>
        </g>
        </svg>
      </div> 
    </div>
  );
}

export default App;