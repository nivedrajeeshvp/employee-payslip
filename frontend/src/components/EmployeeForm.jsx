import React, { useState, useEffect } from 'react';
import { createEmployee, updateEmployee, getUploadUrl } from '../api';
import { Save, X, Upload, User, DollarSign, Briefcase } from 'lucide-react';

const emptyForm = {
  employee_id: '',
  full_name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joining_date: new Date().toISOString().split('T')[0],
  basic_salary: '',
  hra: '',
  da: '',
  bonus: '',
  pf: '',
  tax: '',
  deductions: '',
};

const EmployeeForm = ({ initialData, onSaveSuccess, onCancel, showToast }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(initialData && initialData.id);

  useEffect(() => {
    if (initialData) {
      setForm({
        employee_id: initialData.employee_id || '',
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || '',
        designation: initialData.designation || '',
        joining_date: initialData.joining_date || new Date().toISOString().split('T')[0],
        basic_salary: initialData.basic_salary !== undefined ? String(initialData.basic_salary) : '',
        hra: initialData.hra !== undefined ? String(initialData.hra) : '',
        da: initialData.da !== undefined ? String(initialData.da) : '',
        bonus: initialData.bonus !== undefined ? String(initialData.bonus) : '',
        pf: initialData.pf !== undefined ? String(initialData.pf) : '',
        tax: initialData.tax !== undefined ? String(initialData.tax) : '',
        deductions: initialData.deductions !== undefined ? String(initialData.deductions) : '',
      });

      if (initialData.profile_photo) {
        setPhotoPreview(getUploadUrl(initialData.profile_photo));
      } else {
        setPhotoPreview(null);
      }
    } else {
      setForm(emptyForm);
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setErrors({});
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, profile_photo: 'Please select a valid image file.' }));
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, profile_photo: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required.';
    }

    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full Name is required.';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (form.phone.trim() && !/^\+?[0-9\s\-()]{7,20}$/.test(form.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number (7-20 digits).';
    }

    if (!form.department.trim()) {
      newErrors.department = 'Department is required.';
    }

    if (!form.designation.trim()) {
      newErrors.designation = 'Designation is required.';
    }

    if (!form.joining_date) {
      newErrors.joining_date = 'Joining Date is required.';
    }

    ['basic_salary', 'hra', 'da', 'bonus', 'pf', 'tax', 'deductions'].forEach((field) => {
      const val = form[field];
      if (val !== '' && val !== null && val !== undefined) {
        const num = Number(val);
        if (isNaN(num)) {
          newErrors[field] = 'Must be a valid number.';
        } else if (num < 0) {
          newErrors[field] = 'Value cannot be negative.';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the errors in the form before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (photoFile) {
        formData.append('profile_photo', photoFile);
      }

      let res;
      if (isEdit) {
        res = await updateEmployee(initialData.id, formData);
        showToast(res.message || 'Employee updated successfully!', 'success');
      } else {
        res = await createEmployee(formData);
        showToast(res.message || 'Employee created successfully!', 'success');
      }

      onSaveSuccess(res.employee);
    } catch (err) {
      console.error('Submission error:', err);
      if (err.response?.data?.details) {
        setErrors(err.response.data.details);
      }
      showToast(
        err.response?.data?.error || 'Failed to save employee. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel form-panel">
      <div className="panel-header">
        <div>
          <h2>{isEdit ? 'Edit Employee Details' : 'Add New Employee'}</h2>
          <p className="subtitle">
            {isEdit
              ? 'Update employee record and compensation structure'
              : 'Enter mandatory information and salary parameters to onboard an employee'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-section">
          <h3><User size={18} /> Personal & Contact Details</h3>
          
          <div className="photo-upload-container">
            <div className="photo-preview-box">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="photo-preview-img" />
              ) : (
                <div className="photo-placeholder">
                  <User size={36} />
                  <span>No Photo</span>
                </div>
              )}
            </div>
            <div className="photo-upload-controls">
              <label htmlFor="photo-upload" className="secondary-button upload-btn">
                <Upload size={16} /> Choose Profile Photo
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <small className="field-hint">Accepted formats: JPG, PNG, WEBP (Max 16MB)</small>
              {errors.profile_photo && <span className="error-message">{errors.profile_photo}</span>}
            </div>
          </div>

          <div className="form-grid">
            <label htmlFor="employee_id">
              Employee ID *
              <input
                id="employee_id"
                name="employee_id"
                value={form.employee_id}
                onChange={handleInputChange}
                placeholder="e.g. EMP1001"
                className={errors.employee_id ? 'input-error' : ''}
              />
              {errors.employee_id && <span className="error-message">{errors.employee_id}</span>}
            </label>

            <label htmlFor="full_name">
              Full Name *
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleInputChange}
                placeholder="e.g. Asha Rao"
                className={errors.full_name ? 'input-error' : ''}
              />
              {errors.full_name && <span className="error-message">{errors.full_name}</span>}
            </label>

            <label htmlFor="email">
              Email Address *
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="asha.rao@company.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </label>

            <label htmlFor="phone">
              Phone Number
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3><Briefcase size={18} /> Role & Department</h3>
          <div className="form-grid">
            <label htmlFor="department">
              Department *
              <input
                id="department"
                name="department"
                value={form.department}
                onChange={handleInputChange}
                placeholder="e.g. Engineering"
                className={errors.department ? 'input-error' : ''}
              />
              {errors.department && <span className="error-message">{errors.department}</span>}
            </label>

            <label htmlFor="designation">
              Designation *
              <input
                id="designation"
                name="designation"
                value={form.designation}
                onChange={handleInputChange}
                placeholder="e.g. Senior Software Engineer"
                className={errors.designation ? 'input-error' : ''}
              />
              {errors.designation && <span className="error-message">{errors.designation}</span>}
            </label>

            <label htmlFor="joining_date">
              Joining Date *
              <input
                id="joining_date"
                type="date"
                name="joining_date"
                value={form.joining_date}
                onChange={handleInputChange}
                className={errors.joining_date ? 'input-error' : ''}
              />
              {errors.joining_date && <span className="error-message">{errors.joining_date}</span>}
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3><DollarSign size={18} /> Salary & Deductions Breakdown</h3>
          <div className="form-grid">
            <label htmlFor="basic_salary">
              Basic Salary (₹) *
              <input
                id="basic_salary"
                type="number"
                min="0"
                step="any"
                name="basic_salary"
                value={form.basic_salary}
                onChange={handleInputChange}
                placeholder="30000"
                className={errors.basic_salary ? 'input-error' : ''}
              />
              {errors.basic_salary && <span className="error-message">{errors.basic_salary}</span>}
            </label>

            <label htmlFor="hra">
              HRA (₹)
              <input
                id="hra"
                type="number"
                min="0"
                step="any"
                name="hra"
                value={form.hra}
                onChange={handleInputChange}
                placeholder="6000"
                className={errors.hra ? 'input-error' : ''}
              />
              {errors.hra && <span className="error-message">{errors.hra}</span>}
            </label>

            <label htmlFor="da">
              DA (₹)
              <input
                id="da"
                type="number"
                min="0"
                step="any"
                name="da"
                value={form.da}
                onChange={handleInputChange}
                placeholder="3000"
                className={errors.da ? 'input-error' : ''}
              />
              {errors.da && <span className="error-message">{errors.da}</span>}
            </label>

            <label htmlFor="bonus">
              Bonus / Allowances (₹)
              <input
                id="bonus"
                type="number"
                min="0"
                step="any"
                name="bonus"
                value={form.bonus}
                onChange={handleInputChange}
                placeholder="1500"
                className={errors.bonus ? 'input-error' : ''}
              />
              {errors.bonus && <span className="error-message">{errors.bonus}</span>}
            </label>

            <label htmlFor="pf">
              Provident Fund (PF) (₹)
              <input
                id="pf"
                type="number"
                min="0"
                step="any"
                name="pf"
                value={form.pf}
                onChange={handleInputChange}
                placeholder="3600"
                className={errors.pf ? 'input-error' : ''}
              />
              {errors.pf && <span className="error-message">{errors.pf}</span>}
            </label>

            <label htmlFor="tax">
              Income Tax / ESI (₹)
              <input
                id="tax"
                type="number"
                min="0"
                step="any"
                name="tax"
                value={form.tax}
                onChange={handleInputChange}
                placeholder="600"
                className={errors.tax ? 'input-error' : ''}
              />
              {errors.tax && <span className="error-message">{errors.tax}</span>}
            </label>

            <label htmlFor="deductions">
              Other Deductions (₹)
              <input
                id="deductions"
                type="number"
                min="0"
                step="any"
                name="deductions"
                value={form.deductions}
                onChange={handleInputChange}
                placeholder="0"
                className={errors.deductions ? 'input-error' : ''}
              />
              {errors.deductions && <span className="error-message">{errors.deductions}</span>}
            </label>
          </div>
        </div>

        <div className="form-actions-bar">
          {onCancel && (
            <button type="button" className="secondary-button" onClick={onCancel} disabled={submitting}>
              <X size={16} /> Cancel
            </button>
          )}
          <button type="submit" className="primary-button" disabled={submitting}>
            <Save size={16} /> {submitting ? 'Saving...' : isEdit ? 'Update Employee' : 'Save Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
