"""项目申报/执行/验收 业务编排"""
from datetime import datetime
from backend.models import project, budget, review, notice
from backend.utils.db import execute_one


def _generate_project_id():
    """自动生成项目编号 P+年份+3位序号，如 P2026001"""
    year = datetime.now().strftime('%Y')
    row = execute_one(
        "SELECT project_id FROM project WHERE project_id LIKE %s ORDER BY project_id DESC LIMIT 1",
        (f'P{year}%',))
    if row and row['project_id']:
        seq = int(row['project_id'][-3:]) + 1
    else:
        seq = 1
    return f'P{year}{seq:03d}'


def publish_notice(title, content, admin_id='admin'):
    notice.create(title, content, admin_id)


def get_notices():
    return notice.get_all()


def apply_project(data):
    """申报项目：自动生成编号 + 创建项目 + 写入预算科目"""
    pid = _generate_project_id()
    data['project_id'] = pid
    project.create(data)
    for b in data.get('budgets', []):
        budget.create(pid, b['category'], b['amount'])
    return pid


def form_review(project_id, result):
    """形式审查"""
    new_status = '专家评审' if result == '通过' else '申报中'
    project.update_status(project_id, new_status)


def assign_experts(project_id, expert_ids):
    """分配专家"""
    for eid in expert_ids:
        review.create(project_id, eid)


def submit_review(data):
    """提交评审意见：全部通过→立项公示，有任一不通过→退回申报中"""
    review.update(data)
    row = review.check_all_done(data['project_id'])
    if row and row['total'] == row['done']:
        # 检查是否有不通过的
        stats = review.get_result_stats(data['project_id'])
        if stats['fail'] > 0:
            project.update_status(data['project_id'], '申报中')
        else:
            project.update_status(data['project_id'], '立项公示')


def approve_project(project_id):
    """立项审批，直接进入执行阶段"""
    project.update_status(project_id, '执行中')


def get_all_projects():
    return project.get_all()


def get_project(project_id):
    return project.get_by_id(project_id)


def get_expiring_projects():
    return project.get_expiring()


def delete_project(project_id):
    """删除项目及其预算"""
    project.delete(project_id)


def edit_project(project_id, data):
    """编辑项目基本信息"""
    project.update(project_id, data)


def withdraw_project(project_id):
    """撤回项目申报"""
    project.update_status(project_id, '申报中')
