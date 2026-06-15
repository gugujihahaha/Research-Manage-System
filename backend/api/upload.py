"""文件上传 API"""
import os
from datetime import datetime
from flask import Blueprint, request
from werkzeug.utils import secure_filename
from backend.utils.response import success, fail

upload_bp = Blueprint('upload', __name__)
UPLOAD_FOLDER = 'uploads'


@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file:
        return fail('未选择文件')
    filename = secure_filename(file.filename)
    unique_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
    path = os.path.join(UPLOAD_FOLDER, unique_name)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(path)
    return success({'url': f'/uploads/{unique_name}'}, '上传成功')
