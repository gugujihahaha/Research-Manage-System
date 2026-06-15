"""项目数据访问"""
from backend.utils.db import execute_query, execute_one, execute_insert, execute_update


def get_all():
    return execute_query("SELECT * FROM project ORDER BY apply_date DESC")


def get_by_id(project_id):
    return execute_one("SELECT * FROM project WHERE project_id=%s", (project_id,))


def create(data):
    execute_insert(
        """INSERT INTO project
        (project_id, name, type, level, leader_id, apply_date, start_date, end_date, budget_total, status, file_url)
        VALUES (%s, %s, %s, %s, %s, CURDATE(), %s, %s, %s, '申报中', %s)""",
        (data['project_id'], data['name'], data['type'], data['level'], data['leader_id'],
         data['start_date'], data['end_date'], data['budget_total'], data.get('file_url')))


def update(project_id, data):
    """更新项目基本信息"""
    fields = []
    values = []
    for key in ['name', 'type', 'level', 'start_date', 'end_date', 'budget_total']:
        if key in data and data[key] is not None:
            fields.append(f'{key}=%s')
            values.append(data[key])
    if fields:
        values.append(project_id)
        execute_update(f"UPDATE project SET {', '.join(fields)} WHERE project_id=%s", tuple(values))


def update_status(project_id, status):
    return execute_update("UPDATE project SET status=%s WHERE project_id=%s", (status, project_id))


def delete(project_id):
    """删除项目（级联删除预算由数据库 ON DELETE CASCADE 处理）"""
    execute_update("DELETE FROM project WHERE project_id=%s", (project_id,))


def get_expiring():
    return execute_query("""
        SELECT project_id, name, end_date, DATEDIFF(end_date, CURDATE()) as days_left
        FROM project
        WHERE end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
          AND status NOT IN ('验收通过','终止')
        ORDER BY days_left
    """)
