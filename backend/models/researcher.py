"""研究人员数据访问"""
from backend.utils.db import execute_query, execute_one


def get_all():
    return execute_query("SELECT * FROM researcher ORDER BY researcher_id")


def get_by_id(researcher_id):
    return execute_one("SELECT * FROM researcher WHERE researcher_id=%s", (researcher_id,))


def get_by_role(role):
    return execute_query("SELECT * FROM researcher WHERE role=%s", (role,))
