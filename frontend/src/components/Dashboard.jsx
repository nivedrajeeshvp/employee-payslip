import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../api';
import { Users, DollarSign, TrendingUp, Building2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val || 0);

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Could not connect to backend server. Make sure Flask API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="spinner" size={28} />
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={loadStats} className="retry-btn">
          <RefreshCw size={16} /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>System Overview</h2>
          <p className="subtitle">Real-time metrics for employee records and payroll analysis</p>
        </div>
        <button onClick={loadStats} className="secondary-button icon-btn">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="metrics-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Employees</span>
            <h3 className="stat-value">{stats?.total_employees || 0}</h3>
            <span className="stat-badge">Active Workforce</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Monthly Payroll</span>
            <h3 className="stat-value">{formatCurrency(stats?.total_payroll)}</h3>
            <span className="stat-badge">Net Disbursements</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Average Salary</span>
            <h3 className="stat-value">{formatCurrency(stats?.average_salary)}</h3>
            <span className="stat-badge">Per Employee / Mo</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><Building2 size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Departments</span>
            <h3 className="stat-value">{stats?.departments_count || 0}</h3>
            <span className="stat-badge">Operational Units</span>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon"><ArrowUpRight size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Highest Salary</span>
            <h3 className="stat-value">{formatCurrency(stats?.highest_salary)}</h3>
            <span className="stat-badge">Max Compensation</span>
          </div>
        </div>

        <div className="stat-card rose">
          <div className="stat-icon"><ArrowDownRight size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Lowest Salary</span>
            <h3 className="stat-value">{formatCurrency(stats?.lowest_salary)}</h3>
            <span className="stat-badge">Min Compensation</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="panel department-panel">
          <h3>Department Wise Payroll & Headcount</h3>
          {stats?.department_breakdown?.length === 0 ? (
            <p className="empty-state">No departmental data available.</p>
          ) : (
            <div className="department-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Employees</th>
                    <th>Total Payroll</th>
                    <th>Avg Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.department_breakdown?.map((dept) => (
                    <tr key={dept.department}>
                      <td><strong>{dept.department}</strong></td>
                      <td>{dept.count}</td>
                      <td>{formatCurrency(dept.payroll)}</td>
                      <td>{formatCurrency(dept.count ? dept.payroll / dept.count : 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel quick-actions-panel">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="action-card-btn" onClick={() => onNavigate('employees')}>
              <Users size={20} />
              <div>
                <strong>View All Employees</strong>
                <small>Search, filter & manage workforce</small>
              </div>
            </button>
            <button className="action-card-btn" onClick={() => onNavigate('add-employee')}>
              <Users size={20} />
              <div>
                <strong>Add New Employee</strong>
                <small>Register an employee profile</small>
              </div>
            </button>
            <button className="action-card-btn" onClick={() => onNavigate('payslip')}>
              <Users size={20} />
              <div>
                <strong>Generate Payslip</strong>
                <small>Calculate salary & print slips</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
