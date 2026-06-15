"""统计报表 API"""
from flask import Blueprint
from backend.services.stats_service import college_stats, workload_stats, achievement_stats
from backend.utils.response import success

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/stats/college/<int:year>', methods=['GET'])
def college(year):
    return success(college_stats(year))


@stats_bp.route('/stats/workload/<int:year>', methods=['GET'])
def workload(year):
    return success(workload_stats(year))


@stats_bp.route('/stats/achievements', methods=['GET'])
def achievements():
    return success(achievement_stats())
