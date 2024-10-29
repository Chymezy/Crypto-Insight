import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchAIInsights } from '../store/slices/aiInsightsSlice';
import { FaRobot, FaChartLine, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';

interface Insight {
  id: string;
  type: 'portfolio' | 'market' | 'opportunity' | 'risk';
  content: string;
}

const AIInsightsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const insights = useSelector((state: RootState) => state.aiInsights.insights);
  const loading = useSelector((state: RootState) => state.aiInsights.loading);
  const error = useSelector((state: RootState) => state.aiInsights.error);

  useEffect(() => {
    dispatch(fetchAIInsights());
  }, [dispatch]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'portfolio':
        return <FaChartLine className="text-blue-500" />;
      case 'market':
        return <FaChartLine className="text-green-500" />;
      case 'opportunity':
        return <FaLightbulb className="text-yellow-500" />;
      case 'risk':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaRobot className="text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading AI Insights...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center">
        <FaRobot className="mr-2 text-blue-500" /> AI Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight: Insight) => (
          <div key={insight.id} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              {getInsightIcon(insight.type)}
              <span className="ml-2 text-lg font-semibold text-white capitalize">{insight.type}</span>
            </div>
            <p className="text-gray-300">{insight.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsightsPage;
