import React, { useContext, useState } from 'react';
import '../styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // 로그인 성공 후 페이지 이동
  const { login } = useContext(AuthContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // 에러 초기화

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // ✅ JSON 형식으로 변경
        body: JSON.stringify({ username: id, password: pw }), // ✅ JSON 데이터 전송
      });

      const data = await response.json();
      console.log("백엔드 응답 데이터:", data);  // ✅ 응답 확인!

      if (response.ok) {  // ✅ `data.success`가 True인지 확인
        alert("로그인 성공!");
        localStorage.setItem("user", JSON.stringify({username: id, nickname: data.nickname})); // ✅ 사용자 정보 저장
        login({ username: id, nickname: data.nickname });
        navigate("/"); // 로그인 성공 시 페이지 이동
      } else {
        setError(data.detail || data.message);
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.")
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
          {error && <p className="error-text">{error}</p>} {/* 에러 메시지 표시 */}
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