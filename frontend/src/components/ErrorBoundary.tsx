import React, { Component, ReactNode } from 'react'; // React and Component for error handling
import { toast } from 'react-toastify'; // Toast container for notifications

interface Props {
  children: ReactNode; // Children to be wrapped by the error boundary
  fallback?: ReactNode; // Fallback UI to display when an error occurs
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> { // Error boundary component
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State { // Static method to update the state when an error occurs
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { // Method to catch errors and display a toast notification
    console.error("Uncaught error:", error, errorInfo);
    toast.error('An unexpected error occurred. Please try again later.');
  }

  public render() {
    if (this.state.hasError) { // Render fallback UI if an error occurs
      return this.props.fallback || <h1>Sorry.. there was an error</h1>;
    }

    return this.props.children; // Render the children if no error occurs
  }
}

export default ErrorBoundary; // Export the ErrorBoundary component as default