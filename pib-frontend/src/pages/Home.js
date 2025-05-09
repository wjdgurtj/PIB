import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home">
      <h1>홈화면</h1>
      <Link to="/Login">
        <button className="home-button">Login</button>
      </Link>
    </div>
  );
}

export default Home;
