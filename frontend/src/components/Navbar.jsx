import React from 'react';
import { LayoutDashboard, Users, UserPlus, FileText, Sun, Moon } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, darkMode, setDarkMode }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee List', icon: Users },
    { id: 'add-employee', label: 'Add Employee', icon: UserPlus },
    { id: 'payslip', label: 'Generate Payslip', icon: FileText },
  ];

  return (
    <header className="app-header">
      <div className="header-brand-container">
        <div className="brand-logo">
          <span className="logo-icon">💼</span>
          <div>
            <p className="eyebrow">Enterprise HR Suite</p>
            <h1>Employee Management & Payslip System</h1>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            type="button"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      <nav className="nav-tabs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default Navbar;
