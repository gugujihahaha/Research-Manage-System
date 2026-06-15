"""成果管理 API"""
from flask import Blueprint, request
from backend.models.achievement import create as create_ach, get_by_project
from backend.utils.db import execute_query, execute_update
from backend.utils.response import success

achievements_bp = Blueprint('achievements', __name__)


@achievements_bp.route('/achievements', methods=['POST'])
def add_achievement():
    create_ach(request.json)
    return success(message='成果登记成功，等待审核')


@achievements_bp.route('/achievements/<project_id>', methods=['GET'])
def list_achievements(project_id):
    return success(get_by_project(project_id))


@achievements_bp.route('/pending-achievements', methods=['GET'])
def pending_achievements():
    rows = execute_query("SELECT a.*, p.name as project_name FROM achievement a JOIN project p ON a.project_id=p.project_id WHERE a.status='待审核' ORDER BY a.publish_date DESC")
    return success(rows)


@achievements_bp.route('/achievements/<int:ach_id>/review', methods=['PUT'])
def review_achievement(ach_id):
    data = request.json
    status = data.get('status', '已通过')
    execute_update("UPDATE achievement SET status=%s WHERE ach_id=%s", (status, ach_id))
    return success(message='审核完成')
