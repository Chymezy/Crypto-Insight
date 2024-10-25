import React, { ReactNode } from 'react';
import BackgroundAnimation from './BackgroundAnimation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <BackgroundAnimation />
      {children}
    </div>
  );
};

export default Layout;
