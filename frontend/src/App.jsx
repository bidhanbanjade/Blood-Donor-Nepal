import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SearchPage from './pages/SearchPage';
import AlertsPage from './pages/AlertsPage';
import ChatbotPage from './pages/ChatbotPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alert" element={<AlertsPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route
              path="/donor-dashboard"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor-dashboard/profile"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor-dashboard/eligibility"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor-dashboard/history"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor-dashboard/feedback"
              element={
                <ProtectedRoute allowedRoles={['donor', 'admin']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/inventory"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/trigger-alert"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/donors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/alert-history"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/public-requests"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
