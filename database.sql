-- ======================================================
-- 高校科研项目管理系统 数据库完整脚本
-- MySQL 5.7+ / 8.0
-- ======================================================

DROP DATABASE IF EXISTS research_mgt;
CREATE DATABASE research_mgt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE research_mgt;
SET NAMES utf8mb4;

-- ----------------------------
-- 1. 创建表结构
-- ----------------------------
CREATE TABLE college (
    college_id CHAR(4) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    dean VARCHAR(20),
    tel VARCHAR(20)
);

CREATE TABLE researcher (
    researcher_id CHAR(10) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL DEFAULT '123456',
    title VARCHAR(20),
    college_id CHAR(4),
    phone VARCHAR(20),
    email VARCHAR(50),
    role ENUM('科研人员','专家','科研处','财务处') DEFAULT '科研人员',
    FOREIGN KEY (college_id) REFERENCES college(college_id) ON DELETE SET NULL
);

CREATE TABLE notice (
    notice_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    publish_date DATE,
    admin_id VARCHAR(20)
);

CREATE TABLE project (
    project_id CHAR(20) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type ENUM('纵向','横向') NOT NULL,
    level VARCHAR(20),
    leader_id CHAR(10) NOT NULL,
    apply_date DATE,
    start_date DATE,
    end_date DATE,
    budget_total DECIMAL(12,2),
    status ENUM('申报中','形式审查','专家评审','立项公示','已立项','执行中','验收申请','验收评审','验收通过','终止') DEFAULT '申报中',
    acceptance_date DATE,
    file_url VARCHAR(255),
    FOREIGN KEY (leader_id) REFERENCES researcher(researcher_id)
);

CREATE TABLE review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(20) NOT NULL,
    expert_id CHAR(10) NOT NULL,
    result ENUM('通过','不通过'),
    score INT DEFAULT 0,
    comment TEXT,
    review_date DATE,
    FOREIGN KEY (project_id) REFERENCES project(project_id),
    FOREIGN KEY (expert_id) REFERENCES researcher(researcher_id)
);

CREATE TABLE contract (
    contract_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(20) NOT NULL,
    file_url VARCHAR(255),
    sign_date DATE,
    content TEXT,
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);

CREATE TABLE budget (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    spent DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE CASCADE
);

CREATE TABLE expenditure (
    exp_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(20) NOT NULL,
    budget_id INT,
    type ENUM('到账','支出') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    exp_date DATE NOT NULL,
    purpose TEXT,
    operator_id CHAR(10),
    approval_status ENUM('待审批','已通过','已驳回') DEFAULT '待审批',
    FOREIGN KEY (project_id) REFERENCES project(project_id),
    FOREIGN KEY (budget_id) REFERENCES budget(budget_id),
    FOREIGN KEY (operator_id) REFERENCES researcher(researcher_id)
);

CREATE TABLE progress_report (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(20) NOT NULL,
    report_year INT NOT NULL,
    submit_date DATE,
    content TEXT,
    status VARCHAR(20) DEFAULT '待审核',
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);

CREATE TABLE change_request (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(20) NOT NULL,
    request_type ENUM('预算调整','延期','成员变更') NOT NULL,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    apply_date DATE,
    approval_status VARCHAR(20) DEFAULT '待审批',
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);

CREATE TABLE acceptance (
    acceptance_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(20) NOT NULL,
    apply_date DATE,
    material_url VARCHAR(255),
    review_result ENUM('通过','不通过'),
    review_comment TEXT,
    certificate_url VARCHAR(255),
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);

CREATE TABLE achievement (
    ach_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(20) NOT NULL,
    type ENUM('论文','专利','软件著作权','获奖','标准','成果转化') NOT NULL,
    title VARCHAR(200) NOT NULL,
    publish_date DATE,
    author VARCHAR(100),
    file_url VARCHAR(255),
    status VARCHAR(20) DEFAULT '待审核',
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);

