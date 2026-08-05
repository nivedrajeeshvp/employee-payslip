import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import PayslipGenerator from './components/PayslipGenerator';
import Toast from './components/Toast';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-dark');
    return saved ? JSON.parse(saved) : false;
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [payslipEmployeeId, setPayslipEmployeeId] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('theme-dark', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setActiveTab('add-employee');
  };

  const handleSaveSuccess = (savedEmployee) => {
    setEditingEmployee(null);
    setActiveTab('employees');
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setActiveTab('employees');
  };

  const handleGeneratePayslipForEmployee = (employeeCode) => {
    setPayslipEmployeeId(employeeCode);
    setActiveTab('payslip');
  };

  return (
    <div className={`app-shell ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'add-employee' && activeTab !== 'add-employee') {
            setEditingEmployee(null);
          }
          setActiveTab(tab);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'employees' && (
          <EmployeeList
            onEditEmployee={handleEditEmployee}
            onGeneratePayslip={handleGeneratePayslipForEmployee}
            showToast={showToast}
          />
        )}

        {activeTab === 'add-employee' && (
          <EmployeeForm
            initialData={editingEmployee}
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleCancelEdit}
            showToast={showToast}
          />
        )}

        {activeTab === 'payslip' && (
          <PayslipGenerator
            initialEmployeeId={payslipEmployeeId}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}

export default App;
