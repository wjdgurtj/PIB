import React, { createContext, useState, useEffect } from 'react';

// Context 생성 및 초기값 설정
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 페이지 새로고침 시 localStorage에서 복원 (방어적 파싱)
  useEffect(() => {
    const stored = localStorage.getItem('user');
    let parsed = null;
    if (stored && stored !== 'undefined') {
      try {
        parsed = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse stored user:', e);
      }
    }
    if (parsed) {
      setUser(parsed);
    }
  }, []);

  // 로그인 함수: userData 객체를 세팅하고 localStorage에 저장
  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to store user data:', e);
    }
  };

  // 로그아웃 함수: state 및 localStorage 초기화
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
