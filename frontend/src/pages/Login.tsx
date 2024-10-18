import React, { useState } from 'react'; // React for JSX and component-based UI  
import { Link, useNavigate } from 'react-router-dom'; // React Router for navigation
import { motion } from 'framer-motion'; // Framer Motion for animations
import { toast } from 'react-toastify'; // Toast notifications
import Button from '../components/common/Button'; // Button component
import { useAuth } from '../contexts/AuthContext'; // Custom hook for authentication
// import { forgotPassword } from '../services/api'; // Change this line
import { forgotPassword } from '../services/authService';

const Login: React.FC = () => { // Login component
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password
  const [error, setError] = useState<string | null>(null); // State for error message
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const navigate = useNavigate(); // Navigation hook
  const { login } = useAuth(); // Authentication hook
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/portfolio');
    } catch (err) {
      toast.error('Failed to login. Please check your credentials and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(forgotPasswordEmail);
      toast.success('Password reset instructions sent to your email.');
      setIsForgotPassword(false);
    } catch (err) {
      toast.error('Failed to send reset instructions. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-20 px-4"
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-white">
        {isForgotPassword ? 'Forgot Password' : 'Welcome Back'}
      </h1>
      <motion.form 
        onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} 
        className="bg-gray-800 p-8 rounded-lg shadow-lg"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {error && (
          <motion.p 
            className="text-red-500 mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
        
        {isForgotPassword ? (
          <div className="mb-6">
            <label htmlFor="forgotPasswordEmail" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="forgotPasswordEmail"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </>
        )}
        
        <Button type="submit" className="w-full mb-4" disabled={isLoading}>
          {isLoading ? 'Processing...' : (isForgotPassword ? 'Send Reset Instructions' : 'Login')}
        </Button>
        
        <p className="text-center text-gray-400">
          {isForgotPassword ? (
            <>
              Remember your password? <button onClick={() => setIsForgotPassword(false)} className="text-blue-500 hover:underline">Back to Login</button>
            </>
          ) : (
            <>
              Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Sign up</Link>
              <br />
              <button onClick={() => setIsForgotPassword(true)} className="text-blue-500 hover:underline mt-2">Forgot Password?</button>
            </>
          )}
        </p>
      </motion.form>
    </motion.div>
  );
};

export default Login;
