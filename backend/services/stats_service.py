"""统计报表业务"""
from backend.utils.db import call_proc, execute_query


def college_stats(year):
    return call_proc('sp_college_project_stats', (year,))


def workload_stats(year):
    return call_proc('sp_researcher_workload', (year,))


def achievement_stats():
    return execute_query("SELECT type, COUNT(*) as count FROM achievement GROUP BY type")
