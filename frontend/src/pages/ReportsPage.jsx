import { useEffect, useState } from 'react';
import apiService from '../services/apiService.js';
import SectionTitle from '../components/SectionTitle.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const ReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.get('/dashboard/analytics?period=month');
        setAnalytics(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load report data');
      }
    };
    load();
  }, []);

  if (!analytics) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="subtitle">View trends and spending patterns from your transactions.</p>
        </div>
      </div>
      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card table-card">
          <SectionTitle title="Monthly Income vs Expenses" />
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expenses</th>
              </tr>
            </thead>
            <tbody>
              {analytics.analytics.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>₹{row.income}</td>
                  <td>₹{row.expenses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
