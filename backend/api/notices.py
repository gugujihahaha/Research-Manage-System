"""通知公告 API"""
from flask import Blueprint, request
from backend.services.project_service import publish_notice, get_notices
from backend.utils.response import success

notices_bp = Blueprint('notices', __name__)


@notices_bp.route('/notices', methods=['GET'])
def list_notices():
    return success(get_notices())


@notices_bp.route('/notices', methods=['POST'])
def create_notice():
    data = request.json
    publish_notice(data['title'], data['content'], data.get('admin_id', 'admin'))
    return success(message='通知发布成功')
