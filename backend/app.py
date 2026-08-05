import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db, Employee
from routes import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend requests
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize SQLAlchemy database
    db.init_app(app)

    # Register API blueprint
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def root():
        return jsonify({
            'name': 'Employee Payslip Management API',
            'version': '2.0.0',
            'status': 'running'
        })

    # Automatically create tables and seed default data on startup
    with app.app_context():
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        db.create_all()
        seed_default_employees()

    return app

def seed_default_employees():
    if Employee.query.count() == 0:
        sample_employees = [
            {
                'employee_id': 'EMP1001',
                'full_name': 'Asha Rao',
                'email': 'asha.rao@company.com',
                'phone': '+91 9876543210',
                'department': 'Engineering',
                'designation': 'Developer',
                'joining_date': '2024-01-10',
                'basic_salary': 30000.0,
                'hra': 6000.0,      # 20% HRA
                'da': 3000.0,       # 10% DA
                'bonus': 1500.0,    # 5% Allowances/Bonus
                'pf': 3600.0,       # 12% PF
                'tax': 600.0,       # 2% Tax
                'deductions': 0.0
            },
            {
                'employee_id': 'EMP1002',
                'full_name': 'Vikram Sharma',
                'email': 'vikram.sharma@company.com',
                'phone': '+91 9812345678',
                'department': 'Human Resources',
                'designation': 'HR Manager',
                'joining_date': '2023-05-15',
                'basic_salary': 45000.0,
                'hra': 9000.0,
                'da': 4500.0,
                'bonus': 2000.0,
                'pf': 5400.0,
                'tax': 1500.0,
                'deductions': 500.0
            },
            {
                'employee_id': 'EMP1003',
                'full_name': 'Priya Nair',
                'email': 'priya.nair@company.com',
                'phone': '+91 9988776655',
                'department': 'Design',
                'designation': 'UI/UX Lead',
                'joining_date': '2023-11-01',
                'basic_salary': 40000.0,
                'hra': 8000.0,
                'da': 4000.0,
                'bonus': 2500.0,
                'pf': 4800.0,
                'tax': 1000.0,
                'deductions': 0.0
            }
        ]

        for data in sample_employees:
            emp = Employee(**data)
            emp.calculate_net_salary()
            db.session.add(emp)
        
        db.session.commit()

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
