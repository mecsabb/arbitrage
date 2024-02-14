import React, { useState } from 'react';
import './App.css';

function App() {
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State to track popup visibility

  // Function to toggle popup visibility
  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  return (
    <div className="container">
      <nav>
        <ul className="nav-links">
          <li className="upward"><a href="#">Home</a></li>
          <li className="upward"><a href="#implementation">Implementation</a></li>
          <li className="upward"><a href="#arbitrage">Arbitrage</a></li>
          <li className="upward"><a href="#methods">Methods</a></li>
        </ul>
      </nav>
      <div className="content-box">
        <div className="content">
          <div className="text">
            <h2>A Reinforcement Learning Approach to Finding Cryptocurrency Arbitrage Paths</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut varius turpis ante, nec varius nisi vehicula a. Suspendisse congue bibendum turpis, eget malesuada risus posuere quis. Nam condimentum libero vestibulum lacus cursus condimentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut varius turpis ante, nec varius nisi vehicula a. Suspendisse congue bibendum turpis, eget malesuada risus posuere quis. Nam condimentum libero vestibulum lacus cursus condimentum.</p>
            <div className="card">
                <button>
                  <a href="/kraken-test">Generate Optimal Path</a>
                </button>
            </div>
          </div>
          <div className="image">
            <img src="/assets/cryptorobot.jpg" alt="Your Image" className={`image ${isPopupVisible ? 'spin' : ''}`} />
          </div>
        </div>
      </div>
      <div className="about" id="implementation">
        <h2>Implementation</h2>
        <hr />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet purus bibendum, auctor lacus in, euismod dolor. Vivamus a consequat odio, vitae dictum nisl. Etiam ullamcorper mollis lacus eu dictum. Quisque eleifend, est a porttitor congue, lectus lorem imperdiet dui, vitae iaculis orci arcu quis leo. Sed at cursus ante. Ut arcu massa, finibus quis odio ut, dignissim cursus enim. Nulla tempor id lectus sed venenatis. Fusce semper neque suscipit nunc volutpat, vel vehicula ligula hendrerit. Pellentesque commodo justo odio, vel ultrices augue maximus ac. Duis eget orci at lorem mollis finibus. Donec vel enim arcu. Sed a neque nulla. Praesent congue quam non faucibus lacinia. Cras tristique sem risus, non laoreet arcu aliquam non. Morbi dictum maximus massa.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eget justo lorem. Vivamus id aliquam risus. Integer et risus ligula. Nunc ac leo risus. Duis scelerisque erat sit amet rutrum posuere. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque eget porta ante. Nullam tempor consequat ex, ac auctor eros luctus viverra. Curabitur dui dui, volutpat quis tempus non, finibus sed nulla. Morbi pretium dolor lectus. Mauris bibendum laoreet dui, ac pulvinar dui cursus at. Maecenas quis ex elit. Ut ac dictum sem. Cras lacinia tempor est sollicitudin ullamcorper. Mauris sed nisi ut justo porta iaculis.

Nulla facilisi. Ut blandit scelerisque pellentesque. Nullam id egestas lectus. Curabitur tristique magna sapien, eget dictum risus dictum varius. Nulla faucibus urna ut nibh fermentum mattis. Phasellus molestie imperdiet nunc, id pellentesque nisl cursus sit amet. Nulla vitae hendrerit nibh. Proin faucibus lacus non porttitor lacinia. Sed sagittis laoreet felis, a posuere risus sollicitudin quis. Sed auctor vitae quam ac feugiat. Pellentesque sapien lacus, luctus id dolor at, malesuada molestie sapien. Mauris quis malesuada massa, ut sollicitudin erat.</p>
      </div>
      <div className="about" id="arbitrage">
        <h2>Arbitrage</h2>
        <hr />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet purus bibendum, auctor lacus in, euismod dolor. Vivamus a consequat odio, vitae dictum nisl. Etiam ullamcorper mollis lacus eu dictum. Quisque eleifend, est a porttitor congue, lectus lorem imperdiet dui, vitae iaculis orci arcu quis leo. Sed at cursus ante. Ut arcu massa, finibus quis odio ut, dignissim cursus enim. Nulla tempor id lectus sed venenatis. Fusce semper neque suscipit nunc volutpat, vel vehicula ligula hendrerit. Pellentesque commodo justo odio, vel ultrices augue maximus ac. Duis eget orci at lorem mollis finibus. Donec vel enim arcu. Sed a neque nulla. Praesent congue quam non faucibus lacinia. Cras tristique sem risus, non laoreet arcu aliquam non. Morbi dictum maximus massa.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eget justo lorem. Vivamus id aliquam risus. Integer et risus ligula. Nunc ac leo risus. Duis scelerisque erat sit amet rutrum posuere. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque eget porta ante. Nullam tempor consequat ex, ac auctor eros luctus viverra. Curabitur dui dui, volutpat quis tempus non, finibus sed nulla. Morbi pretium dolor lectus. Mauris bibendum laoreet dui, ac pulvinar dui cursus at. Maecenas quis ex elit. Ut ac dictum sem. Cras lacinia tempor est sollicitudin ullamcorper. Mauris sed nisi ut justo porta iaculis.

Nulla facilisi. Ut blandit scelerisque pellentesque. Nullam id egestas lectus. Curabitur tristique magna sapien, eget dictum risus dictum varius. Nulla faucibus urna ut nibh fermentum mattis. Phasellus molestie imperdiet nunc, id pellentesque nisl cursus sit amet. Nulla vitae hendrerit nibh. Proin faucibus lacus non porttitor lacinia. Sed sagittis laoreet felis, a posuere risus sollicitudin quis. Sed auctor vitae quam ac feugiat. Pellentesque sapien lacus, luctus id dolor at, malesuada molestie sapien. Mauris quis malesuada massa, ut sollicitudin erat.</p>
      </div>
      <div className="about" id="methods">
        <h2>Methods</h2>
        <hr />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet purus bibendum, auctor lacus in, euismod dolor. Vivamus a consequat odio, vitae dictum nisl. Etiam ullamcorper mollis lacus eu dictum. Quisque eleifend, est a porttitor congue, lectus lorem imperdiet dui, vitae iaculis orci arcu quis leo. Sed at cursus ante. Ut arcu massa, finibus quis odio ut, dignissim cursus enim. Nulla tempor id lectus sed venenatis. Fusce semper neque suscipit nunc volutpat, vel vehicula ligula hendrerit. Pellentesque commodo justo odio, vel ultrices augue maximus ac. Duis eget orci at lorem mollis finibus. Donec vel enim arcu. Sed a neque nulla. Praesent congue quam non faucibus lacinia. Cras tristique sem risus, non laoreet arcu aliquam non. Morbi dictum maximus massa.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eget justo lorem. Vivamus id aliquam risus. Integer et risus ligula. Nunc ac leo risus. Duis scelerisque erat sit amet rutrum posuere. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque eget porta ante. Nullam tempor consequat ex, ac auctor eros luctus viverra. Curabitur dui dui, volutpat quis tempus non, finibus sed nulla. Morbi pretium dolor lectus. Mauris bibendum laoreet dui, ac pulvinar dui cursus at. Maecenas quis ex elit. Ut ac dictum sem. Cras lacinia tempor est sollicitudin ullamcorper. Mauris sed nisi ut justo porta iaculis.

Nulla facilisi. Ut blandit scelerisque pellentesque. Nullam id egestas lectus. Curabitur tristique magna sapien, eget dictum risus dictum varius. Nulla faucibus urna ut nibh fermentum mattis. Phasellus molestie imperdiet nunc, id pellentesque nisl cursus sit amet. Nulla vitae hendrerit nibh. Proin faucibus lacus non porttitor lacinia. Sed sagittis laoreet felis, a posuere risus sollicitudin quis. Sed auctor vitae quam ac feugiat. Pellentesque sapien lacus, luctus id dolor at, malesuada molestie sapien. Mauris quis malesuada massa, ut sollicitudin erat.</p>
      </div>
      {isPopupVisible && (
        <div className="popup visible">
          <h3>Authors</h3>
          <hr />
          <p>Mitchell Sabbadinil</p>
          <p>Armin Heirani</p>
          <p>Colin Gould</p>
          <p>Elliot Thoburn</p>
          <p>Isaiah Iruoha</p>
          <p>Daryan Fadavi</p>
          <p>John Liu</p>
        </div>
      )}
      <div className="icon-background" onClick={togglePopup}>
       <img src="/assets/author.svg" alt="authors" className={`authors ${isPopupVisible ? 'rotate' : ''}`} />
      </div>
      {/* 
        add a learn more button to take you to page */}
    </div>
  );
}

export default App;