-- ----------------------------
-- 2. 插入测试数据（每表≥30条）
-- ----------------------------
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO college VALUES
('C001','信息学院','张建国','021-12345678'),
('C002','机械学院','李卫东','021-12345679'),
('C003','材料学院','王华','021-12345680'),
('C004','经管学院','陈敏','021-12345681'),
('C005','理学院','赵强','021-12345682'),
('C006','外语学院','孙丽','021-12345683');

INSERT INTO researcher (researcher_id, name, password, title, college_id, phone, email, role) VALUES
('R0001','张三','123456','教授','C001','13800000001','zhang@uni.edu','科研人员'),
('R0002','李四','123456','副教授','C001','13800000002','li@uni.edu','科研人员'),
('R0003','王五','123456','讲师','C002','13800000003','wang@uni.edu','科研人员'),
('R0004','赵六','123456','教授','C002','13800000004','zhao@uni.edu','科研人员'),
('R0005','钱七','123456','副教授','C003','13800000005','qian@uni.edu','科研人员'),
('R0006','孙八','123456','讲师','C003','13800000006','sun@uni.edu','科研人员'),
('R0007','周九','123456','教授','C004','13800000007','zhou@uni.edu','科研人员'),
('R0008','吴十','123456','副教授','C004','13800000008','wu@uni.edu','科研人员'),
('R0009','郑十一','123456','讲师','C005','13800000009','zheng@uni.edu','科研人员'),
('R0010','王十二','123456','教授','C005','13800000010','wang12@uni.edu','科研人员'),
('R0011','李十三','123456','副教授','C006','13800000011','li13@uni.edu','科研人员'),
('R0012','张十四','123456','讲师','C006','13800000012','zhang14@uni.edu','科研人员'),
('R0013','刘十五','123456','教授','C001','13800000013','liu15@uni.edu','科研人员'),
('R0014','陈十六','123456','副教授','C002','13800000014','chen16@uni.edu','科研人员'),
('R0015','黄十七','123456','讲师','C003','13800000015','huang17@uni.edu','科研人员'),
('R0016','林十八','123456','教授','C004','13800000016','lin18@uni.edu','科研人员'),
('R0017','郭十九','123456','副教授','C005','13800000017','guo19@uni.edu','科研人员'),
('R0018','马二十','123456','讲师','C006','13800000018','ma20@uni.edu','科研人员'),
('R1001','专家A','123456','教授','C001','13800001001','expertA@uni.edu','专家'),
('R1002','专家B','123456','教授','C002','13800001002','expertB@uni.edu','专家'),
('R1003','专家C','123456','教授','C003','13800001003','expertC@uni.edu','专家'),
('R2001','科研处管理员','123456','','','','admin@uni.edu','科研处'),
('R2002','财务处管理员','123456','','','','finance@uni.edu','财务处');

