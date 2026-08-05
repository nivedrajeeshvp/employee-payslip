import React from 'react';
import { X, Mail, Phone, Calendar, Briefcase, Building, UserCheck } from 'lucide-react';
import { getUploadUrl } from '../api';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val || 0);

const EmployeeDetailsModal = ({ employee, isOpen, onClose, onGeneratePayslip, onEdit }) => {
  if (!isOpen || !employee) return null;

  const photoUrl = employee.profile_photo ? getUploadUrl(employee.profile_photo) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <UserCheck size={24} className="text-primary" />
            <h3>Employee Profile & Details</h3>
          </div>
          <button className="close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-hero">
            <div className="profile-avatar-large">
              {photoUrl ? (
                <img src={photoUrl} alt={employee.full_name} className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  {employee.full_name ? employee.full_name.charAt(0).toUpperCase() : 'E'}
                </div>
              )}
            </div>
            <div className="profile-hero-info">
              <h2>{employee.full_name}</h2>
              <p className="badge-chip">{employee.employee_id}</p>
              <div className="hero-subtext">
                <span><Briefcase size={14} /> {employee.designation}</span>
                <span><Building size={14} /> {employee.department}</span>
              </div>
            </div>
          </div>

          <div className="details-section-grid">
            <div className="details-card">
              <h4>Contact & Service Info</h4>
              <div className="detail-row">
                <span className="detail-label"><Mail size={14} /> Email:</span>
                <span className="detail-value">{employee.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><Phone size={14} /> Phone:</span>
                <span className="detail-value">{employee.phone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><Calendar size={14} /> Joining Date:</span>
                <span className="detail-value">{employee.joining_date}</span>
              </div>
            </div>

            <div className="details-card">
              <h4>Salary Breakdown</h4>
              <div className="detail-row">
                <span className="detail-label">Basic Salary:</span>
                <span className="detail-value">{formatCurrency(employee.basic_salary)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">HRA:</span>
                <span className="detail-value">{formatCurrency(employee.hra)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">DA:</span>
                <span className="detail-value">{formatCurrency(employee.da)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bonus / Allowances:</span>
                <span className="detail-value">{formatCurrency(employee.bonus)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">PF Deductions:</span>
                <span className="detail-value text-danger">-{formatCurrency(employee.pf)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tax / ESI:</span>
                <span className="detail-value text-danger">-{formatCurrency(employee.tax)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Other Deductions:</span>
                <span className="detail-value text-danger">-{formatCurrency(employee.deductions)}</span>
              </div>
              <div className="detail-row total-row">
                <span className="detail-label">Net Salary:</span>
                <span className="detail-value text-success">{formatCurrency(employee.net_salary)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={() => onEdit(employee)} type="button">
            Edit Employee
          </button>
          <button className="primary-button" onClick={() => onGeneratePayslip(employee.employee_id)} type="button">
            Generate Payslip
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
