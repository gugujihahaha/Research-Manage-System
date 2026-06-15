"""合同管理 API"""
from flask import Blueprint, request
from backend.models.contract import create as create_contract
from backend.utils.response import success

contracts_bp = Blueprint('contracts', __name__)


@contracts_bp.route('/contracts', methods=['POST'])
def add_contract():
    create_contract(request.json)
    return success(message='合同上传成功')
