"""统一 JSON 响应格式"""
from flask import jsonify


def success(data=None, message='操作成功'):
    """成功响应"""
    body = {'code': 200, 'message': message}
    if data is not None:
        body['data'] = data
    return jsonify(body)


def created(data=None, message='创建成功'):
    """创建成功响应"""
    return success(data, message)


def fail(message='请求参数错误', code=400):
    """失败响应"""
    return jsonify({'code': code, 'message': message}), code


def error(message='服务器内部错误', code=500):
    """错误响应"""
    return jsonify({'code': code, 'message': message}), code
