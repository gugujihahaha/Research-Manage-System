"""验收数据访问"""
from backend.utils.db import execute_insert, execute_update


def create_apply(project_id, material_url):
    return execute_insert(
        "INSERT INTO acceptance (project_id, apply_date, material_url) VALUES (%s, CURDATE(), %s)",
        (project_id, material_url))


def update_review(project_id, result, comment):
    return execute_update(
        "UPDATE acceptance SET review_result=%s, review_comment=%s WHERE project_id=%s",
        (result, comment, project_id))


def update_certificate(project_id, certificate_url):
    return execute_update(
        "UPDATE acceptance SET certificate_url=%s WHERE project_id=%s",
        (certificate_url, project_id))
