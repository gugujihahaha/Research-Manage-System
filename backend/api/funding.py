"""经费管理 API"""
from flask import Blueprint, request
from backend.services.funding_service import (
    register_income, register_expense, approve_funding, get_funding_status
)
from backend.utils.response import success

funding_bp = Blueprint('funding', __name__)


@funding_bp.route('/funding/income', methods=['POST'])
def do_income():
    register_income(request.json)
    return success(message='到账登记成功，等待财务审批')


@funding_bp.route('/funding/expenditure', methods=['POST'])
def do_expenditure():
    register_expense(request.json)
    return success(message='报销申请已提交')


@funding_bp.route('/funding/approve', methods=['PUT'])
def do_approve():
    data = request.json
    approve_funding(data['exp_id'], data['result'])
    return success(message='审批完成')


@funding_bp.route('/funding/status/<project_id>', methods=['GET'])
def status(project_id):
    result = get_funding_status(project_id)
    return success(result)


@funding_bp.route('/funding/pending', methods=['GET'])
def pending_expenditures():
    """财务处查看所有待审批的经费记录"""
    from backend.utils.db import execute_query
    rows = execute_query("""
        SELECT e.*, p.name as project_name, b.category as budget_category
        FROM expenditure e
        JOIN project p ON e.project_id = p.project_id
        LEFT JOIN budget b ON e.budget_id = b.budget_id
        WHERE e.approval_status = '待审批'
        ORDER BY e.exp_date DESC
    """)
    return success(rows)


@funding_bp.route('/funding/surplus', methods=['POST'])
def do_surplus():
    data = request.json
    return success(message=f"项目{data['project_id']}结余经费已{data['action']}")
