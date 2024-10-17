
# CryptoInsight: AI-Powered Cryptocurrency Portfolio Tracker

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [API Integrations](#api-integrations)
5. [Security Measures](#security-measures)
6. [Installation](#installation)
7. [Usage](#usage)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [License](#license)

## Overview

**CryptoInsight** is an AI-powered cryptocurrency portfolio tracker designed to help users manage their crypto investments and monitor real-time market trends. Inspired by CoinStats, this platform adds unique AI features powered by Gemini AI, enabling users to gain deeper insights, predictions, and recommendations.

![CryptoInsight Screenshot](./readme1.png)

## Features

### Core Features
- Responsive user interface with dark/light mode
- User authentication and profile management
- Portfolio management (add/remove assets, track transactions)
- Real-time market data and price alerts
- Personalized news feed with crypto updates
- Watchlist for tracking favorite assets
- Social trading and portfolio comparison
- AI-powered insights, including risk assessment and market analysis

### AI-Powered Features
- AI-driven investment suggestions
- Natural language query interface
- Sentiment analysis of the crypto market
- Automated news summarization
- Educational content on crypto trends and technology

### Additional Features
- Multi-signature wallet support
- Gamification with achievements and badges
- Virtual portfolio simulator

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Caching:** Redis
- **AI Integration:** Gemini AI API
- **Real-Time:** WebSocket (Socket.IO)

## API Integrations

- **Cryptocurrency Data:** CoinGecko API
- **AI Functionality:** Gemini AI API
- **News Aggregation:** Crypto Compare API

## Security Measures

- JWT-based authentication with refresh tokens
- HTTPS with secure, HTTP-only cookies
- Redis for session management
- Data encryption at rest and in transit
- Rate limiting and Helmet middleware for API protection
- Input validation and sanitization
- Multi-factor authentication (MFA) support

## Installation

### Prerequisites
Make sure you have the following installed:
- Node.js (v14.x or higher)
- npm or yarn
- MongoDB Atlas account
- Redis server
- .env file for environment variables

### Clone the Repository
```bash
git clone https://github.com/username/cryptoinsight.git
cd cryptoinsight
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables by creating a `.env` file:
   ```bash
   touch .env
   ```

   Add the following variables to the `.env` file:
   ```env
   MONGO_URI=<your_mongoDB_connection_string>
   JWT_SECRET=<your_jwt_secret>
   REDIS_URL=<your_redis_url>
   GEMINI_API_KEY=<your_gemini_ai_api_key>
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `frontend` directory with the following content:
   ```env
   VITE_API_URL=<your_backend_url>
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

Once both the frontend and backend servers are running, you can access the application at:
```
http://localhost:3000
```

### Key Functionalities
- **Sign Up/Login:** Create an account or log in to manage your portfolio.
- **Portfolio Management:** Add, remove, and monitor your cryptocurrency investments.
- **AI Insights:** Use the AI assistant to get personalized recommendations and insights.
- **Market Trends:** View live cryptocurrency prices, charts, and analysis.
- **News Feed:** Get curated news based on your interests and portfolio.

## Testing

### Backend Testing

1. To run the backend tests:
   ```bash
   npm test
   ```

### Frontend Testing

1. Run frontend tests using Jest:
   ```bash
   npm run test
   ```

## Deployment

### Backend Deployment

1. Deploy the backend to platforms like Heroku or DigitalOcean.
2. Set up the required environment variables on the server:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `REDIS_URL`
   - `GEMINI_API_KEY`

### Frontend Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the static files to platforms like Vercel or Netlify.

### CI/CD Pipeline

To automate deployment, configure GitHub Actions or other CI/CD tools to build, test, and deploy your app on code changes.

## Contributing

We welcome contributions! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
