import React, { useState } from 'react';
import '../styles/Login.css';
import { Link } from 'react-router-dom';

function Login() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: id,
          password: pw
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${data.nickname}님 환영합니다!`);
        // ✅ 로그인 성공 후 원하는 페이지로 이동하거나 토큰 저장 등 처리 가능
        // 예: window.location.href = '/home';
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "로그인 실패");
      }

    } catch (err) {
      alert("서버 연결 실패");
    }
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
