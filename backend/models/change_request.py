"""变更申请数据访问"""
from backend.utils.db import execute_insert


def create(data):
    return execute_insert(
        """INSERT INTO change_request
        (project_id, request_type, old_value, new_value, reason, apply_date, approval_status)
        VALUES (%s, %s, %s, %s, %s, CURDATE(), '待审批')""",
        (data['project_id'], data['type'], data['old_value'], data['new_value'], data['reason']))
