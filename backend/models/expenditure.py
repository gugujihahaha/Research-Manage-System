"""经费收支数据访问"""
from backend.utils.db import execute_query, execute_insert, execute_update

def create_income(data):
    return execute_insert(
        """INSERT INTO expenditure (project_id, type, amount, exp_date, purpose, operator_id, approval_status)
           VALUES (%s, '到账', %s, %s, %s, %s, '待审批')""",
        (data['project_id'], data['amount'], data['exp_date'], data.get('purpose'), data['operator_id']))


def create_expense(data):
    return execute_insert(
        """INSERT INTO expenditure (project_id, budget_id, type, amount, exp_date, purpose, operator_id, approval_status)
           VALUES (%s, %s, '支出', %s, %s, %s, %s, '待审批')""",
        (data['project_id'], data['budget_id'], data['amount'], data['exp_date'], data.get('purpose'), data['operator_id']))


def approve(exp_id, result):
    status = '已通过' if result == '通过' else '已驳回'
    return execute_update(
        "UPDATE expenditure SET approval_status=%s WHERE exp_id=%s",
        (status, exp_id))


def get_funding_status(project_id):
    return execute_query(
        "SELECT * FROM v_project_budget_status WHERE project_id=%s",
        (project_id,))
