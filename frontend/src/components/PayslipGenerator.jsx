import React, { useState, useEffect, useRef } from 'react';
import { fetchEmployees, getUploadUrl } from '../api';
import { Printer, Download, FileText, Calculator } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val || 0);

const PayslipGenerator = ({ initialEmployeeId, showToast }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(initialEmployeeId || '');
  const [leaveCount, setLeaveCount] = useState(0);
  const [payslip, setPayslip] = useState(null);
  const payslipRef = useRef(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        const list = Array.isArray(data) ? data : data.employees || [];
        setEmployees(list);

        if (initialEmployeeId) {
          setSelectedId(initialEmployeeId);
        } else if (list.length > 0 && !selectedId) {
          setSelectedId(list[0].employee_id);
        }
      } catch (err) {
        console.error('Failed to load employee dropdown:', err);
      }
    };

    loadEmployees();
  }, [initialEmployeeId, selectedId]);

  const selectedEmployee = employees.find((emp) => emp.employee_id === selectedId) || null;

  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    if (!selectedEmployee) {
      showToast('Please select an employee to generate payslip.', 'error');
      return;
    }

    const basic = Number(selectedEmployee.basic_salary || 0);
    const hra = Number(selectedEmployee.hra || 0);
    const da = Number(selectedEmployee.da || 0);
    const bonus = Number(selectedEmployee.bonus || 0);

    const grossSalary = basic + hra + da + bonus;

    const pf = Number(selectedEmployee.pf || 0);
    const tax = Number(selectedEmployee.tax || 0);
    const deductions = Number(selectedEmployee.deductions || 0);

    const totalDeductions = pf + tax + deductions;

    const leaves = Math.max(0, Number(leaveCount || 0));
    const workingDays = Math.max(0, 30 - leaves);

    const adjustedGross = (grossSalary * workingDays) / 30;
    const adjustedDeductions = (totalDeductions * workingDays) / 30;
    const netSalary = Math.max(0, adjustedGross - adjustedDeductions);

    setPayslip({
      employee: selectedEmployee,
      leaveCount: leaves,
      workingDays,
      grossSalary: adjustedGross,
      totalDeductions: adjustedDeductions,
      netSalary,
      breakdown: {
        basic: (basic * workingDays) / 30,
        hra: (hra * workingDays) / 30,
        da: (da * workingDays) / 30,
        bonus: (bonus * workingDays) / 30,
        pf: (pf * workingDays) / 30,
        tax: (tax * workingDays) / 30,
        deductions: (deductions * workingDays) / 30,
      },
    });

    showToast('Payslip generated successfully!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!payslipRef.current) return;
    const element = payslipRef.current;
    const opt = {
      margin: 10,
      filename: `Payslip_${selectedEmployee?.full_name || 'Employee'}_${selectedEmployee?.employee_id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    showToast('Downloading PDF payslip...', 'info');
  };

  const photoUrl = selectedEmployee?.profile_photo ? getUploadUrl(selectedEmployee.profile_photo) : null;

  return (
    <div className="payslip-container">
      <div className="panel generator-panel no-print">
        <div className="panel-header">
          <div>
            <h2>Payslip Generator</h2>
            <p className="subtitle">Select employee and input attendance leave to generate official payslip</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="payslip-form-grid">
          <label htmlFor="employee-select">
            Select Employee *
            <select
              id="employee-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id}) - {emp.department}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="leave-count">
            Leave Count (Days) *
            <input
              id="leave-count"
              type="number"
              min="0"
              max="30"
              value={leaveCount}
              onChange={(e) => setLeaveCount(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="primary-button generate-btn">
            <Calculator size={18} /> Generate Payslip
          </button>
        </form>
      </div>

      <div className="payslip-preview-wrapper">
        {payslip ? (
          <div className="payslip-result">
            <div className="payslip-actions-bar no-print">
              <button className="primary-button" onClick={handlePrint} type="button">
                <Printer size={16} /> Print Payslip
              </button>
              <button className="secondary-button" onClick={handleDownloadPdf} type="button">
                <Download size={16} /> Download PDF
              </button>
            </div>

            <div className="payslip-document-sheet" ref={payslipRef}>
              <div className="sheet-header">
                <div className="company-info">
                  <div className="company-logo">💼</div>
                  <div>
                    <h2 className="company-name">ENTERPRISE HR MANAGEMENT</h2>
                    <p className="company-sub">Official Salary Disbursement Statement</p>
                  </div>
                </div>
                <div className="payslip-badge">PAYSLIP STATEMENT</div>
              </div>

              <div className="employee-info-section">
                {photoUrl && (
                  <div className="payslip-avatar-box">
                    <img src={photoUrl} alt={payslip.employee.full_name} />
                  </div>
                )}
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Employee Name:</span>
                    <span className="info-value"><strong>{payslip.employee.full_name}</strong></span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Employee ID:</span>
                    <span className="info-value">{payslip.employee.employee_id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Department:</span>
                    <span className="info-value">{payslip.employee.department}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Designation:</span>
                    <span className="info-value">{payslip.employee.designation}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Joining Date:</span>
                    <span className="info-value">{payslip.employee.joining_date}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{payslip.employee.email}</span>
                  </div>
                </div>
              </div>

              <div className="attendance-summary-box">
                <div className="att-item">
                  <span>Total Days:</span>
                  <strong>30</strong>
                </div>
                <div className="att-item">
                  <span>Leaves Taken:</span>
                  <strong className="text-danger">{payslip.leaveCount}</strong>
                </div>
                <div className="att-item">
                  <span>Effective Working Days:</span>
                  <strong className="text-success">{payslip.workingDays}</strong>
                </div>
              </div>

              <div className="breakdown-tables-container">
                <div className="breakdown-table-box">
                  <h4 className="table-heading text-success">EARNINGS & ALLOWANCES</h4>
                  <table className="sheet-table">
                    <thead>
                      <tr>
                        <th>Earnings</th>
                        <th className="text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Basic Salary</td>
                        <td className="text-right">{formatCurrency(payslip.breakdown.basic)}</td>
                      </tr>
                      <tr>
                        <td>HRA (House Rent Allowance)</td>
                        <td className="text-right">{formatCurrency(payslip.breakdown.hra)}</td>
                      </tr>
                      <tr>
                        <td>DA (Dearness Allowance)</td>
                        <td className="text-right">{formatCurrency(payslip.breakdown.da)}</td>
                      </tr>
                      <tr>
                        <td>Bonus / Other Allowances</td>
                        <td className="text-right">{formatCurrency(payslip.breakdown.bonus)}</td>
                      </tr>
                      <tr className="total-tr">
                        <td><strong>Gross Earnings</strong></td>
                        <td className="text-right"><strong>{formatCurrency(payslip.grossSalary)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="breakdown-table-box">
                  <h4 className="table-heading text-danger">DEDUCTIONS</h4>
                  <table className="sheet-table">
                    <thead>
                      <tr>
                        <th>Deductions</th>
                        <th className="text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Provident Fund (PF)</td>
                        <td className="text-right">{formatCurrency(payslip.breakdown.pf)}</td>
                      </tr>
                      <tr>
                        <td>Income Tax / ESI</td>
                        <td className="text-right">{formatCurrency(payslip.breakdown.tax)}</td>
                      </tr>
                      <tr>
                        <td>Other Deductions</td>
                        <td className="text-right">{formatCurrency(payslip.breakdown.deductions)}</td>
                      </tr>
                      <tr className="total-tr">
                        <td><strong>Total Deductions</strong></td>
                        <td className="text-right text-danger"><strong>{formatCurrency(payslip.totalDeductions)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="net-pay-banner">
                <div className="banner-left">
                  <span>NET PAYABLE SALARY</span>
                  <small>(Gross Earnings minus Total Deductions)</small>
                </div>
                <div className="banner-right">
                  <h2>{formatCurrency(payslip.netSalary)}</h2>
                </div>
              </div>

              <div className="sheet-footer">
                <p>This is a computer-generated payslip document and does not require a physical signature.</p>
                <div className="signatures">
                  <div>
                    <span className="sig-line"></span>
                    <small>Employer Signature</small>
                  </div>
                  <div>
                    <span className="sig-line"></span>
                    <small>Employee Signature</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state-panel">
            <FileText size={48} />
            <h3>No Payslip Generated Yet</h3>
            <p>Select an employee above and click "Generate Payslip" to view, print, or export as PDF.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayslipGenerator;
