"""高校科研项目管理系统 — Flask 应用入口"""
import os
from flask import Flask, render_template
from flask_cors import CORS
from backend.config import Config

def create_app():
    app = Flask(__name__, template_folder='templates')
    app.config.from_object(Config)
    app.secret_key = os.getenv('SECRET_KEY', 'research-mgt-secret-key-2024')
    CORS(app, supports_credentials=True)

    # 上传目录
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # ---------- 注册 Blueprints ----------
    from backend.api.upload import upload_bp
    from backend.api.notices import notices_bp
    from backend.api.projects import projects_bp
    from backend.api.reviews import reviews_bp
    from backend.api.contracts import contracts_bp
    from backend.api.budgets import budgets_bp
    from backend.api.reports import reports_bp
    from backend.api.acceptance import acceptance_bp
    from backend.api.funding import funding_bp
    from backend.api.achievements import achievements_bp
    from backend.api.stats import stats_bp
    from backend.api.auth import auth_bp

    app.register_blueprint(upload_bp, url_prefix='/api')
    app.register_blueprint(notices_bp, url_prefix='/api')
    app.register_blueprint(projects_bp, url_prefix='/api')
    app.register_blueprint(reviews_bp, url_prefix='/api')
    app.register_blueprint(contracts_bp, url_prefix='/api')
    app.register_blueprint(budgets_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api')
    app.register_blueprint(acceptance_bp, url_prefix='/api')
    app.register_blueprint(funding_bp, url_prefix='/api')
    app.register_blueprint(achievements_bp, url_prefix='/api')
    app.register_blueprint(stats_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')

    # ---------- 全局错误处理 ----------
    from backend.utils.errors import register_error_handlers
    register_error_handlers(app)

    # ---------- 首页 ----------
    @app.route('/')
    def index():
        return render_template('index.html')

    # ---------- 上传文件访问 ----------
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        from flask import send_from_directory
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    # ---------- 静态文件（前端 JS/CSS） ----------
    @app.route('/static/<path:filename>')
    def static_files(filename):
        from flask import send_from_directory
        return send_from_directory('static', filename)

    return app


if __name__ == '__main__':
    create_app().run(debug=True, port=5000)
