"""预算数据访问"""
from backend.utils.db import execute_query, execute_insert


def get_by_project(project_id):
    return execute_query(
        "SELECT budget_id, category, amount, spent, fn_budget_warning_level(budget_id) as warning FROM budget WHERE project_id=%s",
        (project_id,))


def create(project_id, category, amount):
    return execute_insert(
        "INSERT INTO budget (project_id, category, amount) VALUES (%s, %s, %s)",
        (project_id, category, amount))
