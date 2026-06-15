"""验收管理业务编排"""
from flask import jsonify
from backend.models import acceptance, project


def apply_acceptance(project_id, material_url):
    project.update_status(project_id, '验收申请')
    acceptance.create_apply(project_id, material_url)


def review_acceptance(project_id, result, comment):
    """验收评审：通过→验收通过（触发器自动记录日期），不通过→退回执行中"""
    acceptance.update_review(project_id, result, comment)
    new_status = '验收通过' if result == '通过' else '执行中'
    project.update_status(project_id, new_status)


def issue_certificate(project_id, certificate_url):
    acceptance.update_certificate(project_id, certificate_url)
