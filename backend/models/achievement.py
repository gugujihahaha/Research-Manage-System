"""成果数据访问"""
from backend.utils.db import execute_query, execute_insert


def create(data):
    return execute_insert(
        """INSERT INTO achievement (project_id, type, title, publish_date, author, file_url, status)
           VALUES (%s, %s, %s, %s, %s, %s, '待审核')""",
        (data['project_id'], data['type'], data['title'], data['publish_date'], data['author'], data.get('file_url')))


def get_by_project(project_id):
    return execute_query("SELECT * FROM achievement WHERE project_id=%s", (project_id,))


def get_type_stats():
    return execute_query("SELECT type, COUNT(*) as count FROM achievement GROUP BY type")
