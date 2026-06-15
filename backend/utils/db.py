"""数据库连接池管理"""
import pymysql
from backend.config import Config


def get_db():
    """获取数据库连接"""
    return pymysql.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        charset=Config.DB_CHARSET,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False
    )


def execute_query(sql, params=None):
    """执行查询，返回所有结果"""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        return cur.fetchall()
    finally:
        conn.close()


def execute_one(sql, params=None):
    """执行查询，返回单条结果"""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        return cur.fetchone()
    finally:
        conn.close()


def execute_update(sql, params=None):
    """执行增删改，返回影响行数"""
    conn = get_db()
    try:
        cur = conn.cursor()
        affected = cur.execute(sql, params)
        conn.commit()
        return affected
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute_insert(sql, params=None):
    """执行插入，返回 lastrowid"""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.lastrowid
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def call_proc(name, args=None):
    """调用存储过程，返回结果集"""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.callproc(name, args or ())
        return cur.fetchall()
    finally:
        conn.close()
