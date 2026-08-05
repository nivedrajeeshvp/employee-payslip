import React, { useState, useEffect, useCallback } from 'react';
import { fetchEmployees, deleteEmployee, getUploadUrl } from '../api';
import { Search, Filter, ArrowUpDown, Eye, Edit3, Trash2, FileText, ChevronLeft, ChevronRight, User, RefreshCw, LayoutGrid, List } from 'lucide-react';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import ConfirmModal from './ConfirmModal';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val || 0);

const EmployeeList = ({ onEditEmployee, onGeneratePayslip, showToast }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [sortBy, setSortBy] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees({
        search,
        department: departmentFilter,
        designation: designationFilter,
        sort_by: sortBy,
        order: sortOrder,
        page,
        per_page: 8,
      });

      if (data.employees) {
        setEmployees(data.employees);
        setTotalPages(data.pages);
        setTotalEmployees(data.total);
      } else {
        setEmployees(data);
        setTotalPages(1);
        setTotalEmployees(data.length);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      showToast('Could not load employees from backend.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter, designationFilter, sortBy, sortOrder, page, showToast]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee(deleteTarget.id);
      showToast(`Employee ${deleteTarget.full_name} deleted successfully!`, 'success');
      setDeleteTarget(null);
      loadEmployees();
    } catch (err) {
      console.error('Failed to delete employee:', err);
      showToast('Failed to delete employee.', 'error');
    }
  };

  const handleViewDetails = (emp) => {
    setSelectedEmployee(emp);
    setIsDetailsOpen(true);
  };

  return (
    <div className="panel list-panel">
      <div className="list-header">
        <div>
          <h2>Employee Directory</h2>
          <p className="subtitle">Manage staff records, search, filter, and view details</p>
        </div>
        <div className="header-view-controls">
          <button
            className={`icon-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
            type="button"
          >
            <List size={18} />
          </button>
          <button
            className={`icon-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid Card View"
            type="button"
          >
            <LayoutGrid size={18} />
          </button>
          <button onClick={loadEmployees} className="secondary-button icon-btn" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="search"
            placeholder="Search by Name, ID, Dept, Designation..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Design">Design</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>

          <select value={designationFilter} onChange={(e) => { setDesignationFilter(e.target.value); setPage(1); }}>
            <option value="">All Designations</option>
            <option value="Developer">Developer</option>
            <option value="HR Manager">HR Manager</option>
            <option value="UI/UX Lead">UI/UX Lead</option>
            <option value="Financial Analyst">Financial Analyst</option>
          </select>

          <ArrowUpDown size={16} />
          <select value={`${sortBy}_${sortOrder}`} onChange={(e) => {
            const [field, order] = e.target.value.split('_');
            setSortBy(field);
            setSortOrder(order);
          }}>
            <option value="full_name_asc">Name (A - Z)</option>
            <option value="full_name_desc">Name (Z - A)</option>
            <option value="employee_id_asc">Employee ID (Asc)</option>
            <option value="net_salary_desc">Highest Salary</option>
            <option value="net_salary_asc">Lowest Salary</option>
            <option value="joining_date_desc">Newest Joined</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <RefreshCw className="spinner" size={24} />
          <p>Fetching employee records...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="empty-state-card">
          <User size={40} />
          <h3>No Employees Found</h3>
          <p>Try adjusting your search query or filter criteria.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Net Salary</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const photoUrl = emp.profile_photo ? getUploadUrl(emp.profile_photo) : null;
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="table-user-cell">
                        <div className="table-avatar">
                          {photoUrl ? (
                            <img src={photoUrl} alt={emp.full_name} />
                          ) : (
                            <span>{emp.full_name ? emp.full_name.charAt(0).toUpperCase() : 'E'}</span>
                          )}
                        </div>
                        <div>
                          <strong>{emp.full_name}</strong>
                          <small className="table-email">{emp.email}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge-chip">{emp.employee_id}</span></td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.joining_date}</td>
                    <td><strong className="text-success">{formatCurrency(emp.net_salary)}</strong></td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="action-icon-btn view"
                          onClick={() => handleViewDetails(emp)}
                          title="View Profile"
                          type="button"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-icon-btn edit"
                          onClick={() => onEditEmployee(emp)}
                          title="Edit Employee"
                          type="button"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="action-icon-btn payslip"
                          onClick={() => onGeneratePayslip(emp.employee_id)}
                          title="Generate Payslip"
                          type="button"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          className="action-icon-btn delete"
                          onClick={() => setDeleteTarget(emp)}
                          title="Delete Employee"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cards-grid">
          {employees.map((emp) => {
            const photoUrl = emp.profile_photo ? getUploadUrl(emp.profile_photo) : null;
            return (
              <div key={emp.id} className="employee-card-item">
                <div className="card-item-header">
                  <div className="card-avatar">
                    {photoUrl ? (
                      <img src={photoUrl} alt={emp.full_name} />
                    ) : (
                      <span>{emp.full_name ? emp.full_name.charAt(0).toUpperCase() : 'E'}</span>
                    )}
                  </div>
                  <div>
                    <h4>{emp.full_name}</h4>
                    <span className="badge-chip">{emp.employee_id}</span>
                  </div>
                </div>
                <div className="card-item-body">
                  <p><strong>Dept:</strong> {emp.department}</p>
                  <p><strong>Role:</strong> {emp.designation}</p>
                  <p><strong>Salary:</strong> <span className="text-success">{formatCurrency(emp.net_salary)}</span></p>
                </div>
                <div className="card-item-actions">
                  <button className="secondary-button compact" onClick={() => handleViewDetails(emp)} type="button">
                    <Eye size={14} /> Profile
                  </button>
                  <button className="secondary-button compact" onClick={() => onEditEmployee(emp)} type="button">
                    <Edit3 size={14} /> Edit
                  </button>
                  <button className="primary-button compact" onClick={() => onGeneratePayslip(emp.employee_id)} type="button">
                    <FileText size={14} /> Payslip
                  </button>
                  <button className="danger-button compact" onClick={() => setDeleteTarget(emp)} type="button">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-bar">
          <span className="pagination-info">
            Showing Page {page} of {totalPages} ({totalEmployees} total employees)
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                className={`pagination-num ${page === pNum ? 'active' : ''}`}
                onClick={() => setPage(pNum)}
                type="button"
              >
                {pNum}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              type="button"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <EmployeeDetailsModal
        employee={selectedEmployee}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={(emp) => {
          setIsDetailsOpen(false);
          onEditEmployee(emp);
        }}
        onGeneratePayslip={(code) => {
          setIsDetailsOpen(false);
          onGeneratePayslip(code);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Confirm Deletion"
        message={deleteTarget ? `Are you sure you want to delete employee "${deleteTarget.full_name}" (${deleteTarget.employee_id})? This action cannot be undone.` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Delete Employee"
        isDanger={true}
      />
    </div>
  );
};

export default EmployeeList;
