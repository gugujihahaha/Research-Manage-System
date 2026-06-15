"""应用配置管理"""
import os


class Config:
    """Flask 配置"""
    UPLOAD_FOLDER = 'uploads'
    DEBUG = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'

    # 数据库配置 — 优先从环境变量读取，兼容默认值
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '123456')
    DB_NAME = os.getenv('DB_NAME', 'research_mgt')
    DB_CHARSET = 'utf8mb4'

    # 文件上传
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_UPLOAD_MB', '10')) * 1024 * 1024  # 默认 10MB
