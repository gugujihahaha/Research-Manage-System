# 高校科研项目管理系统

基于 Flask + Vue 3 + Element Plus + MySQL 的科研项目全生命周期管理平台。

---

## 目录

- [快速开始](#快速开始)
- [系统架构](#系统架构)
- [角色与功能](#角色与功能)
- [业务流程](#业务流程)
- [项目结构](#项目结构)
- [API 接口](#api-接口)
- [数据库设计](#数据库设计)
- [配置说明](#配置说明)

---

## 快速开始

### 环境要求

- Python 3.8+
- MySQL 5.7+
- 现代浏览器

### 安装运行

```bash
# 1. 创建虚拟环境并安装依赖
uv venv
.venv\Scripts\activate
uv pip install -r uploads/requirements.txt

# 2. 初始化数据库
mysql -u root -p
source database.sql;

# 3. 修改数据库配置（如密码不同）
# 编辑 backend/config.py 或设置环境变量 DB_PASSWORD

# 4. 启动应用
python app.py
```

浏览器打开 `http://127.0.0.1:5000`

### 测试账号

| 角色 | 工号 | 密码 | 说明 |
|------|------|------|------|
| 科研人员 | R0001~R0018 | 123456 | 默认密码均为 123456 |
| 评审专家 | R1001~R1003 | 123456 | |
| 科研处 | R2001 | 123456 | |
| 财务处 | R2002 | 123456 | |

---

## 系统架构

```
templates/index.html        Vue 3 + Element Plus 单页应用
        │
        ▼
     app.py                 Flask 工厂函数，注册 12 个 Blueprint
        │
  ┌─────┴─────┐
  ▼           ▼
backend/api/               backend/services/        backend/models/
  12 个路由模块               4 个业务编排模块          11 个数据访问模块
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                      backend/utils/db.py
                         PyMySQL 连接
                                │
                                ▼
                           MySQL 数据库
```

### 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Vue 3 (CDN) + Element Plus (CDN) + ECharts + Axios |
| 后端 | Python Flask + Blueprint 分层架构 |
| 数据库 | MySQL 8.0，utf8mb4 字符集 |
| 依赖 | PyMySQL, Flask-CORS, Werkzeug |

---

## 角色与功能

### 科研人员

| 模块 | 功能 |
|------|------|
| 工作台 | 我的项目统计、待办提醒、到期预警 |
| 待办 | 审核中项目、可验收项目汇总 |
| 项目申报 | 查看通知、在线填报申请书、上传立项报告、编制预算科目 |
| 我的项目 | 查看进度、编辑/删除/撤回、预算执行、提交进展报告、变更申请 |
| 项目验收 | 对执行中的项目提交验收申请、上传结题材料 |
| 成果管理 | 登记论文/专利/软著/获奖等成果、上传附件、查看审核状态 |
| 经费管理 | 选择项目预算科目提交报销申请 |

### 科研处

| 模块 | 功能 |
|------|------|
| 工作台 | 全项目统计、待办数量 |
| 待办 | 形式审查、分配专家、立项审批、验收评审、报告/变更/成果审核汇总 |
| 通知管理 | 发布申报通知、查看已发布通知 |
| 项目审核 | 形式审查 (通过/退回) → 分配专家 (防重复) → 评审中追踪 → 立项审批 → 撤回立项 |
| 验收管理 | 待验收评审列表、通过/退回、发放结题证书 |
| 统计报表 | 各学院项目统计图表、成果分布饼图、人员工作量 |
| 全部项目 | 搜索筛选全项目列表、点击查看详情 |

### 专家

| 模块 | 功能 |
|------|------|
| 工作台 | 待评审数量统计 |
| 待办 | 待评审项目列表 |
| 项目评审 | 左侧待审项目列表 + 右侧评审表单 (通过/不通过、打分、评语) |
| 全部项目 | 查看所有项目详情 |

### 财务处

| 模块 | 功能 |
|------|------|
| 工作台 | 待审批经费数量 |
| 待办 | 待审批经费汇总 |
| 经费管理 | 待审批列表 (通过/驳回) → 到账登记 → 预算监控 → 结余处理 |

---

## 业务流程

```
科研人员申报 ──→ 科研处形式审查 ──→ 科研处分配专家
                                        │
                    ┌───────────────────┘
                    ▼
              专家分别评审
               │          │
          全部通过    有任一不通过
               │          │
               ▼          ▼
          立项公示    退回申报中
               │
               ▼
          科研处立项审批 → 进入执行中
               │
               ▼
          科研人员提交进展报告 → 科研处审核
               │
               ▼
          科研人员申请验收 → 科研处验收评审 → 通过｜退回
               │
               ▼
          科研处发放证书 → 验收通过
```

**经费流程**：科研人员提交报销 → 财务处审批 (通过｜驳回，超预算拦截)

**成果流程**：科研人员登记 → 科研处审核 (通过｜驳回)

**专家评审逻辑**：全部专家通过 → 立项公示；任一不通过 → 退回申报中；未全部完成 → 等待

---

## 项目结构

```
├── app.py                              # Flask 入口，工厂函数，Blueprint 注册
├── database.sql                        # 数据库完整脚本 (建库/表/数据/触发器/存储过程/视图)
├── backend/
│   ├── config.py                       # 配置 (数据库、上传)
│   ├── api/                            # 路由层 (12个 Blueprint)
│   │   ├── auth.py                     # 登录/注册/待办统计
│   │   ├── projects.py                 # 项目 CRUD + 状态流转 + 进度详情
│   │   ├── notices.py                  # 通知公告
│   │   ├── reviews.py                  # 专家评审 + 待审任务
│   │   ├── reports.py                  # 进展报告 + 变更申请 + 批量查询
│   │   ├── acceptance.py               # 验收申请/评审/证书
│   │   ├── funding.py                  # 经费收支/审批/状态
│   │   ├── achievements.py             # 成果登记/查询/审核
│   │   ├── budgets.py                  # 预算查询
│   │   ├── contracts.py                # 合同
│   │   ├── stats.py                    # 统计报表
│   │   └── upload.py                   # 文件上传
│   ├── services/                       # 业务逻辑层
│   │   ├── project_service.py          # 项目流转编排 + 编号自动生成
│   │   ├── funding_service.py          # 经费编排
│   │   ├── acceptance_service.py       # 验收编排
│   │   └── stats_service.py            # 统计编排
│   ├── models/                         # 数据访问层 (11个 Model)
│   └── utils/
│       ├── db.py                       # 数据库工具 (查询/插入/更新/存储过程)
│       ├── response.py                 # 统一 JSON 响应
│       └── errors.py                   # 全局异常处理
├── templates/
│   └── index.html                      # Vue 3 入口 (登录页 + 主界面框架)
└── static/js/
    ├── api.js                          # Axios 封装 + 文件上传
    ├── app.js                          # Vue 主应用 (登录/注册/角色路由/待办轮询)
    └── pages/
        ├── dashboard.js                # 工作台 (按角色展示统计卡片)
        ├── todo.js                     # 待办汇总 (全角色)
        ├── researcher_declare.js       # 科研人员: 项目申报
        ├── my_projects.js              # 科研人员: 我的项目 (进度条+操作)
        ├── my_acceptance.js            # 科研人员: 项目验收
        ├── researcher_funding.js       # 科研人员: 经费报销
        ├── achievement.js              # 科研人员: 成果管理
        ├── notices_manage.js           # 科研处: 通知管理
        ├── review_manage.js            # 科研处: 项目审核 (5个标签页)
        ├── acceptance_manage.js        # 科研处: 验收管理
        ├── expert_review.js            # 专家: 项目评审
        ├── funding_manage.js           # 财务处: 经费管理 (4个标签页)
        ├── stats.js                    # 统计报表 (ECharts图表)
        └── admin.js                    # 全部项目列表 (搜索+筛选+详情)
```

---

## API 接口

Base: `http://127.0.0.1:5000/api`

所有响应格式: `{ "code": 200, "data": ..., "message": "..." }`

### 认证

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | `/login` | 登录 `{researcher_id, password}` |
| POST | `/register` | 注册 `{researcher_id, name, password, college_id, title, role, phone?, email?}` |
| POST | `/logout` | 退出 |
| GET | `/me` | 当前用户 |
| GET | `/todo` | 待办统计 |
| GET | `/colleges` | 学院列表 |

### 项目管理

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/projects` | 全部项目 |
| GET | `/projects/<id>` | 项目详情 |
| POST | `/projects` | 申报项目 (编号自动生成) |
| PUT | `/projects/<id>` | 编辑项目 (仅申报中) |
| DELETE | `/projects/<id>` | 删除项目 (申报中/形式审查) |
| PUT | `/projects/<id>/form_review` | 形式审查 `{result}`
| POST | `/projects/<id>/assign_experts` | 分配专家 `{expert_ids}` (防重复) |
| PUT | `/projects/<id>/approve` | 立项审批 |
| PUT | `/projects/<id>/revoke` | 撤回立项 |
| PUT | `/projects/<id>/withdraw` | 撤回申报 |
| GET | `/projects/<id>/timeline` | 项目进度 (含评审记录、证书链接) |
| GET | `/expiring_projects` | 30天内到期项目 |

### 评审

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | `/reviews` | 提交评审 (全部通过→立项公示，有驳回→退回申报中) |
| DELETE | `/reviews/<pid>/<eid>` | 撤回评审 |
| GET | `/expert/tasks` | 当前专家待审任务 |

### 通知

| 方法 | 路由 | 说明 |
|------|------|------|
| GET/POST | `/notices` | 列表/发布 |

### 进展报告 & 变更

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | `/progress_reports` | 提交报告 |
| GET | `/projects/<id>/reports` | 项目报告列表 |
| GET | `/pending-reports` | 科研处: 全部待审核报告 |
| PUT | `/progress_reports/<id>` | 审核报告 |
| POST | `/change_requests` | 提交变更 |
| GET | `/projects/<id>/changes` | 项目变更列表 |
| GET | `/pending-changes` | 科研处: 全部待审批变更 |
| PUT | `/change_requests/<id>` | 审核变更 |

### 经费

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | `/funding/income` | 到账登记 |
| POST | `/funding/expenditure` | 支出报销 |
| PUT | `/funding/approve` | 审批 `{exp_id, result}` |
| GET | `/funding/status/<pid>` | 项目经费执行状态 |
| GET | `/funding/pending` | 财务处: 全部待审批 |
| POST | `/funding/surplus` | 结余处理 |

### 验收

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | `/acceptance/apply` | 验收申请 |
| PUT | `/acceptance/review` | 验收评审 |
| POST | `/acceptance/certificate` | 发放证书 |

### 成果

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | `/achievements` | 登记成果 |
| GET | `/achievements/<pid>` | 项目成果列表 |
| GET | `/pending-achievements` | 科研处: 待审核成果 |
| PUT | `/achievements/<id>/review` | 审核成果 |

### 统计

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/stats/college/<year>` | 学院年度统计 |
| GET | `/stats/workload/<year>` | 人员工作量 |
| GET | `/stats/achievements` | 成果分布 |

### 其他

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | `/upload` | 文件上传 |
| GET | `/uploads/<filename>` | 文件下载 |
| GET | `/budgets/<pid>` | 项目预算列表 |

---

## 数据库设计

### 核心表

| 表 | 说明 |
|----|------|
| `college` | 学院 |
| `researcher` | 用户 (科研人员/专家/科研处/财务处) |
| `project` | 科研项目 (10种状态流转) |
| `budget` | 项目预算科目 |
| `expenditure` | 经费流水 (到账/支出) |
| `review` | 专家评审记录 |
| `notice` | 通知公告 |
| `contract` | 合同 |
| `progress_report` | 进展报告 |
| `change_request` | 变更申请 |
| `acceptance` | 验收记录 |
| `achievement` | 科研成果 (含审核状态) |

### 数据库对象

| 类型 | 名称 | 说明 |
|------|------|------|
| 视图 | `v_project_budget_status` | 项目预算执行状态 |
| 视图 | `v_researcher_summary` | 研究人员汇总 |
| 存储过程 | `sp_college_project_stats(year)` | 学院年度统计 |
| 存储过程 | `sp_researcher_workload(year)` | 人员工作量 |
| 触发器 | `trg_acceptance_update` | 验收通过自动记录日期 |
| 触发器 | `trg_expenditure_after_approve` | 支出审批后更新预算 (含超支拦截) |
| 函数 | `fn_budget_warning_level(budget_id)` | 预算预警等级 (正常/预警/超支) |

---

## 配置说明

`backend/config.py` 中的配置项均支持环境变量覆盖：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| DB_HOST | localhost | 数据库地址 |
| DB_USER | root | 数据库用户 |
| DB_PASSWORD | 123456 | 数据库密码 |
| DB_NAME | research_mgt | 数据库名 |
| FLASK_DEBUG | true | 调试模式 |

初始化数据库后需确认 `${DB_PASSWORD}` 与实际 MySQL 密码一致，不一致时设置环境变量或在 `config.py` 中修改默认值。
