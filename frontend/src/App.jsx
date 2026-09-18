import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import AddExpensePage from './pages/AddExpensePage.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import SidebarLayout from './components/SidebarLayout.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="add-expense" element={<AddExpensePage />} />
        <Route path="add-income" element={<AddExpensePage defaultType="Income" />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
