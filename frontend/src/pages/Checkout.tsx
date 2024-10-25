import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { upgradePlan } from '../services/userApi';
import { toast } from 'react-toastify';

interface PlanDetails {
  name: string;
  price: { monthly: string; annual: string };
  features: string[];
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [planDetails, setPlanDetails] = useState<{ selectedPlan: PlanDetails; isAnnual: boolean } | null>(null);

  useEffect(() => {
    if (location.state) {
      setPlanDetails(location.state as { selectedPlan: PlanDetails; isAnnual: boolean });
    } else {
      navigate('/pricing');
    }
  }, [location.state, navigate]);

  const handleConfirmUpgrade = async () => {
    if (!planDetails) return;

    setIsProcessing(true);
    try {
      await upgradePlan(planDetails.selectedPlan.name, planDetails.isAnnual);
      toast.success('Plan upgraded successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to upgrade plan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!planDetails) {
    return <div className="text-white text-center">Loading...</div>;
  }

  const { selectedPlan, isAnnual } = planDetails;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Confirm Your Upgrade</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">{selectedPlan.name} Plan</h2>
        <p className="text-xl mb-4">
          Price: {isAnnual ? selectedPlan.price.annual : selectedPlan.price.monthly}
          {isAnnual ? ' per year' : ' per month'}
        </p>
        <h3 className="text-lg font-semibold mb-2">Features:</h3>
        <ul className="list-disc pl-5 mb-4">
          {selectedPlan.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Billing Details</h2>
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        {/* Add more billing details as needed */}
      </div>

      <div className="text-center">
        <button
          onClick={handleConfirmUpgrade}
          disabled={isProcessing}
          className={`bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? 'Processing...' : 'Confirm Upgrade'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
