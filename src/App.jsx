import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TradingAssistant from './components/TradingAssistant';
import LiveTradingPage from './components/LiveTradingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Routes>
          <Route path="/" element={<TradingAssistant />} />
          <Route path="/live-trading" element={<LiveTradingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;