INSERT INTO project (project_id, name, type, level, leader_id, apply_date, start_date, end_date, budget_total, status, acceptance_date, file_url) VALUES
('P2021001','深度学习图像识别','纵向','国家级','R0001','2021-03-01','2021-05-01','2023-04-30',85.00,'验收通过','2023-05-15','/uploads/proj1.pdf'),
('P2021002','智能制造机器人','纵向','省部级','R0004','2021-04-10','2021-06-01','2023-05-31',50.00,'验收通过','2023-06-20',NULL),
('P2022001','新能源材料','纵向','国家级','R0007','2022-01-15','2022-03-01','2024-02-28',120.00,'验收通过','2024-03-10',NULL),
('P2022002','企业数字化转型','横向','横向','R0010','2022-02-20','2022-04-01','2023-03-31',60.00,'验收通过','2023-04-05',NULL),
('P2022003','大数据平台','纵向','省部级','R0013','2022-05-10','2022-07-01','2024-06-30',95.00,'执行中',NULL,NULL),
('P2022004','外语教学改革','纵向','市厅级','R0016','2022-06-05','2022-08-01','2023-07-31',15.00,'终止',NULL,NULL),
('P2023001','人工智能算法','纵向','国家级','R0001','2023-01-10','2023-03-01','2025-02-28',80.00,'执行中',NULL,'/uploads/proj2.pdf'),
('P2023002','车间调度系统','纵向','省部级','R0002','2023-02-20','2023-04-01','2024-03-31',45.00,'执行中',NULL,NULL),
('P2023003','高精度传感器','纵向','国家级','R0004','2023-03-15','2023-05-01','2025-04-30',110.00,'验收申请',NULL,NULL),
('P2023004','材料腐蚀研究','纵向','省部级','R0007','2023-04-01','2023-06-01','2024-05-31',70.00,'执行中',NULL,NULL),
('P2023005','供应链金融','横向','横向','R0010','2023-05-10','2023-07-01','2024-06-30',55.00,'执行中',NULL,NULL),
('P2023006','数学建模应用','纵向','市厅级','R0013','2023-06-20','2023-08-01','2024-07-31',25.00,'执行中',NULL,NULL),
('P2023007','跨文化交际','纵向','省部级','R0016','2023-07-15','2023-09-01','2024-08-31',30.00,'执行中',NULL,NULL),
('P2023008','区块链应用','纵向','国家级','R0001','2023-08-05','2023-10-01','2025-09-30',90.00,'执行中',NULL,NULL),
('P2023009','绿色制造工艺','横向','横向','R0004','2023-09-10','2023-11-01','2024-10-31',75.00,'执行中',NULL,NULL),
('P2023010','智慧校园','纵向','省部级','R0007','2023-10-01','2023-12-01','2025-11-30',65.00,'执行中',NULL,NULL),
('P2024001','6G通信','纵向','国家级','R0001','2024-01-05','2024-03-01','2026-02-28',150.00,'已立项',NULL,NULL),
('P2024002','自动驾驶','纵向','国家级','R0004','2024-01-20','2024-03-15','2026-03-14',140.00,'已立项',NULL,NULL),
('P2024003','纳米材料','纵向','省部级','R0007','2024-02-10','2024-04-01','2025-03-31',88.00,'专家评审',NULL,NULL),
('P2024004','ERP系统','横向','横向','R0010','2024-03-01','2024-05-01','2025-04-30',120.00,'已立项',NULL,NULL),
('P2024005','数字经济','纵向','国家级','R0013','2024-03-15','2024-06-01','2026-05-31',105.00,'形式审查',NULL,NULL),
('P2024006','外语测评','纵向','省部级','R0016','2024-04-05','2024-06-15','2025-06-14',40.00,'已立项',NULL,NULL),
('P2024007','机器学习','纵向','国家级','R0001','2024-05-10','2024-07-01','2026-06-30',130.00,'申报中',NULL,NULL),
('P2024008','机器人集群','纵向','省部级','R0004','2024-06-01','2024-08-01','2025-07-31',60.00,'申报中',NULL,NULL),
('P2024009','电池回收','横向','横向','R0007','2024-07-05','2024-09-01','2025-08-31',95.00,'申报中',NULL,NULL),
('P2024010','智慧医疗','纵向','国家级','R0010','2024-08-20','2024-10-01','2026-09-30',160.00,'申报中',NULL,NULL),
('P2025001','新材料制备','横向','横向','R0013','2025-01-05','2025-02-01','2026-01-31',120.00,'申报中',NULL,NULL),
('P2025002','类脑芯片','纵向','国家级','R0001','2025-01-15','2025-03-01','2027-02-28',200.00,'申报中',NULL,NULL),
('P2025003','低碳建筑','纵向','省部级','R0004','2025-02-01','2025-04-01','2026-03-31',75.00,'申报中',NULL,NULL),
('P2025004','AI伦理','纵向','国家级','R0007','2025-02-20','2025-05-01','2027-04-30',90.00,'申报中',NULL,NULL);

