import { useEffect, useMemo, useState } from 'react';
import './App.css';

const emptyEmployee = {
  name: '',
  employeeId: '',
  designation: '',
  joiningDate: '',
  basicSalary: '',
  hra: '',
  da: '',
  otherAllowances: '',
  esi: '',
  pf: '',
};

const defaultEmployees = [
  {
    name: 'Asha Rao',
    employeeId: 'EMP1001',
    designation: 'Developer',
    joiningDate: '2024-01-10',
    basicSalary: '30000',
    hra: '20',
    da: '10',
    otherAllowances: '5',
    esi: '2',
    pf: '12',
  },
];

const storageKey = 'employee-payslip-data';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

function App() {
  const [employees, setEmployees] = useState(() => {
    const savedData = window.localStorage.getItem(storageKey);
    if (!savedData) return defaultEmployees;

    try {
      return JSON.parse(savedData);
    } catch (error) {
      return defaultEmployees;
    }
  });
  const [form, setForm] = useState(emptyEmployee);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [leaveCount, setLeaveCount] = useState(0);
  const [payslip, setPayslip] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(employees));
  }, [employees]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.employeeId === selectedEmployeeId) || null,
    [employees, selectedEmployeeId],
  );

  const filteredEmployees = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) => {
      const haystack = `${employee.name} ${employee.employeeId} ${employee.designation}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [employees, employeeSearch]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveEmployee = (event) => {
    event.preventDefault();

    const nextEmployee = {
      ...form,
      employeeId: form.employeeId.trim(),
      name: form.name.trim(),
      designation: form.designation.trim(),
    };

    if (!nextEmployee.name || !nextEmployee.employeeId || !nextEmployee.designation) {
      return;
    }

    const existingIndex = employees.findIndex((employee) => employee.employeeId === nextEmployee.employeeId);

    if (existingIndex >= 0 && editingEmployeeId !== nextEmployee.employeeId) {
      return;
    }

    if (editingEmployeeId) {
      const updatedEmployees = employees.map((employee) =>
        employee.employeeId === editingEmployeeId ? nextEmployee : employee,
      );
      setEmployees(updatedEmployees);
    } else if (existingIndex >= 0) {
      const updatedEmployees = [...employees];
      updatedEmployees[existingIndex] = nextEmployee;
      setEmployees(updatedEmployees);
    } else {
      setEmployees((current) => [...current, nextEmployee]);
    }

    setSelectedEmployeeId(nextEmployee.employeeId);
    setEditingEmployeeId(null);
    setForm(emptyEmployee);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployeeId(employee.employeeId);
    setForm({
      ...emptyEmployee,
      ...employee,
    });
    setSelectedEmployeeId(employee.employeeId);
  };

  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setForm(emptyEmployee);
  };

  const handleGeneratePayslip = (event) => {
    event.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    const basicSalary = Number(selectedEmployee.basicSalary || 0);
    const hraAmount = (basicSalary * Number(selectedEmployee.hra || 0)) / 100;
    const daAmount = (basicSalary * Number(selectedEmployee.da || 0)) / 100;
    const otherAllowancesAmount = (basicSalary * Number(selectedEmployee.otherAllowances || 0)) / 100;
    const grossSalary = basicSalary + hraAmount + daAmount + otherAllowancesAmount;
    const esiAmount = (basicSalary * Number(selectedEmployee.esi || 0)) / 100;
    const pfAmount = (basicSalary * Number(selectedEmployee.pf || 0)) / 100;
    const totalDeductions = esiAmount + pfAmount;
    const workingDays = Math.max(0, 30 - Number(leaveCount || 0));
    const adjustedGross = (grossSalary * workingDays) / 30;
    const adjustedDeductions = (totalDeductions * workingDays) / 30;
    const netSalary = adjustedGross - adjustedDeductions;

    setPayslip({
      employee: selectedEmployee,
      leaveCount: Number(leaveCount || 0),
      workingDays,
      grossSalary: adjustedGross,
      deductions: adjustedDeductions,
      netSalary,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '', 'width=900,height=700');

    if (!printWindow || !payslip) {
      return;
    }

    const content = `
      <html>
        <head>
          <title>Payslip - ${payslip.employee.name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #14213d; background: #f8fafc; }
            .sheet { border: 1px solid #d0d7de; background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1f72d8; padding-bottom: 12px; margin-bottom: 18px; }
            .brand { font-size: 24px; font-weight: 700; color: #143b6d; }
            .sub { color: #5b6b7a; margin-top: 4px; font-size: 13px; }
            .badge { background: #143b6d; color: white; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
            .section { margin-top: 16px; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #1f72d8; margin-bottom: 8px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eef2f7; }
            .label { font-weight: 600; color: #334155; }
            .value { font-weight: 600; color: #0f172a; }
            .total { margin-top: 12px; padding-top: 12px; border-top: 2px solid #1f72d8; font-size: 16px; }
            .highlight { color: #0f766e; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div>
                <div class="brand">Employee Payslip</div>
                <div class="sub">Official monthly salary statement</div>
              </div>
              <div class="badge">Generated Payslip</div>
            </div>

            <div class="section">
              <div class="section-title">Employee Details</div>
              <div class="row"><span class="label">Employee Name</span><span class="value">${payslip.employee.name}</span></div>
              <div class="row"><span class="label">Designation</span><span class="value">${payslip.employee.designation}</span></div>
              <div class="row"><span class="label">Employee ID</span><span class="value">${payslip.employee.employeeId}</span></div>
              <div class="row"><span class="label">Joining Date</span><span class="value">${payslip.employee.joiningDate}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Attendance & Pay</div>
              <div class="row"><span class="label">Leave Count</span><span class="value">${payslip.leaveCount}</span></div>
              <div class="row"><span class="label">Working Days</span><span class="value">${payslip.workingDays}</span></div>
              <div class="row"><span class="label">Gross Salary</span><span class="value">${formatCurrency(payslip.grossSalary)}</span></div>
              <div class="row"><span class="label">Deductions</span><span class="value">${formatCurrency(payslip.deductions)}</span></div>
              <div class="row total"><span class="label">Net Salary</span><span class="value highlight">${formatCurrency(payslip.netSalary)}</span></div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">HR Payroll Workspace</p>
          <h1>Employee Payslip Generation System</h1>
          <p className="subtitle">Create employee records, calculate monthly salary, and print payslips in seconds.</p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>Employee Module</h2>
          <form onSubmit={handleSaveEmployee} className="form-grid">
            <label htmlFor="employee-name">
              Employee Name
              <input id="employee-name" name="name" value={form.name} onChange={handleInputChange} required />
            </label>
            <label htmlFor="employee-id">
              Employee ID
              <input id="employee-id" name="employeeId" value={form.employeeId} onChange={handleInputChange} required />
            </label>
            <label htmlFor="employee-designation">
              Designation
              <input id="employee-designation" name="designation" value={form.designation} onChange={handleInputChange} required />
            </label>
            <label htmlFor="joining-date">
              Joining Date
              <input id="joining-date" type="date" name="joiningDate" value={form.joiningDate} onChange={handleInputChange} required />
            </label>
            <label htmlFor="basic-salary">
              Basic Salary
              <input id="basic-salary" type="number" name="basicSalary" value={form.basicSalary} onChange={handleInputChange} required />
            </label>
            <label htmlFor="hra">
              HRA %
              <input id="hra" type="number" name="hra" value={form.hra} onChange={handleInputChange} required />
            </label>
            <label htmlFor="da">
              DA %
              <input id="da" type="number" name="da" value={form.da} onChange={handleInputChange} required />
            </label>
            <label htmlFor="allowances">
              Other Allowances %
              <input id="allowances" type="number" name="otherAllowances" value={form.otherAllowances} onChange={handleInputChange} required />
            </label>
            <label htmlFor="esi">
              ESI %
              <input id="esi" type="number" name="esi" value={form.esi} onChange={handleInputChange} required />
            </label>
            <label htmlFor="pf">
              PF %
              <input id="pf" type="number" name="pf" value={form.pf} onChange={handleInputChange} required />
            </label>
            <div className="form-actions">
              <button type="submit">{editingEmployeeId ? 'Update Employee' : 'Save Employee'}</button>
              {editingEmployeeId ? (
                <button type="button" className="secondary-button" onClick={handleCancelEdit}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>

          <div className="employee-list">
            <h3>Saved Employees</h3>
            <input
              type="search"
              placeholder="Search employees"
              value={employeeSearch}
              onChange={(event) => setEmployeeSearch(event.target.value)}
            />
            {filteredEmployees.map((employee) => (
              <div key={employee.employeeId} className={`employee-card ${selectedEmployeeId === employee.employeeId ? 'active' : ''}`}>
                <button
                  type="button"
                  className="employee-card-button"
                  onClick={() => setSelectedEmployeeId(employee.employeeId)}
                >
                  <strong>{employee.name}</strong>
                  <span>{employee.employeeId}</span>
                  <small>{employee.designation}</small>
                </button>
                <button type="button" className="edit-button" onClick={() => handleEditEmployee(employee)}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel payslip-panel">
          <h2>Payslip Generator</h2>
          <form onSubmit={handleGeneratePayslip} className="form-grid compact">
            <label htmlFor="employee-select">
              Employee Selection
              <select id="employee-select" value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)}>
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.name} ({employee.employeeId})
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="leave-count">
              Leave Count
              <input id="leave-count" type="number" min="0" max="30" value={leaveCount} onChange={(event) => setLeaveCount(event.target.value)} required />
            </label>
            <button type="submit">Generate Payslip</button>
          </form>

          <div className="payslip-print-area">
            {payslip ? (
              <div className="payslip-card">
                <div className="payslip-header">
                  <div>
                    <h3>{payslip.employee.name}</h3>
                    <p>{payslip.employee.designation}</p>
                  </div>
                  <div className="payslip-actions">
                    <button type="button" onClick={handlePrint}>Print Payslip</button>
                    <button type="button" className="secondary-button" onClick={handleDownloadPdf}>Download PDF</button>
                  </div>
                </div>
                <div className="payslip-grid">
                  <div>
                    <p><strong>Employee ID:</strong> {payslip.employee.employeeId}</p>
                    <p><strong>Joining Date:</strong> {payslip.employee.joiningDate}</p>
                    <p><strong>Leave Count:</strong> {payslip.leaveCount}</p>
                    <p><strong>Working Days:</strong> {payslip.workingDays}</p>
                  </div>
                  <div>
                    <p><strong>Gross Salary:</strong> {formatCurrency(payslip.grossSalary)}</p>
                    <p><strong>Deductions:</strong> {formatCurrency(payslip.deductions)}</p>
                    <p className="net-salary"><strong>Net Salary:</strong> {formatCurrency(payslip.netSalary)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">Select an employee and create a payslip to preview it here.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
