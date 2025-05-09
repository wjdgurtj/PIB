import React from 'react';
import '../styles/Header.css';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <div className="header">
      <Link to="/" className="App-link">Home</Link>
      <Link to="/Login" className="App-link">login</Link>
    </div>
  );
}

export default Header;
