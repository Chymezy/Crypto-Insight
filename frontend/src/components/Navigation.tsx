import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        {/* Add other navigation items */}
      </ul>
    </nav>
  );
};

export default Navigation;
