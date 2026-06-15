/** 科研处 — 项目审核 */
const ReviewManagePage = {
    data() {
        return {
            loading: false, submitting: false, msg: '',
            activeTab: 'form',
            allProjects: [], search: '',
            expertPid: '', expertIds: '',
            confirmAction: null,
            allReports: [], allChanges: [], allAchievements: [],
            detailVisible: false, detail: null, timeline: null
        };
    },
    mounted() { this.load(); },
    computed: {
        formReviewList() { const kw = this.search.toLowerCase(); return this.allProjects.filter(p => p.status === '申报中' && (!kw || p.project_id.includes(kw) || p.name.includes(kw) || p.leader_id.includes(kw))); },
        expertAssignList() { const kw = this.search.toLowerCase(); return this.allProjects.filter(p => p.status === '专家评审' && !p._hasReviews && (!kw || p.project_id.includes(kw) || p.name.includes(kw) || p.leader_id.includes(kw))); },
        reviewingList() { const kw = this.search.toLowerCase(); return this.allProjects.filter(p => p.status === '专家评审' && p._hasReviews && (!kw || p.project_id.includes(kw) || p.name.includes(kw) || p.leader_id.includes(kw))); },
        approveList() { const kw = this.search.toLowerCase(); return this.allProjects.filter(p => p.status === '立项公示' && (!kw || p.project_id.includes(kw) || p.name.includes(kw) || p.leader_id.includes(kw))); },
        approvedList() { const kw = this.search.toLowerCase(); return this.allProjects.filter(p => ['已立项'].includes(p.status) && (!kw || p.project_id.includes(kw) || p.name.includes(kw) || p.leader_id.includes(kw))); }
    },
    methods: {
        async load() {
            this.loading = true;
            try {
                const r = await api.get('/projects');
                if (r.code === 200) {
                    const projects = r.data;
                    for (const p of projects) {
                        try {
                            const tl = await api.get(`/projects/${p.project_id}/timeline`);
                            p._hasReviews = tl?.data?.reviews?.length > 0;
                        } catch { p._hasReviews = false; }
                    }
                    this.allProjects = projects;
                }
            } finally { this.loading = false; }
        },
        async loadPendingItems() {
            try { const r = await api.get('/pending-reports'); if (r?.code === 200) this.allReports = r.data; } catch {}
            try { const r = await api.get('/pending-changes'); if (r?.code === 200) this.allChanges = r.data; } catch {}
            try { const r = await api.get('/pending-achievements'); if (r?.code === 200) this.allAchievements = r.data; } catch {}
        },
        async reviewReport(rid, status) {
            this.submitting = true;
            try { await api.put(`/progress_reports/${rid}`, { status }); this.msg = '审核完成'; this.allReports = this.allReports.filter(r => r.report_id !== rid); setTimeout(() => this.msg = '', 3000); }
            catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        },
        async reviewAchievement(aid, status) {
            this.submitting = true;
            try { await api.put(`/achievements/${aid}/review`, { status }); this.msg = '审核完成'; this.allAchievements = this.allAchievements.filter(a => a.ach_id !== aid); setTimeout(() => this.msg = '', 3000); }
            catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        },
        async reviewChange(rid, status) {
            this.submitting = true;
            try { await api.put(`/change_requests/${rid}`, { status }); this.msg = '审核完成'; this.allChanges = this.allChanges.filter(c => c.request_id !== rid); setTimeout(() => this.msg = '', 3000); }
            catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        },
        async showDetail(p) {
            this.detail = p; this.timeline = null;
            try { const r = await api.get(`/projects/${p.project_id}/timeline`); if (r?.code === 200) { this.detail = r.data.project; this.timeline = r.data.reviews; } } catch {}
            this.detailVisible = true;
        },
        statusType(s) { const m = { '申报中': 'info', '形式审查': '', '专家评审': 'warning', '立项公示': 'warning', '已立项': 'success', '执行中': '', '验收申请': 'warning', '验收评审': 'warning', '验收通过': 'success', '终止': 'danger' }; return m[s] || 'info'; },
        async doFormReview(pid, result) {
            this.submitting = true; this.msg = '';
            try {
                const res = await api.put(`/projects/${pid}/form_review`, { result });
                this.msg = res?.message || (result === '通过' ? '审查通过，进入专家评审' : '已退回修改');
                this.load();
                setTimeout(() => { this.msg = ''; }, 3000);
            } catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        },
        selectExpert(pid) { this.expertPid = pid; this.expertIds = ''; },
        async doAssign() {
            if (!this.expertPid || !this.expertIds) { this.msg = '请选择项目并输入专家工号'; return; }
            const ids = this.expertIds.split(/[,，]/).map(s => s.trim()).filter(Boolean);
            if (!ids.length) { this.msg = '工号格式错误'; return; }
            this.submitting = true; this.msg = '';
            try {
                const res = await api.post(`/projects/${this.expertPid}/assign_experts`, { expert_ids: ids });
                this.msg = res?.message || '专家已分配';
                this.expertPid = ''; this.expertIds = '';
                this.load();
                setTimeout(() => { this.msg = ''; }, 3000);
            } catch (e) { this.msg = e?.response?.data?.message || '分配失败'; }
            finally { this.submitting = false; }
        },
        confirm(type, pid) { this.confirmAction = { type, pid }; },
        cancel() { this.confirmAction = null; },
        async doAction() {
            const { type, pid } = this.confirmAction; this.confirmAction = null;
            this.submitting = true; this.msg = '';
            try {
                let res;
                if (type === 'approve') res = await api.put(`/projects/${pid}/approve`);
                else res = await api.put(`/projects/${pid}/revoke`);
                this.msg = res?.message || '操作完成';
                this.load();
                setTimeout(() => { this.msg = ''; }, 3000);
            } catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div v-loading="loading">
      <div class="page-head"><h2>项目审核</h2><p class="desc">形式审查 → 分配专家 → 立项审批</p></div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <div v-if="confirmAction" :style="'background:#fff7ed;border:1px solid #fed7aa;padding:12px 16px;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between'">
        <span>{{ confirmAction.type === 'approve' ? '确认立项「' + confirmAction.pid + '」？' : '确认撤回「' + confirmAction.pid + '」的立项？' }}</span>
        <div class="d-flex gap-2"><el-button size="small" @click="cancel">取消</el-button><el-button size="small" :type="confirmAction.type === 'approve' ? 'success' : 'danger'" :loading="submitting" @click="doAction">确认</el-button></div>
      </div>

      <div class="d-flex align-center gap-2 mb-3"><el-input v-model="search" placeholder="搜索项目编号/名称/负责人" size="small" style="width:280px" clearable/></div>
      <el-tabs v-model="activeTab" type="border-card" @tab-change="(tab) => { if (['reports','changes','achievements'].includes(tab)) loadPendingItems(); }">
        <!-- 待形式审查 -->
        <el-tab-pane name="form">
          <template #label>待形式审查 ({{ formReviewList.length }})</template>
          <el-table :data="formReviewList" stripe size="small" v-if="formReviewList.length">
            <el-table-column prop="project_id" label="编号" width="110"/>
            <el-table-column label="项目名称" show-overflow-tooltip>
              <template #default="s"><el-button text type="primary" @click="showDetail(s.row)" style="font-size:13px">{{ s.row.name }}</el-button></template>
            </el-table-column>
            <el-table-column prop="leader_id" label="负责人" width="100"/>
            <el-table-column prop="apply_date" label="申请日期" width="110"/>
            <el-table-column label="操作" width="180">
              <template #default="s">
                <el-button size="small" type="primary" @click="doFormReview(s.row.project_id, '通过')">通过</el-button>
                <el-button size="small" type="danger" @click="doFormReview(s.row.project_id, '不通过')">退回</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无待审查项目" :image-size="80"/>
        </el-tab-pane>

        <!-- 待分配专家 -->
        <el-tab-pane name="expert">
          <template #label>待分配专家 ({{ expertAssignList.length }})</template>
          <el-table :data="expertAssignList" stripe size="small" v-if="expertAssignList.length">
            <el-table-column prop="project_id" label="编号" width="110"/>
            <el-table-column label="项目名称" show-overflow-tooltip>
              <template #default="s"><el-button text type="primary" @click="showDetail(s.row)" style="font-size:13px">{{ s.row.name }}</el-button></template>
            </el-table-column>
            <el-table-column prop="leader_id" label="负责人" width="100"/>
            <el-table-column label="操作" width="300">
              <template #default="s">
                <template v-if="expertPid === s.row.project_id">
                  <el-input v-model="expertIds" placeholder="专家工号，逗号分隔" size="small" style="width:180px"/>
                  <el-button size="small" type="primary" :loading="submitting" @click="doAssign" style="margin-left:4px">确认</el-button>
                  <el-button size="small" @click="expertPid = ''">取消</el-button>
                </template>
                <el-button v-else size="small" type="primary" @click="selectExpert(s.row.project_id)">分配专家</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无待分配项目" :image-size="80"/>
        </el-tab-pane>

        <!-- 评审中 -->
        <el-tab-pane name="reviewing">
          <template #label>评审中 ({{ reviewingList.length }})</template>
          <el-table :data="reviewingList" stripe size="small" v-if="reviewingList.length">
            <el-table-column prop="project_id" label="编号" width="110"/>
            <el-table-column label="项目名称" show-overflow-tooltip>
              <template #default="s"><el-button text type="primary" @click="showDetail(s.row)" style="font-size:13px">{{ s.row.name }}</el-button></template>
            </el-table-column>
            <el-table-column prop="leader_id" label="负责人" width="100"/>
            <el-table-column label="操作" width="300">
              <template #default="s">
                <template v-if="expertPid === s.row.project_id">
                  <el-input v-model="expertIds" placeholder="追加专家工号" size="small" style="width:180px"/>
                  <el-button size="small" type="primary" :loading="submitting" @click="doAssign" style="margin-left:4px">追加</el-button>
                  <el-button size="small" @click="expertPid = ''">取消</el-button>
                </template>
                <el-button v-else size="small" @click="selectExpert(s.row.project_id)">追加专家</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无评审中项目" :image-size="80"/>
        </el-tab-pane>

        <!-- 待立项审批 -->
        <el-tab-pane name="approve">
          <template #label>待立项审批 ({{ approveList.length }})</template>
          <el-table :data="approveList" stripe size="small" v-if="approveList.length">
            <el-table-column prop="project_id" label="编号" width="110"/>
            <el-table-column label="项目名称" show-overflow-tooltip>
              <template #default="s"><el-button text type="primary" @click="showDetail(s.row)" style="font-size:13px">{{ s.row.name }}</el-button></template>
            </el-table-column>
            <el-table-column prop="leader_id" label="负责人" width="100"/>
            <el-table-column label="操作" width="120">
              <template #default="s"><el-button size="small" type="success" @click="confirm('approve', s.row.project_id)">通过立项</el-button></template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无待审批项目" :image-size="80"/>
        </el-tab-pane>

        <!-- 进展报告审批 -->
        <el-tab-pane name="reports">
          <template #label>进展报告审批 ({{ allReports.filter(r => r.status === '待审核').length }})</template>
          <el-table :data="allReports.filter(r => r.status === '待审核')" stripe size="small" v-if="allReports.some(r => r.status === '待审核')">
            <el-table-column prop="project_id" label="项目编号" width="110"/>
            <el-table-column prop="project_name" label="项目名称" show-overflow-tooltip/>
            <el-table-column prop="report_year" label="年度" width="80"/>
            <el-table-column prop="content" label="内容" show-overflow-tooltip/>
            <el-table-column prop="submit_date" label="提交日期" width="110"/>
            <el-table-column label="操作" width="150">
              <template #default="s"><el-button size="small" type="success" @click="reviewReport(s.row.report_id, '已审核')">通过</el-button></template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无待审核报告" :image-size="80"/>
        </el-tab-pane>

        <!-- 变更申请审批 -->
        <el-tab-pane name="changes">
          <template #label>变更审批 ({{ allChanges.filter(c => c.approval_status === '待审批').length }})</template>
          <el-table :data="allChanges.filter(c => c.approval_status === '待审批')" stripe size="small" v-if="allChanges.some(c => c.approval_status === '待审批')">
            <el-table-column prop="project_id" label="项目编号" width="110"/>
            <el-table-column prop="project_name" label="项目名称" show-overflow-tooltip/>
            <el-table-column prop="request_type" label="类型" width="90"/>
            <el-table-column prop="reason" label="理由" show-overflow-tooltip/>
            <el-table-column prop="apply_date" label="申请日期" width="110"/>
            <el-table-column label="操作" width="180">
              <template #default="s"><el-button size="small" type="success" @click="reviewChange(s.row.request_id, '已通过')">通过</el-button><el-button size="small" type="danger" @click="reviewChange(s.row.request_id, '已驳回')">驳回</el-button></template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无待审批变更" :image-size="80"/>
        </el-tab-pane>

        <!-- 成果审核 -->
        <el-tab-pane name="achievements">
          <template #label>成果审核 ({{ allAchievements.filter(a => a.status === '待审核').length }})</template>
          <el-table :data="allAchievements.filter(a => a.status === '待审核')" stripe size="small" v-if="allAchievements.some(a => a.status === '待审核')">
            <el-table-column prop="project_id" label="项目编号" width="110"/>
            <el-table-column prop="project_name" label="项目名称" show-overflow-tooltip/>
            <el-table-column prop="type" label="类型" width="90"/>
            <el-table-column prop="title" label="标题" show-overflow-tooltip/>
            <el-table-column prop="author" label="作者" width="100"/>
            <el-table-column label="操作" width="150">
              <template #default="s"><el-button size="small" type="success" @click="reviewAchievement(s.row.ach_id, '已通过')">通过</el-button><el-button size="small" type="danger" @click="reviewAchievement(s.row.ach_id, '已驳回')">驳回</el-button></template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无待审核成果" :image-size="80"/>
        </el-tab-pane>

        <!-- 已立项（可撤回） -->
        <el-tab-pane name="revoke">
          <template #label>已立项 ({{ approvedList.length }})</template>
          <el-table :data="approvedList" stripe size="small" v-if="approvedList.length">
            <el-table-column prop="project_id" label="编号" width="110"/>
            <el-table-column label="项目名称" show-overflow-tooltip>
              <template #default="s"><el-button text type="primary" @click="showDetail(s.row)" style="font-size:13px">{{ s.row.name }}</el-button></template>
            </el-table-column>
            <el-table-column prop="leader_id" label="负责人" width="100"/>
            <el-table-column label="操作" width="120">
              <template #default="s"><el-button size="small" type="danger" @click="confirm('revoke', s.row.project_id)">撤回立项</el-button></template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无已立项项目" :image-size="80"/>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="detailVisible" :title="detail?.name" width="640px" v-if="detail">
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
          <h5 style="margin-bottom:8px;font-size:14px">专家评审记录</h5>
          <div v-for="r in timeline" :key="r.review_id" :style="'padding:10px 14px;margin-bottom:6px;border-radius:8px;border:1px solid ' + (r.result ? '#d1fae5' : '#fef3c7') + ';background:' + (r.result ? '#f0fdf4' : '#fffbeb')">
            <div class="d-flex justify-between align-center"><span style="font-weight:500">{{ r.expert_name || r.expert_id }}</span><el-tag v-if="r.result" :type="r.result === '通过' ? 'success' : 'danger'" size="small">{{ r.result }} {{ r.score }}分</el-tag><el-tag v-else type="warning" size="small">待评审</el-tag></div>
            <div v-if="r.comment" class="text-muted mt-1">{{ r.comment }}</div>
          </div>
        </div>
      </el-dialog>
    </div>`
};
