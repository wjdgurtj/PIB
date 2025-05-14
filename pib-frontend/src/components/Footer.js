import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="members">
        <div className="column">
          <h4>Frontend</h4>
          <p>202304389 신현지</p>
          <p>202402741 이찬혁</p>
        </div>
        <div className="column">
          <h4>Backend</h4>
          <p>202201737 서정혁</p>
          <p>202203240 정준수</p>
        </div>
      </div>

      <div className="footer-meta">
        <p>© 2025 PIB Team.</p>
        <p>Open Source Software | Instructor: Prof. Byeonghwan Jeon</p>
        <p>
          <a href="https://github.com/chxn01" target="_blank" rel="noopener noreferrer">
            chxn01
          </a> &nbsp;|&nbsp;
          <a href="https://github.com/dkvled" target="_blank" rel="noopener noreferrer">
            dkvled
          </a> &nbsp;|&nbsp;
          <a href="https://github.com/wjdgurtj" target="_blank" rel="noopener noreferrer">
            wjdgurtj
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
