"""预算 API"""
from flask import Blueprint
from backend.services.funding_service import get_budgets
from backend.utils.response import success

budgets_bp = Blueprint('budgets', __name__)


@budgets_bp.route('/budgets/<project_id>', methods=['GET'])
def list_budgets(project_id):
    return success(get_budgets(project_id))