INSERT INTO budget (project_id, category, amount, spent) VALUES
('P2021001','设备费',30,30),('P2021001','材料费',25,24.5),('P2021001','劳务费',20,19),('P2021001','差旅费',10,9),
('P2021002','设备费',15,15),('P2021002','材料费',20,18),('P2021002','劳务费',10,9.5),('P2021002','差旅费',5,4.8),
('P2022001','设备费',40,38),('P2022001','材料费',50,48),('P2022001','劳务费',20,19),('P2022001','差旅费',10,9.5),
('P2022002','咨询费',20,18),('P2022002','差旅费',15,14),('P2022002','劳务费',25,24),
('P2022003','设备费',30,15),('P2022003','材料费',25,10),('P2022003','劳务费',20,8),('P2022003','差旅费',20,5),
('P2023001','设备费',25,10),('P2023001','材料费',30,12),('P2023001','劳务费',15,5),('P2023001','差旅费',10,2),
('P2023002','设备费',15,8),('P2023002','材料费',15,6),('P2023002','劳务费',10,3),('P2023002','差旅费',5,1),
('P2023003','设备费',35,12),('P2023003','材料费',45,15),('P2023003','劳务费',20,5),('P2023003','差旅费',10,2),
('P2024001','设备费',50,0),('P2024001','材料费',60,0),('P2024001','劳务费',30,0),('P2024001','差旅费',10,0),
('P2024002','设备费',45,0),('P2024002','材料费',55,0),('P2024002','劳务费',30,0),('P2024002','差旅费',10,0),
('P2024003','设备费',30,0),('P2024003','材料费',35,0),('P2024003','劳务费',23,0),
('P2024004','咨询费',40,0),('P2024004','差旅费',30,0),('P2024004','劳务费',50,0),
('P2024005','设备费',40,0),('P2024005','材料费',35,0),('P2024005','劳务费',30,0);

INSERT INTO expenditure (project_id, budget_id, type, amount, exp_date, purpose, operator_id, approval_status) VALUES
('P2021001', NULL, '到账',85,'2021-05-10','国拨经费','R2002','已通过'),
('P2021002', NULL, '到账',50,'2021-06-05','省拨经费','R2002','已通过'),
('P2022001', NULL, '到账',120,'2022-03-20','国拨','R2002','已通过'),
('P2022002', NULL, '到账',60,'2022-04-15','横向','R2002','已通过'),
('P2022003', NULL, '到账',95,'2022-07-10','省拨','R2002','已通过'),
('P2023001', NULL, '到账',80,'2023-03-10','国拨','R2002','已通过'),
('P2023002', NULL, '到账',45,'2023-04-05','省拨','R2002','已通过'),
('P2023003', NULL, '到账',110,'2023-05-20','国拨','R2002','已通过'),
('P2021001',1,'支出',5,'2021-06-15','服务器','R0001','已通过'),
('P2021001',2,'支出',3.5,'2021-07-10','材料','R0001','已通过'),
('P2023001',20,'支出',4,'2023-04-01','GPU','R0001','已通过'),
('P2023001',21,'支出',3,'2023-05-10','试剂','R0001','待审批'),
('P2023002',24,'支出',2,'2023-06-01','维修','R0002','待审批'),
('P2023003',28,'支出',5,'2023-07-01','设备','R0004','已通过');

