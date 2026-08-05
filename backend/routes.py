import os
import re
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models import db, Employee

api_bp = Blueprint('api', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_employee_data(data, is_update=False, current_id=None):
    errors = {}

    employee_id = data.get('employee_id', '').strip() if data.get('employee_id') else ''
    full_name = data.get('full_name', '').strip() if data.get('full_name') else ''
    email = data.get('email', '').strip() if data.get('email') else ''
    phone = data.get('phone', '').strip() if data.get('phone') else ''
    department = data.get('department', '').strip() if data.get('department') else ''
    designation = data.get('designation', '').strip() if data.get('designation') else ''

    if not employee_id:
        errors['employee_id'] = 'Employee ID is required.'
    else:
        existing = Employee.query.filter_by(employee_id=employee_id).first()
        if existing and (not is_update or existing.id != current_id):
            errors['employee_id'] = 'Employee ID already exists.'

    if not full_name:
        errors['full_name'] = 'Full Name is required.'

    if not email:
        errors['email'] = 'Email address is required.'
    elif not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
        errors['email'] = 'Invalid email address format.'

    if phone and not re.match(r'^\+?[0-9\s\-()]{7,20}$', phone):
        errors['phone'] = 'Invalid phone number format.'

    if not department:
        errors['department'] = 'Department is required.'

    if not designation:
        errors['designation'] = 'Designation is required.'

    for field in ['basic_salary', 'hra', 'da', 'bonus', 'pf', 'tax', 'deductions']:
        val = data.get(field)
        if val is not None and str(val).strip() != '':
            try:
                num = float(val)
                if num < 0:
                    errors[field] = f'{field.replace("_", " ").title()} cannot be negative.'
            except ValueError:
                errors[field] = f'{field.replace("_", " ").title()} must be a valid number.'

    return errors

@api_bp.route('/employees', methods=['GET'])
def get_employees():
    search = request.args.get('search', '').strip()
    department = request.args.get('department', '').strip()
    designation = request.args.get('designation', '').strip()
    sort_by = request.args.get('sort_by', 'full_name')
    order = request.args.get('order', 'asc')
    page = request.args.get('page', type=int)
    per_page = request.args.get('per_page', type=int)

    query = Employee.query

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Employee.full_name.ilike(pattern)) |
            (Employee.employee_id.ilike(pattern)) |
            (Employee.department.ilike(pattern)) |
            (Employee.designation.ilike(pattern)) |
            (Employee.email.ilike(pattern))
        )

    if department:
        query = query.filter(Employee.department.ilike(department))

    if designation:
        query = query.filter(Employee.designation.ilike(designation))

    sort_column = getattr(Employee, sort_by, Employee.full_name)
    if order == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    if page and per_page:
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return jsonify({
            'employees': [emp.to_dict() for emp in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'pages': pagination.pages,
            'per_page': pagination.per_page
        })

    employees = query.all()
    return jsonify([emp.to_dict() for emp in employees])

@api_bp.route('/employees/<int:emp_id>', methods=['GET'])
def get_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return jsonify({'error': 'Employee not found.'}), 404
    return jsonify(employee.to_dict())

@api_bp.route('/employees/by-code/<employee_code>', methods=['GET'])
def get_employee_by_code(employee_code):
    employee = Employee.query.filter_by(employee_id=employee_code).first()
    if not employee:
        return jsonify({'error': 'Employee not found.'}), 404
    return jsonify(employee.to_dict())

@api_bp.route('/employees', methods=['POST'])
def create_employee():
    data = request.form.to_dict() if request.form else (request.get_json() or {})
    
    errors = validate_employee_data(data, is_update=False)
    if errors:
        return jsonify({'error': 'Validation failed.', 'details': errors}), 400

    profile_photo = None
    if 'profile_photo' in request.files:
        file = request.files['profile_photo']
        if file and allowed_file(file.filename):
            filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            profile_photo = filename

    employee = Employee(
        employee_id=data.get('employee_id').strip(),
        full_name=data.get('full_name').strip(),
        email=data.get('email').strip(),
        phone=data.get('phone', '').strip(),
        department=data.get('department').strip(),
        designation=data.get('designation').strip(),
        joining_date=data.get('joining_date', '').strip(),
        basic_salary=float(data.get('basic_salary') or 0.0),
        hra=float(data.get('hra') or 0.0),
        da=float(data.get('da') or 0.0),
        bonus=float(data.get('bonus') or 0.0),
        pf=float(data.get('pf') or 0.0),
        tax=float(data.get('tax') or 0.0),
        deductions=float(data.get('deductions') or 0.0),
        profile_photo=profile_photo
    )
    employee.calculate_net_salary()

    db.session.add(employee)
    db.session.commit()

    return jsonify({
        'message': 'Employee created successfully.',
        'employee': employee.to_dict()
    }), 201

@api_bp.route('/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return jsonify({'error': 'Employee not found.'}), 404

    data = request.form.to_dict() if request.form else (request.get_json() or {})

    errors = validate_employee_data(data, is_update=True, current_id=emp_id)
    if errors:
        return jsonify({'error': 'Validation failed.', 'details': errors}), 400

    if 'profile_photo' in request.files:
        file = request.files['profile_photo']
        if file and allowed_file(file.filename):
            filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            employee.profile_photo = filename

    employee.employee_id = data.get('employee_id', employee.employee_id).strip()
    employee.full_name = data.get('full_name', employee.full_name).strip()
    employee.email = data.get('email', employee.email).strip()
    employee.phone = data.get('phone', employee.phone).strip()
    employee.department = data.get('department', employee.department).strip()
    employee.designation = data.get('designation', employee.designation).strip()
    employee.joining_date = data.get('joining_date', employee.joining_date).strip()
    employee.basic_salary = float(data.get('basic_salary', employee.basic_salary) or 0.0)
    employee.hra = float(data.get('hra', employee.hra) or 0.0)
    employee.da = float(data.get('da', employee.da) or 0.0)
    employee.bonus = float(data.get('bonus', employee.bonus) or 0.0)
    employee.pf = float(data.get('pf', employee.pf) or 0.0)
    employee.tax = float(data.get('tax', employee.tax) or 0.0)
    employee.deductions = float(data.get('deductions', employee.deductions) or 0.0)

    employee.calculate_net_salary()
    db.session.commit()

    return jsonify({
        'message': 'Employee updated successfully.',
        'employee': employee.to_dict()
    })

@api_bp.route('/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return jsonify({'error': 'Employee not found.'}), 404

    db.session.delete(employee)
    db.session.commit()

    return jsonify({'message': f'Employee {employee.full_name} deleted successfully.'})

@api_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    employees = Employee.query.all()
    total_employees = len(employees)

    if total_employees == 0:
        return jsonify({
            'total_employees': 0,
            'total_payroll': 0.0,
            'average_salary': 0.0,
            'departments_count': 0,
            'departments': [],
            'highest_salary': 0.0,
            'lowest_salary': 0.0,
            'department_breakdown': []
        })

    total_payroll = sum(emp.net_salary for emp in employees)
    average_salary = round(total_payroll / total_employees, 2)
    highest_salary = max(emp.net_salary for emp in employees)
    lowest_salary = min(emp.net_salary for emp in employees)

    dept_counts = {}
    dept_payrolls = {}
    for emp in employees:
        dept = emp.department or 'Unassigned'
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        dept_payrolls[dept] = dept_payrolls.get(dept, 0.0) + emp.net_salary

    dept_breakdown = [
        {
            'department': dept,
            'count': count,
            'payroll': round(dept_payrolls[dept], 2)
        }
        for dept, count in dept_counts.items()
    ]

    return jsonify({
        'total_employees': total_employees,
        'total_payroll': round(total_payroll, 2),
        'average_salary': average_salary,
        'departments_count': len(dept_counts),
        'departments': list(dept_counts.keys()),
        'highest_salary': round(highest_salary, 2),
        'lowest_salary': round(lowest_salary, 2),
        'department_breakdown': dept_breakdown
    })

@api_bp.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
