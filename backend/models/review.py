"""评审数据访问"""
from backend.utils.db import execute_query, execute_one, execute_insert, execute_update


def create(project_id, expert_id):
    return execute_insert(
        "INSERT INTO review (project_id, expert_id, review_date) VALUES (%s, %s, CURDATE())",
        (project_id, expert_id))


def update(data):
    return execute_update(
        """UPDATE review SET result=%s, score=%s, comment=%s, review_date=CURDATE()
           WHERE project_id=%s AND expert_id=%s""",
        (data['result'], data['score'], data['comment'], data['project_id'], data['expert_id']))


def check_all_done(project_id):
    return execute_one(
        "SELECT COUNT(*) as total, SUM(CASE WHEN result IS NOT NULL THEN 1 ELSE 0 END) as done FROM review WHERE project_id=%s",
        (project_id,))


def get_result_stats(project_id):
    return execute_one(
        "SELECT SUM(CASE WHEN result='通过' THEN 1 ELSE 0 END) as pass, SUM(CASE WHEN result='不通过' THEN 1 ELSE 0 END) as fail FROM review WHERE project_id=%s",
        (project_id,))
