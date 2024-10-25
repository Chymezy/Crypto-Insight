import React from 'react';
import { FaChartPie, FaChartLine, FaNewspaper, FaUsers, FaBell, FaRobot, FaExchangeAlt, FaWallet, FaHistory } from 'react-icons/fa';
import { useNavigation } from '../contexts/NavigationContext';

const navItems = [
  { name: 'Portfolio', icon: FaChartPie, section: 'portfolio' },
  { name: 'Market', icon: FaChartLine, section: 'market' },
  { name: 'News', icon: FaNewspaper, section: 'news' },
  { name: 'Social', icon: FaUsers, section: 'social' },
  { name: 'Alerts', icon: FaBell, section: 'alerts' },
  // Add more items as needed
];

const MobileNavigation: React.FC = () => {
  const { activeSection, setActiveSection } = useNavigation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 flex justify-around items-center p-2">
      {navItems.map(({ name, icon: Icon, section }) => (
        <button
          key={section}
          onClick={() => setActiveSection(section as any)}
          className={`flex flex-col items-center p-2 ${
            activeSection === section ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <Icon size={20} />
          <span className="text-xs mt-1">{name}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNavigation;
