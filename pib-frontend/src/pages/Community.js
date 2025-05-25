import React, { useState, useEffect } from 'react';
import '../styles/Community.css';
import pibLogo from '../assets/piblogo.png';
import background from '../assets/background.png'
import { Link } from 'react-router-dom';



function Community() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState('latest');
  const postsPerPage = 8;

const titles = [
  '강아지가 밥을 안 먹어요', '산책 나가면 자꾸 멈춰요', '배변 훈련이 안 돼요', '사료 추천 좀 해주세요', '강아지가 자꾸 짖어요',
  '눈물 자국 관리법', '산책 리드 추천', '다른 강아지랑 잘 못 어울려요', '슬개골 탈구 증상?', '입 냄새가 심해요',
  '강아지 샴푸 추천', '중성화 수술 고민돼요', '강아지랑 여행 가도 될까요?', '간식 너무 많이 줘도 되나요?', '덩치 큰 강아지랑 지내는 법',
  '털 빠짐 심할 때 대처법', '강아지 생일 어떻게 챙기세요?', '반려견 보험 필요할까요?', '강아지 장난감 추천해주세요', '혼자 두면 불안해해요'
];

const contents = [
  '요즘 사료를 줘도 잘 안 먹네요. 이유가 뭘까요?',
  '산책할 때 몇 걸음 걷다가 멈추고 앉아버려요. 무슨 이유일까요?',
  '배변 패드 위에 안 보고 아무 데나 실수해요. 훈련 팁 있을까요?',
  '소형견에게 맞는 사료 브랜드나 제품 추천 부탁드려요.',
  '초인종 소리만 나면 계속 짖어요. 어떻게 해야 하나요?',
  '하얀 강아지 눈물 자국이 너무 심해서 관리법 궁금해요.',
  '튼튼하고 줄꼬임 없는 산책 리드 추천해주실 분 계신가요?',
  '다른 강아지를 보면 도망가거나 으르렁거려요. 사회화 어떻게 시켜야 할까요?',
  '슬개골 탈구가 의심되는데 어떤 증상이 보이나요?',
  '입 냄새가 심해서 양치도 해주는데 효과가 없네요. 다른 방법 있을까요?',
  '피부에 자극 없는 샴푸 뭐 쓰세요? 추천해주세요!',
  '중성화 수술을 해야 할지 말지 고민 중인데 조언 부탁드려요.',
  '차 타고 강아지랑 여행 가도 괜찮을까요? 준비물도 알려주세요!',
  '간식을 너무 좋아해서 자주 주게 되는데 괜찮은 걸까요?',
  '우리 집 강아지가 다른 큰 강아지를 무서워해요. 어떻게 적응시켜야 할까요?',
  '털이 요즘 너무 많이 빠져요. 대처법 있을까요?',
  '강아지 생일 어떻게 챙기시나요? 아이디어 좀 주세요!',
  '혹시 반려견 보험 가입하신 분 계신가요? 실속 있는지 궁금해요.',
  '지루하지 않게 해줄 장난감 추천해주세요!',
  '외출할 때마다 불안해서 짖고 우는 것 같아요. 어떻게 하면 좋을까요?'
];


  const authors = [
    '현지', '민수', '지우', '정우', '수빈', '은지', '도윤', '지은', '하준', '예린',
    '서연', '태현', '주아', '승호', '나영', '연우', '시은', '건우', '소율', '지환'
  ];

  const posts = [...Array(20)].map((_, i) => ({
    id: i,
    title: titles[i],
    content: contents[i],
    author: authors[i],
    date: `2025-05-${(i % 30 + 1).toString().padStart(2, '0')}`,
    views: Math.floor(Math.random() * 500) + 1
  }));

  const sortPosts = (posts, type) => {
    return [...posts].sort((a, b) => {
      if (type === 'latest') {
        return new Date(b.date) - new Date(a.date);
      } else if (type === 'popular') {
        return b.views - a.views;
      }
      return 0;
    });
  };

  useEffect(() => {
    setFilteredPosts(sortPosts(posts, sortType));
  }, [sortType]);

  const handleSearch = () => {
    const keyword = searchTerm.toLowerCase();
    const result = posts.filter(
      post => post.title.toLowerCase().includes(keyword) ||
              post.content.toLowerCase().includes(keyword)
    );
    setFilteredPosts(sortPosts(result, sortType));
    setCurrentPage(1);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
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

      <div className= "community-wrapper">
        <div className="community-container" >
          <h2 className="board-title">Q&amp;A 게시판</h2>

          <div className="search-bar">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>검색</button>
            <Link to="/writepost"><button className="write-button">글쓰기</button></Link>
          </div>

          <div className="sort-options">
            <label>
              <input
                type="radio"
                name="sort"
                checked={sortType === 'latest'}
                onChange={() => setSortType('latest')}
              />
              최신순
            </label>
            <label>
              <input
                type="radio"
                name="sort"
                checked={sortType === 'popular'}
                onChange={() => setSortType('popular')}
              />
              인기순
            </label>
          </div>

          <div className="post-header">
            <div className="post-header-left">내용</div>
            <div className="post-header-right">
              <div>날짜</div>
              <div>조회수</div>
            </div>
          </div>

          <div className="post-list">
            {currentPosts.map((post) => (
              <div className="post-item" key={post.id}>
                <div className="post-left">
                  <Link to="/postview"><div className="post-title">{post.title}</div></Link>
                  <div className="post-content">{post.content}</div>
                  <div className="post-footer">{post.author}</div>
                </div>
                <div className="post-right">
                  <img src={pibLogo} alt="썸네일" className="thumbnail" />
                  <div className="post-meta">
                    <div className="meta-date">{post.date}</div>
                    <div className="meta-views">{post.views}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <span onClick={() => handlePageClick(Math.max(1, currentPage - 1))}>&lt;</span>
            {[...Array(totalPages)].map((_, i) => (
              <span
                key={i}
                onClick={() => handlePageClick(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </span>
            ))}
            <span onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}>&gt;</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Community;