import React, { ReactNode } from 'react'; // Import ReactNode type
import Header from './Layout/Header'; // Update the import path if necessary
import Footer from './Layout/Footer'; // Import Footer if you have one

interface LayoutProps {
  children: ReactNode; // Define children prop
}

const Layout: React.FC<LayoutProps> = ({ children }) => { // Accept children as a prop
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children} {/* Render children here */}
      </main>
      <Footer /> {/* Include Footer if you have one */}
    </div>
  );
};

export default Layout;