INSERT INTO achievement (project_id, type, title, publish_date, author, file_url) VALUES
('P2021001','论文','深度学习图像识别改进','2022-03-15','张三','/files/paper1.pdf'),
('P2021001','专利','图像识别方法','2022-08-20','张三','/files/patent1.pdf'),
('P2021001','获奖','省科技进步二等奖','2023-01-10','张三','/files/award1.pdf'),
('P2021002','论文','机器人控制策略','2022-05-10','赵六','/files/paper2.pdf'),
('P2021002','软件著作权','机器人控制系统','2022-09-01','赵六','/files/sw1.pdf'),   -- 修改此处
('P2022001','论文','新能源材料性能','2023-02-01','周九','/files/paper3.pdf'),
('P2022001','专利','新型电池材料','2023-04-15','周九','/files/patent2.pdf'),
('P2022001','标准','动力电池回收标准','2023-08-30','周九','/files/standard1.pdf'),
('P2022002','论文','数字化转型路径','2022-12-10','王十二','/files/paper4.pdf'),
('P2022002','成果转化','咨询方案应用','2023-01-20','王十二','/files/trans1.pdf'),
('P2022003','论文','大数据平台架构','2023-06-01','刘十五','/files/paper5.pdf'),
('P2022003','专利','大数据处理系统','2023-09-10','刘十五','/files/patent3.pdf'),
('P2023001','论文','AI医疗影像','2024-01-15','张三','/files/paper6.pdf'),
('P2023001','软件著作权','AI辅助诊断','2024-02-20','张三','/files/sw2.pdf'),   -- 修改此处
('P2023002','论文','车间调度算法','2023-10-05','李四','/files/paper7.pdf'),
('P2023003','论文','传感器误差补偿','2024-03-01','赵六','/files/paper8.pdf'),
('P2023004','专利','耐腐蚀材料','2023-12-01','周九','/files/patent4.pdf'),
('P2023005','论文','供应链风险管理','2024-01-10','王十二','/files/paper9.pdf'),
('P2023006','论文','数学建模应用','2023-11-20','刘十五','/files/paper10.pdf'),
('P2023007','论文','跨文化能力培养','2023-12-05','林十八','/files/paper11.pdf'),
('P2023008','软件著作权','区块链存证','2024-02-01','高远','/files/sw3.pdf'),   -- 修改此处
('P2023009','成果转化','绿色工艺推广','2024-01-30','李雷','/files/trans2.pdf'),
('P2023010','论文','智慧校园设计','2024-02-15','王芳','/files/paper12.pdf'),
('P2024001','论文','6G关键技术','2024-05-01','张三','/files/paper13.pdf'),
('P2024002','专利','自动驾驶决策','2024-06-10','赵六','/files/patent5.pdf'),
('P2025001','论文','新材料制备','2024-08-20','王十二','/files/paper14.pdf'),
('P2025002','论文','类脑计算进展','2024-09-05','张三','/files/paper15.pdf'),
('P2025003','标准','低碳建筑标准','2024-10-01','赵六','/files/standard2.pdf'),
('P2021001','软件著作权','图像识别软件','2022-10-15','张三','/files/sw4.pdf'),   -- 修改此处
('P2022001','获奖','省自然科学一等奖','2023-12-10','周九','/files/award2.pdf');

INSERT INTO review (project_id, expert_id, result, score, comment, review_date) VALUES
('P2023001','R1001','通过',85,'创新性强','2023-02-01'),
('P2023001','R1002','通过',90,'方案可行','2023-02-02'),
('P2023002','R1001','不通过',65,'内容模糊','2023-03-01'),
('P2023002','R1002','通过',78,'有价值','2023-03-02'),
('P2023003','R1001','通过',88,'技术先进','2023-04-10'),
('P2023003','R1003','通过',92,'建议资助','2023-04-11'),
('P2024003','R1002','通过',80,'基础良好','2024-03-01'),
('P2024003','R1003','不通过',60,'预算不合理','2024-03-02');

INSERT INTO notice (title, content, publish_date, admin_id) VALUES
('2023国自然申报','3月20日前提交','2023-01-10','admin'),
('省部级项目申报','附件见通知','2023-02-01','admin'),
('中期检查会议','准备材料','2023-05-05','admin'),
('2023成果统计','系统登记','2023-11-01','admin'),
('2024横向申报','需求清单发布','2024-01-15','admin'),
('经费报销规范更新','请遵照执行','2023-03-01','admin');

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- 3. 存储过程
-- ----------------------------
DELIMITER $$
CREATE PROCEDURE sp_college_project_stats(IN p_year INT)
BEGIN
    SELECT
        c.college_id,
        c.name AS college_name,
        COUNT(p.project_id) AS apply_count,
        SUM(CASE WHEN p.status IN ('已立项','执行中','验收通过','验收申请','验收评审') THEN 1 ELSE 0 END) AS approve_count,
        ROUND(SUM(CASE WHEN p.status IN ('已立项','执行中','验收通过','验收申请','验收评审') THEN 1 ELSE 0 END) / NULLIF(COUNT(p.project_id),0) * 100, 2) AS approve_rate,
        COALESCE(SUM(e.amount), 0) AS total_fund
    FROM college c
    LEFT JOIN researcher r ON c.college_id = r.college_id
    LEFT JOIN project p ON r.researcher_id = p.leader_id AND YEAR(p.apply_date) = p_year
    LEFT JOIN (SELECT project_id, SUM(amount) AS amount FROM expenditure WHERE type='到账' AND approval_status='已通过' GROUP BY project_id) e ON p.project_id = e.project_id
    GROUP BY c.college_id;
