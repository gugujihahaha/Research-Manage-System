"""用户认证 API"""
from flask import Blueprint, request, session
from backend.utils.db import execute_one, execute_insert, execute_query
from backend.utils.response import success, fail

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    rid = data.get('researcher_id', '').strip()
    pwd = data.get('password', '').strip()
    if not rid or not pwd:
        return fail('请输入工号和密码')
    user = execute_one(
        "SELECT researcher_id, name, title, college_id, role FROM researcher WHERE researcher_id=%s AND password=%s",
        (rid, pwd))
    if not user:
        return fail('工号或密码错误')
    session['user'] = user
    return success(user, '登录成功')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    rid = data.get('researcher_id', '').strip()
    name = data.get('name', '').strip()
    pwd = data.get('password', '').strip()
    college = data.get('college_id', '').strip()
    title = data.get('title', '讲师')

    if not rid or not name or not pwd or not college:
        return fail('工号、姓名、密码、学院为必填项')
    if len(rid) < 3:
        return fail('工号至少3位')
    if len(pwd) < 4:
        return fail('密码至少4位')

    exist = execute_one("SELECT researcher_id FROM researcher WHERE researcher_id=%s", (rid,))
    if exist:
        return fail('该工号已被注册')

    role = data.get('role', '科研人员')
    if role not in ('科研人员', '专家', '科研处', '财务处'):
        role = '科研人员'
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()

    execute_insert(
        "INSERT INTO researcher (researcher_id, name, password, title, college_id, phone, email, role) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (rid, name, pwd, title, college, phone, email, role))
    return success(message='注册成功，请登录')


@auth_bp.route('/todo', methods=['GET'])
def todo_counts():
    """返回当前用户的待办数量"""
    user = session.get('user')
    if not user:
        return fail('未登录', 401)
    rid = user['researcher_id']
    role = user['role']
    counts = {}

    if role == '科研人员':
        counts['form_review'] = execute_query("SELECT COUNT(*) as c FROM project WHERE leader_id=%s AND status='申报中'", (rid,))[0]['c']
        counts['reviewing'] = execute_query("SELECT COUNT(*) as c FROM project WHERE leader_id=%s AND status='专家评审'", (rid,))[0]['c']
        counts['can_accept'] = execute_query("SELECT COUNT(*) as c FROM project WHERE leader_id=%s AND status='执行中'", (rid,))[0]['c']
    elif role == '科研处':
        counts['form_review'] = execute_query("SELECT COUNT(*) as c FROM project WHERE status='申报中'", ())[0]['c']
        counts['expert_assign'] = execute_query("SELECT COUNT(*) as c FROM project WHERE status='专家评审'", ())[0]['c']
        counts['approve'] = execute_query("SELECT COUNT(*) as c FROM project WHERE status='立项公示'", ())[0]['c']
        counts['acceptance'] = execute_query("SELECT COUNT(*) as c FROM project WHERE status IN ('验收申请','验收评审')", ())[0]['c']
        counts['reports_pending'] = execute_query("SELECT COUNT(*) as c FROM progress_report WHERE status='待审核'", ())[0]['c']
        counts['changes_pending'] = execute_query("SELECT COUNT(*) as c FROM change_request WHERE approval_status='待审批'", ())[0]['c']
    elif role == '专家':
        counts['reviews'] = execute_query("SELECT COUNT(*) as c FROM review WHERE expert_id=%s AND result IS NULL", (rid,))[0]['c']
    elif role == '财务处':
        counts['funding'] = execute_query("SELECT COUNT(*) as c FROM expenditure WHERE approval_status='待审批'", ())[0]['c']

    counts['total'] = sum(counts.values())
    return success(counts)
    return success(execute_query("SELECT college_id, name FROM college"))


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return success(message='已退出')


@auth_bp.route('/me', methods=['GET'])
def current_user():
    user = session.get('user')
    if not user:
        return fail('未登录', 401)
    return success(user)
