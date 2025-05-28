import React, { useState } from 'react';
import '../styles/WritePost.css';
import background from '../assets/background.png';

function WritePost() {
  const [form, setForm] = useState({ title: '', content: '' });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImages([...images, { file, preview: imageURL }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    console.log(images);
    // 여기에 백엔드로 전송하는 코드 작성 가능
  };

  const handleImageDelete = (index) => {
  const newImages = [...images];
  URL.revokeObjectURL(newImages[index].preview); // 메모리 누수 방지
  newImages.splice(index, 1);
  setImages(newImages);
};

  return (
    <div   
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: '500px auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left',
        minHeight: '100vh',
      }}>
      <div className="container-wrapper">
        <div className="write-post-container">
          <h2>글 작성하기</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>제목</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>내용</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
              />
            </div>

            <div className="image-upload-section">
              <label>사진추가</label>
              <div className="image-boxes">
                {images.map((imgObj, idx) => (
                    <div className="image-box preview" key={idx}>
                        <img src={imgObj.preview} alt={`preview-${idx}`} />
                        <button className="delete-btn" onClick={() => handleImageDelete(idx)}>×</button>
                    </div>
                    ))}
                <label className="image-box add">
                  <span>＋</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            <button type="submit">작성하기</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default WritePost;
