"""通知公告数据访问"""
from backend.utils.db import execute_query, execute_insert


def get_all():
    return execute_query("SELECT * FROM notice ORDER BY publish_date DESC")


def create(title, content, admin_id='admin'):
    return execute_insert(
        "INSERT INTO notice (title, content, publish_date, admin_id) VALUES (%s, %s, CURDATE(), %s)",
        (title, content, admin_id))
