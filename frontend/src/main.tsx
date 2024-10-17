import React from 'react' // React for JSX and component-based UI
import ReactDOM from 'react-dom/client' // ReactDOM for rendering to the DOM
import { Provider } from 'react-redux' // Provider to wrap the app with the Redux store
import { store } from './store/index'; // Update this line
import App from './App' // Main App component
import './index.css' // CSS for styling
import { AuthProvider } from './contexts/AuthContext' // Import AuthProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> {/* Strict mode to catch potential issues */}
    <Provider store={store}> {/* Provider to wrap the app with the Redux store */}
      <AuthProvider> {/* Wrap the App with AuthProvider */}
        <App /> {/* Main App component */}  
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)
