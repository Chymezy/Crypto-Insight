import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { verifyEmail } from '../services/api';
import Button from '../components/common/Button';

const VerifyEmail: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setVerificationStatus('error');
        toast.error('Invalid verification link');
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
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Email Verification</h1>
      {isVerifying ? (
        <p className="text-lg text-center text-gray-300">Verifying your email...</p>
      ) : (
        <>
          {verificationStatus === 'success' ? (
            <div>
              <p className="text-lg text-center text-green-500 mb-6">Your email has been successfully verified!</p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-lg text-center text-red-500 mb-6">Email verification failed. Please try again or contact support.</p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Home
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
