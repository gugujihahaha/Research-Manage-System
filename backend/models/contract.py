"""合同数据访问"""
from backend.utils.db import execute_insert


def create(data):
    return execute_insert(
        "INSERT INTO contract (project_id, file_url, sign_date, content) VALUES (%s, %s, %s, %s)",
        (data['project_id'], data['file_url'], data['sign_date'], data.get('content')))
