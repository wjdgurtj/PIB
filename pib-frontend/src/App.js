import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Community from './pages/Community';
import Map from './pages/Map';
import Shop from './pages/Shop';
import PopularPosts from './pages/PopularPosts';
import MyPosts from './pages/MyPosts';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />

        {/* 페이지 라우팅 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<Community />} />
          <Route path="/map" element={<Map />} />
          <Route path="/shop" element={<Shop />} />
          <Route path='/login' element=
          {<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/popular-posts' element={<PopularPosts />} />
          <Route path='/my-posts' element={<MyPosts />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
