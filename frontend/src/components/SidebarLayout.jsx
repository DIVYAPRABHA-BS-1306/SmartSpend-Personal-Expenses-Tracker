import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const SidebarLayout = () => {
  const { logout, user } = useAuth();
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>SmartSpend</h2>
          <p className="brand-text">Professional expense tracking with smart saving guidance and goal planning.</p>
        </div>
        <nav>
          <NavLink to="/dashboard" end>Dashboard</NavLink>
          <NavLink to="/dashboard/add-expense">Add Expense</NavLink>
          <NavLink to="/dashboard/transactions">Transactions</NavLink>
          <NavLink to="/dashboard/budgets">Budgets</NavLink>
          <NavLink to="/dashboard/goals">Saving Goals</NavLink>
          <NavLink to="/dashboard/wishlist">Wishlist</NavLink>
          <NavLink to="/dashboard/reports">Reports</NavLink>
          <NavLink to="/dashboard/profile">Profile</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="theme-select">
            <label>Theme</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <p className="sidebar-user">{user?.name || user?.email}</p>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
