from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    department = db.Column(db.String(50), nullable=False)
    designation = db.Column(db.String(50), nullable=False)
    joining_date = db.Column(db.String(20), nullable=False)
    
    basic_salary = db.Column(db.Float, default=0.0)
    hra = db.Column(db.Float, default=0.0)
    da = db.Column(db.Float, default=0.0)
    bonus = db.Column(db.Float, default=0.0)
    pf = db.Column(db.Float, default=0.0)
    tax = db.Column(db.Float, default=0.0)
    deductions = db.Column(db.Float, default=0.0)
    net_salary = db.Column(db.Float, default=0.0)
    
    profile_photo = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def calculate_net_salary(self):
        basic = float(self.basic_salary or 0.0)
        hra_val = float(self.hra or 0.0)
        da_val = float(self.da or 0.0)
        bonus_val = float(self.bonus or 0.0)

        # Allow hra/da/pf to be given either as fixed amount or percentage of basic if basic > 0
        # If value <= 100 and basic > 0, we can treat them as amount or percentage depending on input.
        # But to be clean and accurate, store direct numerical values (or compute gross - deductions).
        gross = basic + hra_val + da_val + bonus_val
        pf_val = float(self.pf or 0.0)
        tax_val = float(self.tax or 0.0)
        ded_val = float(self.deductions or 0.0)
        tot_deductions = pf_val + tax_val + ded_val

        self.net_salary = max(0.0, round(gross - tot_deductions, 2))
        return self.net_salary

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone or '',
            'department': self.department,
            'designation': self.designation,
            'joining_date': self.joining_date,
            'basic_salary': self.basic_salary,
            'hra': self.hra,
            'da': self.da,
            'bonus': self.bonus,
            'pf': self.pf,
            'tax': self.tax,
            'deductions': self.deductions,
            'net_salary': self.net_salary,
            'profile_photo': self.profile_photo or '',
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else ''
        }
