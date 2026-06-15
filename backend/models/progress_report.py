"""进展报告数据访问"""
from backend.utils.db import execute_insert


def create(data):
    return execute_insert(
        "INSERT INTO progress_report (project_id, report_year, submit_date, content, status) VALUES (%s, %s, CURDATE(), %s, '待审核')",
        (data['project_id'], data['year'], data['content']))
