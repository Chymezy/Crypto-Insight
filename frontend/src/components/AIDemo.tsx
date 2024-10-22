import React, { useState } from 'react';
import { FaRobot } from 'react-icons/fa';

const AIDemo: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is where you would typically make an API call to your AI service
    setResponse(`AI analysis for "${query}": This is a placeholder response. Implement actual AI logic here.`);
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 flex items-center">
        <FaRobot className="mr-2" /> AI Insights Demo
      </h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about a crypto trend or for investment advice..."
          className="w-full p-2 rounded bg-gray-600 text-white"
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Get AI Insights
        </button>
      </form>
      {response && (
        <div className="bg-gray-600 p-4 rounded">
          <h4 className="font-bold mb-2">AI Response:</h4>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default AIDemo;
