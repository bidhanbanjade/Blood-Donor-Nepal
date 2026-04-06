import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
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
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital-dashboard"
              element={
                <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bloodbank-dashboard"
              element={
                <ProtectedRoute allowedRoles={['blood_bank', 'admin']}>
                  <BloodBankDashboard />
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
