import React, { useState } from 'react';
import '../styles/Signup.css';

function Signup() {
  const [form, setForm] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: form.id,
          password: form.password,
          nickname: form.nickname,
          phone: form.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("회원가입 성공!");
        // TODO: 로그인 페이지 이동
      } else {
        alert("회원가입 실패: " + data.detail);
      }
    } catch (error) {
      alert("에러 발생: " + error.message);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSubmit}>
        <h2>회원가입</h2>

        <label>아이디</label>
        <input type="text" name="id" value={form.id} onChange={handleChange} required />

        <label>비밀번호</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        <label>비밀번호 확인</label>
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />

        <label>닉네임</label>
        <input type="text" name="nickname" value={form.nickname} onChange={handleChange} required />

        <label>전화번호</label>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />

        <button type="submit" className="signup-button">회원가입</button>
      </form>
    </div>
  );
}

export default Signup;
