import React, { useState } from 'react';
import '../styles/PostView.css';
import { FaHeart, FaRegComment } from 'react-icons/fa';
import background from '../assets/background.png'

function PostView() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      name: '이름',
      date: '2025년 7월 26일 09:17',
      text: '댓글댓글댓글',
    },
    {
      name: '이름',
      date: '2025년 7월 26일 09:17',
      text: '댓글댓글댓글',
    },
  ]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? 0 : 1);
  };

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    const now = new Date();
    const newEntry = {
      name: '이름',
      date: `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      text: newComment,
    };
    setComments([...comments, newEntry]);
    setNewComment('');
  };

  const images = [
    '/assets/img1.jpg',
    '/assets/img2.jpg',
    '/assets/img3.jpg',
    '/assets/img4.jpg',
    '/assets/img4.jpg',
  ];

  return (
    <div   
        style={{
        backgroundImage: `url(${background})`,
        backgroundSize: '500px auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'top left',
        minHeight: '100vh',
      }}>
        <div className= "community-wrapper">
          <div className="post-view-container">
          <div className="post-header">
            <p className="meta-line">
              <span className="author">작성자</span>
              <span className="date">7월 26일</span>
            </p>
            <h2 className="title">제목</h2>
            <p className="content">
              내용내용내용내용 <br />
              내용내용내용내용
            </p>
          </div>

          <div className="image-scroll-wrapper">
            <div className="image-scroll">
              {images.map((src, idx) => (
                <img key={idx} src={src} alt={`img-${idx}`} className="post-image" />
              ))}
            </div>
          </div>

          <hr className="divider" />
          <div className="reactions">
            <div className="like-button" onClick={handleLike}>
              <FaHeart color={liked ? 'red' : 'lightgray'} />
              <span>{likeCount}</span>
            </div>
            <div>
              <FaRegComment color="gray" />
              <span>{comments.length}</span>
            </div>
          </div>

          <div className="comments">
            {comments.map((comment, idx) => (
              <div className="comment" key={idx}>
                <p className="comment-author">
                  {comment.name} <span className="comment-date">{comment.date}</span>
                </p>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}

            {/* 댓글 입력창 */}
            <div className="comment-input-wrapper">
              <input
                className="comment-input"
                type="text"
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment();
                  }
                }}
              />
              <button className="comment-button" onClick={handleAddComment}>
                댓글달기
              </button>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
}

export default PostView;
