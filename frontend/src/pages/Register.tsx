import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(name, email, password);
      setIsRegistered(true);
      toast.success('Account created successfully! Please check your email to verify your account.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto mt-20 px-4 text-center"
      >
        <h1 className="text-4xl font-bold mb-8 text-white">Registration Successful!</h1>
        <p className="text-lg text-gray-300 mb-8">
          Thank you for registering. We've sent a verification email to {email}. 
          Please check your inbox and click on the verification link to complete your registration.
        </p>
        <Button onClick={() => navigate('/login')} className="w-full">
          Go to Login
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-20 px-4"
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Create an Account</h1>
      <motion.form 
        onSubmit={handleSubmit} 
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
        <div className="mb-6">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>
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
            placeholder="Choose a password"
          />
        </div>
        <Button type="submit" className="w-full mb-4" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
        <p className="text-center text-gray-400">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Log in</Link>
        </p>
      </motion.form>
    </motion.div>
  );
};

export default Register;
