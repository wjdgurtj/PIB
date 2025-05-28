import React, { useState } from 'react';
import '../styles/Login.css';
import { Link } from 'react-router-dom';

function Login() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`ID: ${id}, PW: ${pw}`);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input 
              type="text" 
              placeholder="아이디를 입력해주세요" 
              value={id} 
              onChange={(e) => setId(e.target.value)} 
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="비밀번호를 입력해주세요" 
              value={pw} 
              onChange={(e) => setPw(e.target.value)} 
            />
          </div>
          <button type="submit" className="login-button">로그인</button>
        </form>
        <p className="signup-text">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="signup-link">가입하기</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;