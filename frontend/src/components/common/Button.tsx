import React from 'react'; // React for JSX and component-based UI

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', disabled, ...props }) => {
  return (
    <button
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : '' // Disabled state styling
      } ${className}`} // Additional classes
      disabled={disabled} // Disabled attribute
      {...props} // Spread remaining props
    >
      {children}
    </button>
  );
};

export default Button; // Export the Button component as default