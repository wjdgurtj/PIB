import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/piblogo.png';
import { AuthContext } from '../context/AuthContext';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');  // 로그아웃 후 홈으로 이동
  };

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <img src={logo} alt="PIB Logo" />
      </Link>

      <nav className="header__nav">
        <Link to="/community" className="header__link">커뮤니티</Link>
        <Link to="/map" className="header__link">지도</Link>
        <Link to="/shop" className="header__link">쇼핑</Link>
      </nav>

      <div className="header__auth">
        {user ? (
          <>
            <span className="header__welcome">{user.nickname}님 환영합니다!</span>
            <button onClick={handleLogout} className="header__button">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="header__button">로그인</Link>
            <Link to="/signup" className="header__button">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
