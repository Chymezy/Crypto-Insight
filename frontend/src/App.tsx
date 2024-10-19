import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Router and Routes for navigation
import { ToastContainer } from 'react-toastify'; // Toast container for notifications
import 'react-toastify/dist/ReactToastify.css'; // Toast container styles
import ErrorBoundary from './components/ErrorBoundary'; // Error boundary to catch errors in the app
import Layout from './components/Layout'; // Layout component to wrap the app
import LoadingSpinner from './components/common/LoadingSpinner'; // Loading spinner component
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import EmailVerification from './pages/EmailVerification'; //

// Lazy imports for code splitting 
const Home = lazy(() => import('./pages/Home')); // Lazy import for Home page 
const Login = lazy(() => import('./pages/Login')); // Lazy import for Login page
const Register = lazy(() => import('./pages/Register')); // Lazy import for Register page
const Portfolio = lazy(() => import('./pages/Portfolio')); // Update this line
const AssetDetails = lazy(() => import('./pages/AssetDetails')); // Lazy import for Asset details page
const Pricing = lazy(() => import('./pages/Pricing')); // Lazy import for Pricing page
const Dashboard = lazy(() => import('./components/Dashboard')); // Add this line
const ResetPassword = lazy(() => import('./pages/ResetPassword')); // Lazy import for ResetPassword page
const News = lazy(() => import('./components/News')); // Add this line
const Market = lazy(() => import('./components/Market')); // Add this line

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary> {/* Error boundary to catch errors in the app */}
      <Router> {/* Router to handle navigation */}
        <AuthProvider> {/* Wrap the entire app with AuthProvider */}
          <Layout> {/* Layout component to wrap the app */}
            <Suspense fallback={<LoadingSpinner />}> {/* Suspense to handle lazy loading */}
              <Routes>
                <Route path="/" element={<Home />} /> {/* Home page route */}
                <Route path="/login" element={<Login />} /> {/* Login page route */}
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/register" element={<Register />} /> {/* Register page route */}
                <Route path="/portfolio" element={<Portfolio />} /> {/* Portfolio page route */}
                <Route path="/asset/:assetId" element={<AssetDetails />} /> {/* Asset details page route */}
                <Route path="/pricing" element={<Pricing />} /> {/* Pricing page route */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/news" element={<News />} /> {/* Add this line */}
                <Route path="/markets" element={<Market />} /> {/* Add this line */}
              </Routes>
            </Suspense>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} /> {/* Toast container for notifications */}
          </Layout>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
