import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import { verifyEmail } from '../services/api';

const EmailVerification: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setVerificationStatus('error');
        toast.error('Invalid verification link. Please ensure both email and token are present.');
        setIsVerifying(false);
        return;
      }

      try {
        await verifyEmail(email, token);
        setVerificationStatus('success');
        toast.success('Email verified successfully!');
      } catch (error) {
        setVerificationStatus('error');
        toast.error('Email verification failed. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-20 px-4 text-center"
    >
      <h1 className="text-4xl font-bold mb-8 text-white">Email Verification</h1>
      {isVerifying ? (
        <p className="text-lg text-gray-300 mb-8">Verifying your email...</p>
      ) : (
        <>
          {verificationStatus === 'success' ? (
            <>
              <p className="text-lg text-green-500 mb-8">Your email has been successfully verified!</p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </>
          ) : (
            <>
              <p className="text-lg text-red-500 mb-8">Email verification failed. Please try again or contact support.</p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Home
              </Button>
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

export default EmailVerification;
