import React from 'react';
import './CryptoAnimation.css'; // Make sure to create this CSS file

const CryptoAnimation: React.FC = () => {
  return (
    <div className="crypto-animation-container">
      <svg viewBox="0 0 100 50" className="crypto-chart">
        <polyline
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          points="0,25 20,15 40,30 60,10 80,20 100,5"
          className="chart-line"
        />
      </svg>
      <div className="crypto-symbols">
        <span className="symbol bitcoin">₿</span>
        <span className="symbol ethereum">Ξ</span>
        <span className="symbol litecoin">Ł</span>
      </div>
    </div>
  );
};

export default CryptoAnimation;