END$$

CREATE PROCEDURE sp_researcher_workload(IN p_year INT)
BEGIN
    SELECT
        r.researcher_id,
        r.name,
        COUNT(DISTINCT p.project_id) AS project_count,
        SUM(CASE WHEN p.status IN ('已立项','执行中','验收申请','验收评审') THEN 1 ELSE 0 END) AS active_project_count,
        COUNT(DISTINCT a.ach_id) AS achievement_count
    FROM researcher r
    LEFT JOIN project p ON r.researcher_id = p.leader_id AND YEAR(p.apply_date) = p_year
    LEFT JOIN achievement a ON p.project_id = a.project_id
    GROUP BY r.researcher_id;
END$$
DELIMITER ;

-- ----------------------------
-- 4. 触发器
-- ----------------------------
DELIMITER $$
CREATE TRIGGER trg_acceptance_update
AFTER UPDATE ON project
FOR EACH ROW
BEGIN
    IF NEW.status = '验收通过' AND OLD.status != '验收通过' THEN
        UPDATE project SET acceptance_date = CURDATE() WHERE project_id = NEW.project_id;
    END IF;
END$$

CREATE TRIGGER trg_expenditure_after_approve
AFTER UPDATE ON expenditure
FOR EACH ROW
BEGIN
    DECLARE current_spent DECIMAL(12,2);
    DECLARE budget_amount DECIMAL(12,2);
    IF NEW.type = '支出' AND NEW.approval_status = '已通过' AND OLD.approval_status != '已通过' THEN
        SELECT amount, spent INTO budget_amount, current_spent FROM budget WHERE budget_id = NEW.budget_id;
        IF NEW.amount + current_spent > budget_amount THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '预算余额不足，支出被拦截';
        ELSE
            UPDATE budget SET spent = spent + NEW.amount WHERE budget_id = NEW.budget_id;
        END IF;
    END IF;
END$$
DELIMITER ;

-- ----------------------------
-- 5. 视图
-- ----------------------------
CREATE VIEW v_project_budget_status AS
SELECT
    p.project_id,
    p.name,
    b.category,
    b.amount AS budget,
    b.spent AS expended,
    ROUND(b.spent / NULLIF(b.amount,0) * 100, 2) AS execute_rate,
    (b.amount - b.spent) AS remaining
FROM project p
JOIN budget b ON p.project_id = b.project_id;

CREATE VIEW v_researcher_summary AS
SELECT
    r.researcher_id,
    r.name,
    COUNT(DISTINCT p.project_id) AS project_count,
    COUNT(DISTINCT a.ach_id) AS achievement_count
FROM researcher r
LEFT JOIN project p ON r.researcher_id = p.leader_id
LEFT JOIN achievement a ON p.project_id = a.project_id
GROUP BY r.researcher_id;

-- ----------------------------
-- 6. 索引
-- ----------------------------
CREATE INDEX idx_project_end_date ON project(end_date);
CREATE INDEX idx_project_leader ON project(leader_id);
CREATE INDEX idx_expenditure_project ON expenditure(project_id);
CREATE INDEX idx_achievement_project ON achievement(project_id);
CREATE INDEX idx_budget_project ON budget(project_id);

-- ----------------------------
-- 7. 函数
-- ----------------------------
DELIMITER $$
CREATE FUNCTION fn_budget_warning_level(p_budget_id INT)
RETURNS VARCHAR(10)
DETERMINISTIC
BEGIN
    DECLARE rate DECIMAL(5,2);
    DECLARE spent_amt DECIMAL(12,2);
    DECLARE total_amt DECIMAL(12,2);
    SELECT amount, spent INTO total_amt, spent_amt FROM budget WHERE budget_id = p_budget_id;
    SET rate = spent_amt / NULLIF(total_amt,0) * 100;
    IF rate >= 100 THEN RETURN '超支';
    ELSEIF rate >= 85 THEN RETURN '预警';
    ELSE RETURN '正常';
    END IF;
END$$
DELIMITER ;