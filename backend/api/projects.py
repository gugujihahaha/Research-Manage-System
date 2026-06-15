"""项目申报管理 API"""
from flask import Blueprint, request
from backend.services.project_service import (
    get_all_projects, get_project, apply_project,
    form_review, assign_experts, approve_project, get_expiring_projects, delete_project, edit_project, withdraw_project
)
from backend.utils.response import success, fail

projects_bp = Blueprint('projects', __name__)


@projects_bp.route('/projects', methods=['GET'])
def list_projects():
    return success(get_all_projects())


@projects_bp.route('/projects/<project_id>', methods=['GET'])
def get_one(project_id):
    return success(get_project(project_id))


@projects_bp.route('/projects', methods=['POST'])
def create_project():
    pid = apply_project(request.json)
    return success({'project_id': pid}, f'申报成功，项目编号：{pid}')


@projects_bp.route('/projects/<project_id>', methods=['DELETE'])
def remove_project(project_id):
    p = get_project(project_id)
    if not p:
        return fail('项目不存在', 404)
    if p['status'] not in ('申报中', '形式审查'):
        return fail('只能删除申报中或形式审查阶段的项目')
    delete_project(project_id)
    return success(message='项目已删除')


@projects_bp.route('/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    p = get_project(project_id)
    if not p:
        return fail('项目不存在', 404)
    if p['status'] != '申报中':
        return fail('只能编辑申报中的项目')
    edit_project(project_id, request.json)
    return success(message='项目信息已更新')


@projects_bp.route('/projects/<project_id>/withdraw', methods=['PUT'])
def do_withdraw(project_id):
    p = get_project(project_id)
    if not p:
        return fail('项目不存在', 404)
    if p['status'] not in ('申报中', '形式审查', '专家评审'):
        return fail('当前状态不可撤回')
    withdraw_project(project_id)
    return success(message='项目已撤回')


@projects_bp.route('/projects/<project_id>/form_review', methods=['PUT'])
def do_form_review(project_id):
    result = request.json.get('result')
    form_review(project_id, result)
    return success(message='形式审查完成')


@projects_bp.route('/projects/<project_id>/assign_experts', methods=['POST'])
def do_assign_experts(project_id):
    expert_ids = request.json.get('expert_ids', [])
    from backend.utils.db import execute_query
    existing = execute_query("SELECT expert_id FROM review WHERE project_id=%s", (project_id,))
    existing_ids = {r['expert_id'] for r in existing}
    new_ids = [eid for eid in expert_ids if eid not in existing_ids]
    skipped = len(expert_ids) - len(new_ids)
    if new_ids:
        assign_experts(project_id, new_ids)
    msg = '专家已分配' if not skipped else f'{len(new_ids)}位专家已分配，{skipped}位已存在跳过'
    return success(message=msg)


@projects_bp.route('/projects/<project_id>/approve', methods=['PUT'])
def do_approve(project_id):
    approve_project(project_id)
    return success(message='立项成功')


@projects_bp.route('/projects/<project_id>/timeline', methods=['GET'])
def project_timeline(project_id):
    """获取项目进度详情"""
    p = get_project(project_id)
    if not p:
        return fail('项目不存在', 404)
    from backend.utils.db import execute_query, execute_one
    reviews = execute_query(
        "SELECT r.*, res.name as expert_name, res.title as expert_title FROM review r LEFT JOIN researcher res ON r.expert_id=res.researcher_id WHERE r.project_id=%s ORDER BY r.review_date",
        (project_id,))
    cert = execute_one("SELECT certificate_url FROM acceptance WHERE project_id=%s AND certificate_url IS NOT NULL AND certificate_url != ''", (project_id,))
    return success({'project': p, 'reviews': reviews, 'cert_url': cert['certificate_url'] if cert else None})


@projects_bp.route('/projects/<project_id>/revoke', methods=['PUT'])
def do_revoke(project_id):
    """科研处撤回已立项的项目"""
    p = get_project(project_id)
    if not p:
        return fail('项目不存在', 404)
    if p['status'] not in ('已立项', '立项公示'):
        return fail('只能撤回已立项或立项公示的项目')
    from backend.models.project import update_status
    update_status(project_id, '专家评审')
    return success(message='已撤回立项')


@projects_bp.route('/expiring_projects', methods=['GET'])
def list_expiring():
    return success(get_expiring_projects())
