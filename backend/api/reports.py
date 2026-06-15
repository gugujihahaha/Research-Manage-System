"""进展报告 & 变更申请 API"""
from flask import Blueprint, request
from backend.utils.db import execute_query, execute_update, execute_one
from backend.utils.response import success, fail

reports_bp = Blueprint('reports', __name__)


# ========== 进展报告 ==========

@reports_bp.route('/progress_reports', methods=['POST'])
def add_progress_report():
    data = request.json
    from backend.models.progress_report import create as create_report
    create_report(data)
    return success(message='进展报告已提交')


@reports_bp.route('/projects/<project_id>/reports', methods=['GET'])
def list_reports(project_id):
    rows = execute_query("SELECT * FROM progress_report WHERE project_id=%s ORDER BY submit_date DESC", (project_id,))
    return success(rows)


@reports_bp.route('/pending-reports', methods=['GET'])
def all_pending_reports():
    """科研处查看所有待审核的进展报告"""
    rows = execute_query("""
        SELECT r.*, p.name as project_name FROM progress_report r
        JOIN project p ON r.project_id = p.project_id
        WHERE r.status = '待审核' ORDER BY r.submit_date DESC
    """)
    return success(rows)


@reports_bp.route('/pending-changes', methods=['GET'])
def all_pending_changes():
    """科研处查看所有待审批的变更申请"""
    rows = execute_query("""
        SELECT c.*, p.name as project_name FROM change_request c
        JOIN project p ON c.project_id = p.project_id
        WHERE c.approval_status = '待审批' ORDER BY c.apply_date DESC
    """)
    return success(rows)


@reports_bp.route('/progress_reports/<int:report_id>', methods=['PUT'])
def review_report(report_id):
    data = request.json
    status = data.get('status', '已审核')
    r = execute_one("SELECT * FROM progress_report WHERE report_id=%s", (report_id,))
    if not r:
        return fail('报告不存在', 404)
    execute_update(
        "UPDATE progress_report SET status=%s WHERE report_id=%s",
        (status, report_id))
    return success(message='审核完成')


# ========== 变更申请 ==========

@reports_bp.route('/change_requests', methods=['POST'])
def add_change_request():
    from backend.models.change_request import create as create_change
    create_change(request.json)
    return success(message='变更申请已提交')


@reports_bp.route('/projects/<project_id>/changes', methods=['GET'])
def list_changes(project_id):
    rows = execute_query("SELECT * FROM change_request WHERE project_id=%s ORDER BY apply_date DESC", (project_id,))
    return success(rows)


@reports_bp.route('/change_requests/<int:request_id>', methods=['PUT'])
def review_change(request_id):
    data = request.json
    status = data.get('status', '已通过')
    r = execute_one("SELECT * FROM change_request WHERE request_id=%s", (request_id,))
    if not r:
        return fail('申请不存在', 404)
    execute_update(
        "UPDATE change_request SET approval_status=%s WHERE request_id=%s",
        (status, request_id))
    return success(message='审核完成')
