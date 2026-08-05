# Employee Management & Payslip System (Full-Stack)

A complete, production-ready Full-Stack Employee Management & Payslip System built with **React.js**, **Flask**, **SQLite**, and **Flask-SQLAlchemy**.

---

## Tech Stack

- **Frontend**: React.js, HTML5, CSS3, Lucide React, Axios, HTML2PDF.js
- **Backend**: Python 3, Flask, Flask-SQLAlchemy, Flask-CORS, Werkzeug
- **Database**: SQLite (`employee.db`)
- **API Style**: RESTful APIs with JSON payloads

---

## Key Features

1. **Dashboard & Analytics**
   - Live metrics: Total Employees, Total Monthly Payroll, Average Salary, Departments count, Highest & Lowest Compensation.
   - Department-wise headcount and payroll breakdown table.
   - Quick action shortcuts.

2. **Employee Management (CRUD)**
   - **Create**: Add new employees with profile photo upload, salary components, contact info, and joining date.
   - **Read**: View employee list in table or card grid view.
   - **Update**: Pre-filled edit form for updating employee profile and compensation.
   - **Delete**: Soft/hard delete with confirmation modal dialogs.
   - **Profile Modal**: View complete employee profile, contact details, and breakdown.

3. **Search, Filter, Pagination & Sorting**
   - Search by Name, Employee ID, Department, or Designation.
   - Filter by Department.
   - Sort by Name (A-Z/Z-A), Employee ID, Salary (Highest/Lowest), or Joining Date.
   - Server & Client side pagination controls.

4. **Payslip Generation & PDF Export**
   - Interactive payslip calculation based on basic salary, HRA, DA, bonus, PF, tax, and other deductions.
   - Attendance leave count & effective working days calculation.
   - Print-friendly payslip layout (`window.print()`).
   - One-click PDF download (`html2pdf.js`).

5. **Aesthetics & Dark Mode**
   - Modern glassmorphism UI with smooth transitions and curated color palette.
   - Full dark mode support with instant toggle.
   - Toast notifications for operations (Success/Error/Info).
   - Modal confirmation dialogs before destructive actions.

---

## Directory Structure

```
employee-payslip/
│
├── backend/
│   ├── app.py             # Flask application entry point & factory
│   ├── models.py          # Flask-SQLAlchemy Employee ORM model
│   ├── routes.py          # REST API endpoints & upload handlers
│   ├── config.py          # Database & app configuration
│   ├── employee.db        # SQLite database (auto-created on first run)
│   ├── requirements.txt   # Python backend dependencies
│   └── uploads/           # Directory for employee profile photos
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React components (Dashboard, List, Form, Payslip, Modal, Toast)
│   │   ├── api.js         # Axios API client service
│   │   ├── App.js         # Main React app container
│   │   └── App.css        # Stylesheet with Dark Mode & CSS Variables
│   ├── public/
│   ├── package.json       # React dependencies & scripts
│   └── README.md          # Frontend documentation
│
└── README.md              # Root project documentation
```

---

## Database Schema (`employee.db`)

### `employees` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Internal record ID |
| `employee_id` | VARCHAR(50) | UNIQUE, NOT NULL, INDEX | Unique business employee code (e.g. EMP1001) |
| `full_name` | VARCHAR(100) | NOT NULL | Employee's full name |
| `email` | VARCHAR(120) | NOT NULL | Email address |
| `phone` | VARCHAR(20) | NULLABLE | Phone number |
| `department` | VARCHAR(50) | NOT NULL | Department name |
| `designation` | VARCHAR(50) | NOT NULL | Employee role / job title |
| `joining_date` | VARCHAR(20) | NOT NULL | Date of joining (YYYY-MM-DD) |
| `basic_salary` | FLOAT | DEFAULT 0.0 | Base salary amount |
| `hra` | FLOAT | DEFAULT 0.0 | House Rent Allowance |
| `da` | FLOAT | DEFAULT 0.0 | Dearness Allowance |
| `bonus` | FLOAT | DEFAULT 0.0 | Bonus / Allowances |
| `pf` | FLOAT | DEFAULT 0.0 | Provident Fund deduction |
| `tax` | FLOAT | DEFAULT 0.0 | Income Tax / ESI deduction |
| `deductions` | FLOAT | DEFAULT 0.0 | Other deductions |
| `net_salary` | FLOAT | DEFAULT 0.0 | Automatically calculated: (Gross - Total Deductions) |
| `profile_photo` | VARCHAR(255) | NULLABLE | Saved filename of uploaded profile photo |
| `created_at` | DATETIME | DEFAULT UTC NOW | Record creation timestamp |

---

## REST API Documentation

### Endpoints

| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/employees` | Get all employees | `search`, `department`, `designation`, `sort_by`, `order`, `page`, `per_page` |
| `GET` | `/api/employees/<id>` | Get single employee by ID | None |
| `POST` | `/api/employees` | Create new employee | Form-Data or JSON payload (+ optional `profile_photo` file) |
| `PUT` | `/api/employees/<id>` | Update existing employee | Form-Data or JSON payload |
| `DELETE` | `/api/employees/<id>` | Delete employee record | None |
| `GET` | `/api/dashboard/stats` | Get dashboard summary metrics | None |
| `GET` | `/api/uploads/<filename>` | Serve uploaded profile photos | None |

---

## Installation & Setup Guide

### Prerequisites
- Python 3.8+
- Node.js 16+ & npm

### 1. Setup Backend (Flask)

```bash
cd backend

# (Optional) Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```
Backend will run at: `http://127.0.0.1:5000` (SQLite database `employee.db` will be auto-created and seeded on first run).

### 2. Setup Frontend (React)

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```
Frontend will run at: `http://localhost:3000`

---

## License
MIT License. Created for software engineering portfolio.
