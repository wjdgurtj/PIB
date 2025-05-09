import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/Login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
