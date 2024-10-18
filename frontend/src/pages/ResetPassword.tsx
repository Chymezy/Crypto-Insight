import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import { resetPassword } from '../services/authService';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setToken(params.get('token'));
    setEmail(params.get('email'));
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error('Invalid reset link');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email, token, newPassword);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to reset password. Please try again.');
      console.error('Reset password error:', err);
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
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Reset Password</h1>
      <motion.form 
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-300">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>
        <Button type="submit" className="w-full mb-4" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </motion.form>
    </motion.div>
  );
};

export default ResetPassword;
