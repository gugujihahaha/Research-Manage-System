"""统一异常处理"""
from flask import jsonify
from pymysql import MySQLError


def register_error_handlers(app):
    """注册全局错误处理器"""

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'code': 400, 'message': str(e.description) if hasattr(e, 'description') else '请求参数错误'}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'code': 404, 'message': '资源不存在'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'code': 405, 'message': '请求方法不允许'}), 405

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({'code': 413, 'message': '上传文件过大'}), 413

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.error(f'Internal Server Error: {e}')
        return jsonify({'code': 500, 'message': '服务器内部错误'}), 500

    @app.errorhandler(MySQLError)
    def mysql_error(e):
        app.logger.error(f'Database Error: {e}')
        return jsonify({'code': 500, 'message': '数据库操作失败'}), 500
