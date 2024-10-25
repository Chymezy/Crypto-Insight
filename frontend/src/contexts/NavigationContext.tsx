import React, { createContext, useState, useContext, ReactNode } from 'react';

type Section = 'portfolio' | 'market' | 'news' | 'social' | 'alerts' | 'ai' | 'swap' | 'wallet' | 'transactions';

interface NavigationContextType {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<Section>('portfolio');

  return (
    <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
