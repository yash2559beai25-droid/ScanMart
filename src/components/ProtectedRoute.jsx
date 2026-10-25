// ProtectedRoute — a simple demo gate for selected pages.
// If the user has not completed the frontend login/register flow,
// they are redirected to the login page ("/").
// This is not real security. Anyone can change localStorage in the browser.

import { Navigate } from 'react-router-dom';
import { isDemoLoggedIn } from '../utils/demoAuth';

function ProtectedRoute({ children }) {
  if (!isDemoLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
