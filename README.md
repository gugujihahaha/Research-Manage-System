# 高校科研项目管理系统

> University Scientific Research Project Management System

一个基于 Python Flask + MySQL + Bootstrap 5 的全栈 Web 应用，覆盖高校科研项目从申报、立项、执行、经费管理到验收结题的全生命周期管理。

---

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [功能模块](#功能模块)
- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [数据库设计](#数据库设计)
- [API 接口文档](#api-接口文档)
- [项目结构](#项目结构)
- [用户角色](#用户角色)
- [项目状态流转](#项目状态流转)

---

## 项目简介

本系统面向高校科研处、财务处、科研人员和评审专家，提供一站式的科研项目管理解决方案。系统涵盖 **项目申报**、**专家评审**、**合同管理**、**经费预算与支出**、**进展报告**、**变更申请**、**验收结题**、**成果登记** 以及 **统计报表** 等核心业务功能。

### 核心特性

- 📝 **项目全生命周期管理**：从申报到验收的 10 个状态流转
- 👥 **多角色权限体系**：科研人员、专家、科研处、财务处分工协作
- 💰 **经费精细化管理**：预算编制 → 到账登记 → 支出报销 → 执行率监控 → 预警
- 📊 **多维度统计报表**：学院统计、立项率分析、成果统计、工作量考核
- ⚠️ **智能预警机制**：预算超支拦截触发器、即将到期项目提醒、预算执行率预警函数
- 🔍 **专家评审管理**：专家分配、评审提交、自动汇总决策
- 🏆 **科研成果管理**：论文、专利、软著、获奖、标准、成果转化

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **后端框架** | Flask | 2.3.3 |
| **数据库** | MySQL | 5.7+ / 8.0 |
| **数据库驱动** | PyMySQL | 1.1.0 |
| **跨域支持** | Flask-CORS | 4.0.0 |
| **文件处理** | Werkzeug | 2.3.7 |
| **前端框架** | Bootstrap 5 (CDN) | 5.3.0 |
| **前端库** | jQuery (CDN) | 3.7.1 |
| **运行时** | Python | 3.12.13 |
| **包管理器** | uv | - |

---

## 功能模块

### 1. 项目申报管理
- 申报通知发布与展示
- 在线项目申报书填报（含预算科目编制）
- 形式审查（通过/不通过）
- 专家分配与评审意见提交
- 评审自动汇总 → 立项公示
- 项目审批立项

### 2. 项目执行管理
- 合同/任务书上传与管理
- 经费预算编制与执行率查看
- 年度进展报告提交
- 重要事项变更申请（预算调整/延期/成员变更）

### 3. 项目验收管理
- 验收申请提交（含结题材料）
- 验收评审（通过/不通过）
- 结题证书发放

### 4. 经费管理
- 经费到账登记
- 支出报销申请
- 财务审批（通过/驳回，含预算超支拦截触发器）
- 预算执行率实时监控
- 结余经费处理（结转/上缴）

### 5. 成果管理
- 科研成果登记（论文/专利/软件著作权/获奖/标准/成果转化）
- 项目成果列表查询

### 6. 统计报表
- 各学院科研项目统计（申报数、立项数、立项率、到账总额）
- 研究人员工作量考核
- 成果产出类型分布统计

---

## 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    前端 (SPA)                        │
│         Bootstrap 5 + jQuery + Vanilla JS           │
│              templates/index.html                   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST API
┌─────────────────────▼───────────────────────────────┐
│                 Flask 后端 (app.py)                  │
│  ┌──────────┬──────────┬──────────┬──────────┐     │
│  │ 申报管理  │ 执行管理  │ 验收管理  │ 经费管理  │     │
│  ├──────────┼──────────┼──────────┼──────────┤     │
│  │ 成果管理  │ 统计报表  │ 文件上传  │ 综合查询  │     │
│  └──────────┴──────────┴──────────┴──────────┘     │
└─────────────────────┬───────────────────────────────┘
                      │ PyMySQL
┌─────────────────────▼───────────────────────────────┐
│              MySQL 数据库 (research_mgt)             │
│  ┌─────────────────────────────────────────────┐   │
│  │ 12 张数据表 · 2 个视图 · 2 个存储过程        │   │
│  │ 2 个触发器 · 1 个函数 · 5 个索引            │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 快速开始

### 环境要求

- Python 3.8+
- MySQL 5.7+ 或 8.0
- pip 或 uv

### 安装步骤

#### 1. 克隆项目

```bash
cd 高校科研项目管理系统
```

#### 2. 创建虚拟环境并安装依赖

```bash
# 使用 uv（推荐）
uv venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# 安装依赖（uv 管理的 venv 请用 uv pip）
uv pip install -r uploads/requirements.txt
```

或使用传统方式：

```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

pip install -r uploads/requirements.txt
```

#### 3. 初始化数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行脚本
source database.sql;
```

#### 4. 配置数据库连接

编辑 `app.py` 第 14-21 行，修改数据库连接信息：

```python
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '你的MySQL密码',   # 修改此处
    'database': 'research_mgt',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}
```

#### 5. 启动应用

```bash
python app.py
```

应用将在 `http://127.0.0.1:5000` 启动，debug 模式默认开启。

#### 6. 访问系统

打开浏览器访问 `http://127.0.0.1:5000`，使用以下测试账号登录：

| 角色 | 工号 | 密码 | 说明 |
|------|------|------|------|
| 科研人员 | R0001 | 123456 | 张三（教授，信息学院） |
| 科研人员 | R0004 | 123456 | 赵六（教授，机械学院） |
| 专家 | R1001 | 123456 | 专家A（教授，信息学院） |
| 科研处管理员 | R2001 | 123456 | 科研处管理员 |
| 财务处管理员 | R2002 | 123456 | 财务处管理员 |

---

## 数据库设计

### 核心表关系图

```
college (学院)
    │
    └── researcher (研究人员)
            │
            ├── project (科研项目) ──────── 核心表
            │       ├── budget (预算科目)
            │       ├── review (专家评审)
            │       ├── contract (合同)
            │       ├── progress_report (进展报告)
            │       ├── change_request (变更申请)
            │       ├── acceptance (验收记录)
            │       ├── achievement (成果)
            │       └── expenditure (经费流水)
            │
            └── notice (通知公告)
```

### 数据表清单

| 表名 | 主键 | 记录数(测试) | 说明 |
|------|------|:---:|------|
| `college` | `college_id CHAR(4)` | 6 | 学院/部门 |
| `researcher` | `researcher_id CHAR(10)` | 23 | 用户（含4种角色） |
| `project` | `project_id CHAR(20)` | 30 | 科研项目（核心表） |
| `budget` | `budget_id INT` | 43 | 项目预算科目 |
| `expenditure` | `exp_id INT` | 14 | 经费收支流水 |
| `review` | `review_id INT` | 8 | 专家评审记录 |
| `contract` | `contract_id INT` | 0 | 合同/任务书 |
| `progress_report` | `report_id INT` | 0 | 年度进展报告 |
| `change_request` | `request_id INT` | 0 | 变更申请 |
| `acceptance` | `acceptance_id INT` | 0 | 验收记录 |
| `achievement` | `ach_id INT` | 30 | 科研成果 |
| `notice` | `notice_id INT` | 6 | 通知公告 |

### 数据库对象

| 类型 | 名称 | 说明 |
|------|------|------|
| 视图 | `v_project_budget_status` | 项目预算执行状态视图 |
| 视图 | `v_researcher_summary` | 研究人员成果汇总视图 |
| 存储过程 | `sp_college_project_stats(year)` | 学院年度项目统计 |
| 存储过程 | `sp_researcher_workload(year)` | 研究人员工作量统计 |
| 触发器 | `trg_acceptance_update` | 验收通过自动记录日期 |
| 触发器 | `trg_expenditure_after_approve` | 支出审批后更新预算已用金额（含超支拦截） |
| 函数 | `fn_budget_warning_level(budget_id)` | 预算预警等级（正常/预警/超支） |
| 索引 | 5个 | 加速 end_date、leader_id、project_id 等查询 |

---

## API 接口文档

Base URL: `http://127.0.0.1:5000/api`

所有接口返回统一 JSON 格式：`{"code": 200, "data": ...}` 或 `{"code": 200, "message": "..."}`

### 1. 项目申报管理

| 方法 | 路由 | 说明 |
|------|------|------|
| `GET` | `/notices` | 获取通知列表 |
| `POST` | `/notices` | 发布通知 `{title, content, admin_id?}` |
| `POST` | `/projects` | 提交项目申报 `{project_id, name, type, level, leader_id, start_date, end_date, budget_total, budgets:[{category, amount}]}` |
| `PUT` | `/projects/<id>/form_review` | 形式审查 `{result: "通过"|"不通过"}` |
| `POST` | `/projects/<id>/assign_experts` | 分配专家 `{expert_ids: [...]}` |
| `POST` | `/reviews` | 提交评审 `{project_id, expert_id, result, score, comment}` |
| `PUT` | `/projects/<id>/approve` | 审批立项 |

### 2. 项目执行管理

| 方法 | 路由 | 说明 |
|------|------|------|
| `POST` | `/contracts` | 上传合同 `{project_id, file_url, sign_date, content?}` |
| `GET` | `/budgets/<project_id>` | 获取预算及预警信息 |
| `POST` | `/progress_reports` | 提交进展报告 `{project_id, year, content}` |
| `POST` | `/change_requests` | 提交变更申请 `{project_id, type, old_value, new_value, reason}` |

### 3. 项目验收管理

| 方法 | 路由 | 说明 |
|------|------|------|
| `POST` | `/acceptance/apply` | 提交验收申请 `{project_id, material_url}` |
| `PUT` | `/acceptance/review` | 验收评审 `{project_id, result, comment}` |
| `POST` | `/acceptance/certificate` | 发放证书 `{project_id, certificate_url}` |

### 4. 经费管理

| 方法 | 路由 | 说明 |
|------|------|------|
| `POST` | `/funding/income` | 到账登记 `{project_id, amount, exp_date, operator_id}` |
| `POST` | `/funding/expenditure` | 支出报销 `{project_id, budget_id, amount, exp_date, purpose, operator_id}` |
| `PUT` | `/funding/approve` | 财务审批 `{exp_id, result: "通过"|"驳回"}` |
| `GET` | `/funding/status/<project_id>` | 经费执行状态 |
| `POST` | `/funding/surplus` | 结余处理 `{project_id, action}` |

### 5. 成果管理

| 方法 | 路由 | 说明 |
|------|------|------|
| `POST` | `/achievements` | 登记成果 `{project_id, type, title, publish_date, author, file_url?}` |
| `GET` | `/achievements/<project_id>` | 查询项目成果列表 |

### 6. 统计报表

| 方法 | 路由 | 说明 |
|------|------|------|
| `GET` | `/stats/college/<year>` | 学院年度统计 |
| `GET` | `/stats/workload/<year>` | 研究人员工作量统计 |
| `GET` | `/stats/achievements` | 成果类型分布统计 |

### 7. 其他

| 方法 | 路由 | 说明 |
|------|------|------|
| `GET` | `/projects` | 所有项目列表 |
| `GET` | `/projects/<id>` | 单个项目详情 |
| `GET` | `/expiring_projects` | 30天内到期项目 |
| `POST` | `/upload` | 文件上传 |
| `GET` | `/uploads/<filename>` | 文件下载 |

---

## 项目结构

```
高校科研项目管理系统/
├── app.py                    # Flask 后端主程序 (366行)
├── database.sql              # 数据库完整脚本 (416行) - 建库/建表/测试数据/存储过程/触发器/视图/函数/索引
├── templates/
│   └── index.html            # 前端 SPA 页面 (178行) - HTML/CSS/JS 一体化
├── uploads/
│   └── requirements.txt      # Python 依赖清单
├── .venv/                    # Python 虚拟环境
├── .idea/                    # PyCharm IDE 配置
└── README.md                 # 本文件
```

---

## 用户角色

| 角色 | 数据库值 | 主要职责 |
|------|----------|----------|
| **科研人员** | `科研人员` | 申报项目、提交进展报告、申请验收、登记成果、报销申请 |
| **专家** | `专家` | 对分配的项目进行评审打分、出具评审意见 |
| **科研处** | `科研处` | 发布通知、形式审查、分配专家、立项审批、验收评审、发放证书 |
| **财务处** | `财务处` | 经费到账登记、支出报销审批、经费执行监控 |

---

## 项目状态流转

```
申报中 ──→ 形式审查 ──→ 专家评审 ──→ 立项公示 ──→ 已立项
  ↑            │            │                        │
  │            └── 不通过 ──┘                        │
  └──────────────────────────────────────────────────│
                                                     ↓
              终止 ←────────────── 执行中 ←───────────┘
                                      │
                                      ↓
                                  验收申请
                                      │
                                  验收评审
                                   │      │
                              验收通过    不通过 → 执行中
```

共 **10 个状态**：`申报中` → `形式审查` → `专家评审` → `立项公示` → `已立项` → `执行中` → `验收申请` → `验收评审` → `验收通过` / `终止`

---

## 安全与注意事项

1. **数据库密码**：`app.py` 中硬编码了数据库密码 `123456`，生产环境请使用环境变量或配置文件管理敏感信息
2. **Debug 模式**：默认开启 Flask debug 模式，生产环境请关闭
3. **CORS**：已启用跨域支持，可根据需要限制允许的源
4. **文件上传**：使用 `secure_filename` 防止路径遍历攻击，文件名添加时间戳避免冲突
5. **SQL 注入**：使用参数化查询（`%s` 占位符）防止 SQL 注入
6. **触发器保护**：`trg_expenditure_after_approve` 在数据库层面拦截超预算支出
