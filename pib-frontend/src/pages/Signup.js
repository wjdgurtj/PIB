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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    alert(`회원가입 정보: ${JSON.stringify(form, null, 2)}`);
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
