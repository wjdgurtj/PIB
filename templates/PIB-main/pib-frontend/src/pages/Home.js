import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

// 슬라이드 이미지들 import
import slide1 from '../assets/slide1.jpg';
import slide2 from '../assets/slide2.jpeg';
import slide3 from '../assets/slide3.jpg';

function Home() {
  const slides = [slide1, slide2, slide3];
  const [current, setCurrent] = useState(0);
  const [isFading, setIsFading] = useState(true);

  useEffect(() => {
    // 첫 로드 시 페이드-인
    const initFade = setTimeout(() => setIsFading(false), 100);
    // 주기적으로 페이드-아웃 → 이미지 교체 → 페이드-인
    const interval = setInterval(() => {
      setIsFading(true);                // 페이드-아웃 시작
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % slides.length);
        setIsFading(false);             // 페이드-인
      }, 1500);                         // 이 값이 페이드 지속 시간과 맞닿음
    }, 8000);                           // 8초마다 슬라이드 전환

    return () => {
      clearTimeout(initFade);
      clearInterval(interval);
    };
  }, [slides.length]);

  return (
    <div className="home-container">
      <h1 className="welcome-text">
        Puppy is the best! PIB 홈페이지에 오신 것을 환영합니다
      </h1>

      <div className="carousel-container">
        <img
          src={slides[current]}
          alt={`slide ${current + 1}`}
          className={`carousel-image ${isFading ? 'fade-out' : 'fade-in'}`}
        />
      </div>

      <div className="sections">
        <Link to="/popular-posts" className="section-box">
          <h2>인기 게시글</h2>
        </Link>
        <Link to="/my-posts" className="section-box">
          <h2>내가 작성한 글</h2>
        </Link>
      </div>
    </div>
  );
}

export default Home;
