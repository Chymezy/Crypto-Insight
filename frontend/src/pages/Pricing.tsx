import React, { useState } from 'react';
import { FaCheck, FaTimes, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PricingTier: React.FC<{
  name: string;
  price: { monthly: string; annual: string };
  features: string[];
  recommended?: boolean;
  isAnnual: boolean;
  onChoosePlan: () => void;
}> = ({ name, price, features, recommended, isAnnual, onChoosePlan }) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 flex flex-col ${recommended ? 'border-2 border-blue-500' : ''}`}>
      {recommended && (
        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold self-start mb-4">
          Recommended
        </span>
      )}
      <h2 className="text-2xl font-bold mb-4">{name}</h2>
      <p className="text-4xl font-bold mb-2">{isAnnual ? price.annual : price.monthly}</p>
      <p className="text-sm text-gray-400 mb-6">{isAnnual ? 'per year' : 'per month'}</p>
      <ul className="flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center mb-2">
            <FaCheck className="text-green-500 mr-2" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors"
        onClick={onChoosePlan}
      >
        Choose Plan
      </button>
    </div>
  );
};

const ComparisonTable: React.FC = () => {
  const features = ['Portfolio Tracking', 'Market Data', 'Ad-free Experience', 'Priority Support', 'API Access'];
  const plans = ['Free', 'Pro', 'Enterprise'];

  return (
    <div className="overflow-x-auto mt-12">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-3 border-b border-gray-700">Feature</th>
            {plans.map(plan => (
              <th key={plan} className="p-3 border-b border-gray-700">{plan}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : ''}>
              <td className="p-3">{feature}</td>
              {plans.map(plan => (
                <td key={`${plan}-${feature}`} className="p-3">
                  {plan === 'Free' && feature !== 'Portfolio Tracking' ? <FaTimes className="text-red-500" /> : <FaCheck className="text-green-500" />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqs = [
    { question: 'Can I cancel my subscription at any time?', answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.' },
    { question: 'Is there a free trial for paid plans?', answer: 'Yes, we offer a 14-day free trial for our Pro plan. No credit card required.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards and PayPal.' },
  ];

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold mb-2 flex items-center">
            <FaQuestionCircle className="mr-2 text-blue-500" />
            {faq.question}
          </h3>
          <p className="text-gray-300">{faq.answer}</p>
        </div>
      ))}
    </div>
  );
};

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: { monthly: '$0', annual: '$0' },
      features: ['Basic portfolio tracking', 'Limited market data', 'Ad-supported'],
    },
    {
      name: 'Pro',
      price: { monthly: '$9.99', annual: '$99.99' },
      features: ['Advanced portfolio tracking', 'Full market data', 'Ad-free experience', 'Priority support'],
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: 'Custom', annual: 'Custom' },
      features: ['All Pro features', 'API access', 'Custom integrations', 'Dedicated account manager'],
    },
  ];

  const handleChoosePlan = (plan: typeof plans[0]) => {
    if (!user) {
      navigate('/login', { state: { from: '/pricing', selectedPlan: plan } });
    } else {
      navigate('/checkout', { 
        state: { 
          selectedPlan: plan, 
          isAnnual 
        }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Choose Your Plan</h1>
      
      <div className="flex justify-center mb-8">
        <button
          className={`px-4 py-2 rounded-l-full ${!isAnnual ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setIsAnnual(false)}
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 rounded-r-full ${isAnnual ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setIsAnnual(true)}
        >
          Annual (Save 15%)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <PricingTier 
            key={index} 
            {...plan} 
            isAnnual={isAnnual}
            onChoosePlan={() => handleChoosePlan(plan)}
          />
        ))}
      </div>

      <ComparisonTable />

      <FAQ />

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">All plans include:</h2>
        <ul className="inline-block text-left">
          <li className="flex items-center mb-2"><FaCheck className="text-green-500 mr-2" /> Real-time price updates</li>
          <li className="flex items-center mb-2"><FaCheck className="text-green-500 mr-2" /> Portfolio management tools</li>
          <li className="flex items-center mb-2"><FaCheck className="text-green-500 mr-2" /> Mobile app access</li>
        </ul>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xl mb-4">Not sure which plan is right for you?</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
};

export default Pricing;
