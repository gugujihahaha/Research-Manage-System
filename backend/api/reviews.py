"""评审 API"""
from flask import Blueprint, request, session
from backend.services.project_service import submit_review
from backend.utils.db import execute_query
from backend.utils.response import success, fail

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('/reviews', methods=['POST'])
def do_submit_review():
    submit_review(request.json)
    return success(message='评审提交成功')


@reviews_bp.route('/reviews/<project_id>/<expert_id>', methods=['DELETE'])
def withdraw_review(project_id, expert_id):
    """专家撤回自己的评审"""
    from backend.utils.db import execute_update, execute_one
    review = execute_one("SELECT * FROM review WHERE project_id=%s AND expert_id=%s", (project_id, expert_id))
    if not review:
        return fail('评审记录不存在', 404)
    if not review['result']:
        return fail('该评审尚未提交，无需撤回')
    execute_update("UPDATE review SET result=NULL, score=0, comment=NULL WHERE project_id=%s AND expert_id=%s", (project_id, expert_id))
    # 撤回后项目状态退回专家评审
    execute_update("UPDATE project SET status='专家评审' WHERE project_id=%s", (project_id,))
    return success(message='评审已撤回，项目退回专家评审状态')


@reviews_bp.route('/expert/tasks', methods=['GET'])
def expert_tasks():
    """获取当前专家待评审的项目列表"""
    user = session.get('user')
    if not user or user['role'] != '专家':
        return success([])
    tasks = execute_query("""
        SELECT r.review_id, r.project_id, p.name as project_name, p.type, p.level,
               p.leader_id, r.review_date
        FROM review r
        JOIN project p ON r.project_id = p.project_id
        WHERE r.expert_id = %s AND r.result IS NULL
        ORDER BY r.review_date DESC
    """, (user['researcher_id'],))
    return success(tasks)
