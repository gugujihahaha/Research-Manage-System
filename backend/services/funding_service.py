"""经费管理业务编排"""
from backend.models import expenditure, budget


def register_income(data):
    return expenditure.create_income(data)


def register_expense(data):
    return expenditure.create_expense(data)


def approve_funding(exp_id, result):
    return expenditure.approve(exp_id, result)


def get_funding_status(project_id):
    """获取项目经费执行状态（含汇总）"""
    details = expenditure.get_funding_status(project_id)
    total_budget = sum(d['budget'] for d in details)
    total_spent = sum(d['expended'] for d in details)
    rate = round(total_spent / total_budget * 100, 2) if total_budget else 0
    return {
        'details': details,
        'summary': {
            'total_budget': total_budget,
            'total_spent': total_spent,
            'execute_rate': rate
        }
    }


def get_budgets(project_id):
    return budget.get_by_project(project_id)
