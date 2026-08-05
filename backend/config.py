import os
import shutil

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

is_vercel = os.environ.get('VERCEL') == '1' or 'VERCEL' in os.environ

if is_vercel:
    tmp_dir = '/tmp'
    db_path = os.path.join(tmp_dir, 'employee.db')
    upload_dir = os.path.join(tmp_dir, 'uploads')
    
    # Copy seed DB if it exists in BASE_DIR and not in /tmp
    orig_db = os.path.join(BASE_DIR, 'employee.db')
    if os.path.exists(orig_db) and not os.path.exists(db_path):
        try:
            shutil.copyfile(orig_db, db_path)
        except Exception:
            pass

    SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
    UPLOAD_FOLDER = upload_dir
else:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f"sqlite:///{os.path.join(BASE_DIR, 'employee.db')}"
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-employee-payslip-2026')
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = UPLOAD_FOLDER
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
