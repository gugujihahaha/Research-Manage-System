"""项目验收 API"""
from flask import Blueprint, request
from backend.services.acceptance_service import (
    apply_acceptance, review_acceptance, issue_certificate
)
from backend.utils.response import success

acceptance_bp = Blueprint('acceptance', __name__)


@acceptance_bp.route('/acceptance/apply', methods=['POST'])
def do_apply():
    data = request.json
    apply_acceptance(data['project_id'], data['material_url'])
    return success(message='验收申请已提交')


@acceptance_bp.route('/acceptance/review', methods=['PUT'])
def do_review():
    data = request.json
    review_acceptance(data['project_id'], data['result'], data['comment'])
    return success(message='验收评审完成')


@acceptance_bp.route('/acceptance/certificate', methods=['POST'])
def do_certificate():
    data = request.json
    issue_certificate(data['project_id'], data['certificate_url'])
    return success(message='结题证书已发放')
