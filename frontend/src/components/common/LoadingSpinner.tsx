import React from 'react'; // React for JSX and component-based UI  

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen"> {/* Styled div to center the spinner */}
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div> {/* Spinning loading spinner */}
  </div>
);

export default LoadingSpinner; // Export the LoadingSpinner component as default