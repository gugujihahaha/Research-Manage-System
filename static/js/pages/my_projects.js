/** 科研人员 — 我的项目 */
const MyProjectsPage = {
    props: ['user'],
    data() {
        return { projects: [], loading: false, activeTab: 'list', submitting: false, msg: '', confirmAction: null,
            budgetPid: '', budgetData: [], budgetSummary: null,
            report: { project_id: '', year: new Date().getFullYear().toString(), content: '', file_url: '' },
            uploadMsg: '',
            change: { project_id: '', type: '预算调整', old_value: '', new_value: '', reason: '' },
            editForm: { project_id: '', name: '', type: '纵向', level: '省部级', start_date: '', end_date: '', budget_total: 0 },
            editVisible: false,
            detailVisible: false, detail: null, timeline: null,
            detailReports: [], detailChanges: [], certUrl: '' };
    },
    mounted() { this.loadMyProjects(); },
    computed: {
        steps() {
            if (!this.detail) return [];
            const s = this.detail.status;
            const statusOrder = ['申报中','形式审查','专家评审','立项公示','已立项','执行中','验收申请','验收评审','验收通过'];
            const idx = statusOrder.indexOf(s);
            return [
                { title: '申报', desc: '提交申报书', done: idx >= 0 },
                { title: '形式审查', desc: '科研处初审', done: idx >= 1 },
                { title: '专家评审', desc: this.getReviewDesc(), done: idx >= 2 },
                { title: '立项执行', desc: '审批通过，项目在研', done: idx >= 4 || s === '已立项' },
                { title: '验收', desc: '提交结题材料', done: idx >= 6 },
                { title: '完成', desc: '验收通过', done: s === '验收通过' }
            ];
        },
        currentStep() {
            const m = { '申报中': 0, '形式审查': 1, '专家评审': 2, '立项公示': 2, '已立项': 3, '执行中': 3, '验收申请': 4, '验收评审': 4, '验收通过': 6, '终止': -1 };
            return m[this.detail?.status] ?? 0;
        }
    },
    methods: {
        async loadMyProjects() { this.loading = true; try { const r = await api.get('/projects'); if (r.code === 200) this.projects = r.data.filter(p => p.leader_id === this.user.researcher_id); } finally { this.loading = false; } },
        statusType(s) { const m = { '申报中': 'info', '形式审查': '', '专家评审': 'warning', '立项公示': 'warning', '已立项': 'success', '执行中': '', '验收申请': 'warning', '验收评审': 'warning', '验收通过': 'success', '终止': 'danger' }; return m[s] || 'info'; },
        canEdit(s) { return ['申报中'].includes(s); },
        canDelete(s) { return ['申报中', '形式审查'].includes(s); },
        canWithdraw(s) { return ['申报中', '形式审查', '专家评审'].includes(s); },
        getReviewDesc() {
            if (!this.timeline || !this.timeline.length) return '等待分配专家';
            const done = this.timeline.filter(r => r.result).length;
            const pass = this.timeline.filter(r => r.result === '通过').length;
            const fail = this.timeline.filter(r => r.result === '不通过').length;
            if (done === this.timeline.length) {
                return fail > 0 ? `${pass}通过 ${fail}不通过 → 退回修改` : '全部通过 → 立项公示';
            }
            return `${done}/${this.timeline.length} 位已完成（${pass}通过）`;
        },
        async showDetail(p) {
            this.detail = p;
            this.detailReports = []; this.detailChanges = [];
            try {
                const r = await api.get(`/projects/${p.project_id}/timeline`);
                if (r && r.code === 200) { this.detail = r.data.project; this.timeline = r.data.reviews; this.certUrl = r.data.cert_url || ''; }
            } catch {}
            try {
                const reps = await api.get(`/projects/${p.project_id}/reports`);
                if (reps && reps.code === 200) this.detailReports = reps.data;
            } catch {}
            try {
                const chgs = await api.get(`/projects/${p.project_id}/changes`);
                if (chgs && chgs.code === 200) this.detailChanges = chgs.data;
            } catch {}
            this.detailVisible = true;
        },
        async showBudget(pid) { this.budgetPid = pid; const r = await api.get(`/funding/status/${pid}`); if (r.code === 200) { this.budgetSummary = r.data.summary; this.budgetData = r.data.details; } this.activeTab = 'budget'; },
        open(pid, tab) { if (tab === 'report') this.report.project_id = pid; if (tab === 'change') this.change.project_id = pid; this.activeTab = tab; },
        openEdit(p) { Object.assign(this.editForm, { project_id: p.project_id, name: p.name, type: p.type, level: p.level, start_date: p.start_date, end_date: p.end_date, budget_total: p.budget_total }); this.editVisible = true; },
        async saveEdit() { this.submitting = true; this.msg = ''; try { await api.put(`/projects/${this.editForm.project_id}`, this.editForm); this.msg = '保存成功'; this.editVisible = false; this.loadMyProjects(); setTimeout(() => this.msg = '', 3000); } catch (e) { this.msg = e?.response?.data?.message || '保存失败'; } finally { this.submitting = false; } },
        confirm(type, pid) { this.confirmAction = { type, pid }; },
        cancelConfirm() { this.confirmAction = null; },
        async execConfirm() { const { type, pid } = this.confirmAction; this.confirmAction = null; this.submitting = true; this.msg = ''; try { if (type === 'delete') { await api.delete(`/projects/${pid}`); this.msg = '项目 ' + pid + ' 已删除'; } else { await api.put(`/projects/${pid}/withdraw`); this.msg = '项目 ' + pid + ' 已撤回'; } this.loadMyProjects(); setTimeout(() => this.msg = '', 3000); } catch (e) { this.msg = e?.response?.data?.message || '操作失败'; } finally { this.submitting = false; } },
        async handleReportUpload(e) {
            const file = e.target.files[0]; if (!file) return;
            this.uploadMsg = '上传中...';
            try { const res = await uploadFile(file); if (res?.code === 200) { this.report.file_url = res.data?.url || res.url || ''; this.uploadMsg = '已上传'; } } catch { this.uploadMsg = '上传失败'; }
        },
        async submitReport() { this.submitting = true; try { await api.post('/progress_reports', this.report); this.msg = '报告已提交'; this.uploadMsg = ''; setTimeout(() => this.msg = '', 3000); } catch (e) { this.msg = e?.response?.data?.message || '提交失败'; } finally { this.submitting = false; } },
        async submitChange() { if (!this.change.reason) { this.msg = '请填写变更理由'; return; } if (!this.change.old_value || !this.change.new_value) { this.msg = '请填写原值和新值'; return; } this.submitting = true; this.msg = ''; try { await api.post('/change_requests', this.change); this.msg = '变更已提交'; setTimeout(() => this.msg = '', 3000); } catch (e) { this.msg = e?.response?.data?.message || '提交失败'; } finally { this.submitting = false; } },
    },
    template: `
    <div>
      <div class="page-head"><h2>我的项目</h2><p class="desc">点击项目名称查看进度详情</p></div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <div v-if="confirmAction" :style="'background:#fff7ed;border:1px solid #fed7aa;padding:12px 16px;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between'">
        <span>{{ confirmAction.type === 'delete' ? '确认删除项目 ' + confirmAction.pid + '？' : '确认撤回项目 ' + confirmAction.pid + '？' }}</span>
        <div class="d-flex gap-2"><el-button size="small" @click="cancelConfirm">取消</el-button><el-button size="small" :type="confirmAction.type === 'delete' ? 'danger' : 'warning'" :loading="submitting" @click="execConfirm">确认</el-button></div>
      </div>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="项目列表" name="list">
          <el-table :data="projects" stripe v-loading="loading" v-if="projects.length" size="small">
            <el-table-column prop="project_id" label="编号" width="110"/>
            <el-table-column label="项目名称" show-overflow-tooltip>
              <template #default="s"><el-button text type="primary" @click="showDetail(s.row)" style="font-size:13px">{{ s.row.name }}</el-button></template>
            </el-table-column>
            <el-table-column label="状态" width="100"><template #default="s"><el-tag :type="statusType(s.row.status)" size="small">{{ s.row.status }}</el-tag></template></el-table-column>
            <el-table-column prop="budget_total" label="预算(万)" width="90"/>
            <el-table-column label="操作" width="180">
              <template #default="s">
                <el-button size="small" @click="showBudget(s.row.project_id)">预算</el-button>
                <el-dropdown trigger="click" style="margin-left:4px"><el-button size="small">更多</el-button>
                  <template #dropdown><el-dropdown-menu>
                    <el-dropdown-item @click="open(s.row.project_id,'report')">进展报告</el-dropdown-item>
                    <el-dropdown-item @click="open(s.row.project_id,'change')">变更申请</el-dropdown-item>
                    <el-dropdown-item v-if="canEdit(s.row.status)" @click="openEdit(s.row)" divided>编辑信息</el-dropdown-item>
                    <el-dropdown-item v-if="canWithdraw(s.row.status)" @click="confirm('withdraw', s.row.project_id)">撤回申报</el-dropdown-item>
                    <el-dropdown-item v-if="canDelete(s.row.status)" @click="confirm('delete', s.row.project_id)" style="color:#F56C6C">删除项目</el-dropdown-item>
                  </el-dropdown-menu></template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无项目" :image-size="80"/>
        </el-tab-pane>
        <el-tab-pane label="预算执行" name="budget"><p class="text-muted mb-3">项目 {{ budgetPid }}</p>
          <div v-if="budgetSummary"><el-descriptions :column="3" border size="small"><el-descriptions-item label="总预算">{{ budgetSummary.total_budget }} 万</el-descriptions-item><el-descriptions-item label="已支出">{{ budgetSummary.total_spent }} 万</el-descriptions-item><el-descriptions-item label="执行率"><el-progress :percentage="budgetSummary.execute_rate" :stroke-width="14" style="width:180px"/></el-descriptions-item></el-descriptions><el-table :data="budgetData" stripe size="small" class="mt-3"><el-table-column prop="category" label="科目"/><el-table-column prop="budget" label="预算(万)"/><el-table-column prop="expended" label="已支出(万)"/></el-table></div>
        </el-tab-pane>
        <el-tab-pane label="进展报告" name="report"><el-form :model="report" label-width="80px" style="max-width:500px"><el-form-item label="项目"><el-input v-model="report.project_id" disabled/></el-form-item><el-form-item label="年度"><el-input v-model="report.year"/></el-form-item><el-form-item label="内容"><el-input v-model="report.content" type="textarea" :rows="5" placeholder="填写年度进展摘要..."/></el-form-item><el-form-item label="附件"><input type="file" @change="handleReportUpload" accept=".pdf,.doc,.docx" style="font-size:12px"/><span v-if="uploadMsg" class="text-muted" style="font-size:11px;margin-left:8px">{{ uploadMsg }}</span></el-form-item><el-button type="success" :loading="submitting" @click="submitReport">提交报告</el-button></el-form></el-tab-pane>
        <el-tab-pane label="变更申请" name="change">
          <el-form :model="change" label-width="90px" style="max-width:500px">
            <el-form-item label="项目"><el-input v-model="change.project_id" disabled/></el-form-item>
            <el-form-item label="类型"><el-select v-model="change.type" style="width:100%"><el-option label="预算调整" value="预算调整"/><el-option label="延期" value="延期"/><el-option label="成员变更" value="成员变更"/></el-select></el-form-item>
            <el-form-item v-if="change.type==='预算调整'" label="原金额"><el-input v-model="change.old_value" placeholder="原预算金额（万元）"/></el-form-item>
            <el-form-item v-if="change.type==='预算调整'" label="新金额"><el-input v-model="change.new_value" placeholder="调整后金额（万元）"/></el-form-item>
            <el-form-item v-if="change.type==='延期'" label="原结束日期"><el-input v-model="change.old_value" placeholder="原结束日期"/></el-form-item>
            <el-form-item v-if="change.type==='延期'" label="新结束日期"><el-input v-model="change.new_value" placeholder="延期后日期"/></el-form-item>
            <el-form-item v-if="change.type==='成员变更'" label="原成员"><el-input v-model="change.old_value" placeholder="原成员名单"/></el-form-item>
            <el-form-item v-if="change.type==='成员变更'" label="新成员"><el-input v-model="change.new_value" placeholder="变更后成员"/></el-form-item>
            <el-form-item label="理由"><el-input v-model="change.reason" type="textarea" :rows="3"/></el-form-item>
            <el-button type="warning" :loading="submitting" @click="submitChange">提交变更</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="editVisible" title="编辑项目" width="520px"><el-form :model="editForm" label-width="110px" size="small"><el-form-item label="项目编号"><el-input v-model="editForm.project_id" disabled/></el-form-item><el-form-item label="项目名称"><el-input v-model="editForm.name"/></el-form-item><el-form-item label="类型"><el-select v-model="editForm.type"><el-option label="纵向" value="纵向"/><el-option label="横向" value="横向"/></el-select></el-form-item><el-form-item label="级别"><el-select v-model="editForm.level"><el-option label="国家级" value="国家级"/><el-option label="省部级" value="省部级"/><el-option label="市厅级" value="市厅级"/><el-option label="横向" value="横向"/></el-select></el-form-item><el-form-item label="开始日期"><el-date-picker v-model="editForm.start_date" type="date" value-format="YYYY-MM-DD" style="width:100%"/></el-form-item><el-form-item label="结束日期"><el-date-picker v-model="editForm.end_date" type="date" value-format="YYYY-MM-DD" style="width:100%"/></el-form-item><el-form-item label="总预算(万元)"><el-input-number v-model="editForm.budget_total" :min="0" :precision="2" style="width:100%"/></el-form-item></el-form><template #footer><el-button @click="editVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="saveEdit">保存</el-button></template></el-dialog>

      <el-dialog v-model="detailVisible" :title="detail?.name" width="640px" v-if="detail">
        <div style="margin-bottom:24px">
          <el-steps :active="currentStep" finish-status="success" process-status="process" align-center>
            <el-step v-for="(s, i) in steps" :key="i" :title="s.title" :description="s.desc" :status="i < currentStep ? 'success' : i === currentStep ? 'process' : 'wait'"/>
          </el-steps>
        </div>
        <el-descriptions :column="2" border size="small" style="margin-bottom:16px">
          <el-descriptions-item label="编号">{{ detail.project_id }}</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag :type="statusType(detail.status)" size="small">{{ detail.status }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="类型">{{ detail.type }}</el-descriptions-item>
          <el-descriptions-item label="级别">{{ detail.level }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ detail.leader_id }}</el-descriptions-item>
          <el-descriptions-item label="预算">{{ detail.budget_total }} 万元</el-descriptions-item>
          <el-descriptions-item label="起止">{{ detail.start_date }} ~ {{ detail.end_date }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="timeline && timeline.length" style="margin-top:16px">
          <h5 style="margin-bottom:12px;font-size:14px">专家评审记录</h5>
          <div v-for="r in timeline" :key="r.review_id" :style="'padding:10px 14px;margin-bottom:8px;border-radius:8px;border:1px solid ' + (r.result ? '#d1fae5' : '#fef3c7') + ';background:' + (r.result ? '#f0fdf4' : '#fffbeb')">
            <div class="d-flex justify-between align-center">
              <span style="font-weight:500">{{ r.expert_name || r.expert_id }} <span class="text-muted">({{ r.expert_title || '专家' }})</span></span>
              <el-tag v-if="r.result" :type="r.result === '通过' ? 'success' : 'danger'" size="small">{{ r.result }} {{ r.score }}分</el-tag>
              <el-tag v-else type="warning" size="small">待评审</el-tag>
            </div>
            <div v-if="r.comment" class="text-muted mt-1">{{ r.comment }}</div>
            <div class="text-muted" style="font-size:11px;margin-top:4px">{{ r.review_date || '' }}</div>
          </div>
        </div>
        <div v-else-if="detail.status === '专家评审'" style="margin-top:16px;text-align:center;padding:20px;color:#94a3b8">尚未分配评审专家</div>
        <div v-if="detailReports.length" style="margin-top:20px">
          <h5 style="margin-bottom:8px;font-size:14px">进展报告 ({{ detailReports.length }})</h5>
          <div v-for="r in detailReports" :key="r.report_id" style="padding:10px 14px;margin-bottom:6px;border-radius:8px;border:1px solid #e5e7eb;background:#fafbfc">
            <div class="d-flex justify-between align-center"><span style="font-weight:500">{{ r.report_year }}年度</span><el-tag size="small" :type="r.status === '已审核' ? 'success' : 'warning'">{{ r.status }}</el-tag></div>
            <div class="text-muted mt-1">{{ r.content?.substring(0, 100) }}{{ r.content?.length > 100 ? '...' : '' }}</div>
            <div class="text-muted" style="font-size:11px;margin-top:4px">{{ r.submit_date }}</div>
          </div>
        </div>
        <div v-if="detail.acceptance_date" style="margin-top:20px;padding:14px 16px;border-radius:8px;background:#f0fdf4;border:1px solid #bbf7d0">
          <div class="d-flex justify-between align-center"><span style="font-weight:500;color:#16a34a">结题证书</span><el-tag type="success" size="small">已发放</el-tag></div>
          <div class="text-muted mt-1">验收通过日期：{{ detail.acceptance_date }}</div>
          <a v-if="certUrl" :href="certUrl" target="_blank" style="display:inline-block;margin-top:8px;color:#4f6ef7;font-size:13px">下载证书</a>
        </div>
        <div v-if="detailChanges.length" style="margin-top:20px">
          <h5 style="margin-bottom:8px;font-size:14px">变更申请 ({{ detailChanges.length }})</h5>
          <div v-for="c in detailChanges" :key="c.request_id" style="padding:10px 14px;margin-bottom:6px;border-radius:8px;border:1px solid #e5e7eb;background:#fafbfc">
            <div class="d-flex justify-between align-center"><span style="font-weight:500">{{ c.request_type }}</span><el-tag size="small" :type="c.approval_status === '已通过' ? 'success' : c.approval_status === '已驳回' ? 'danger' : 'warning'">{{ c.approval_status }}</el-tag></div>
            <div class="text-muted mt-1">{{ c.new_value }} (原: {{ c.old_value }})</div>
            <div class="text-muted" style="font-size:11px;margin-top:4px">{{ c.apply_date }} — {{ c.reason }}</div>
          </div>
        </div>
      </el-dialog>
    </div>`
};
