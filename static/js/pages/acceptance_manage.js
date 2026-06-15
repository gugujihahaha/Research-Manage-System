/** 科研处 — 验收管理 */
const AcceptanceManagePage = {
    data() { return { loading: false, submitting: false, msg: '', uploadMsg: '', allProjects: [], review: { project_id: '', result: '通过', comment: '' }, cert: { project_id: '', certificate_url: '' }, confirmAction: null }; },
    mounted() { this.load(); },
    computed: {
        acceptanceList() { return this.allProjects.filter(p => ['验收申请','验收评审'].includes(p.status)); },
        passedList() { return this.allProjects.filter(p => p.status === '验收通过' && !p._hasCert); }
    },
    methods: {
        async load() {
            this.loading = true;
            try {
                const r = await api.get('/projects');
                if (r.code === 200) {
                    const ps = r.data;
                    for (const p of ps.filter(x => x.status === '验收通过')) {
                        try { const tl = await api.get(`/projects/${p.project_id}/timeline`); p._hasCert = !!tl?.data?.project?.acceptance_date; } catch { p._hasCert = false; }
                    }
                    this.allProjects = ps;
                }
            } finally { this.loading = false; }
        },
        async handleUpload(e) { const file = e.target.files[0]; if (!file) return; try { const res = await uploadFile(file); if (res?.code === 200) { this.cert.certificate_url = res.data?.url || res.url || ''; this.uploadMsg = '已上传'; } } catch { this.uploadMsg = '上传失败'; } },
        selectReview(p) { this.review.project_id = p.project_id; },
        selectCert(p) { this.cert.project_id = p.project_id; },
        confirm(type) { if ((type === 'review' && !this.review.project_id) || (type === 'cert' && !this.cert.project_id)) { this.msg = '请选择项目'; return; } this.confirmAction = type; },
        cancel() { this.confirmAction = null; },
        async exec() {
            const action = this.confirmAction; this.confirmAction = null;
            this.submitting = true; this.msg = '';
            try {
                let res;
                if (action === 'review') res = await api.put('/acceptance/review', this.review);
                else { res = await api.post('/acceptance/certificate', this.cert); this.uploadMsg = ''; }
                this.msg = res?.message || '操作完成';
                this.load();
                setTimeout(() => this.msg = '', 3000);
            } catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div v-loading="loading">
      <div class="page-head d-flex justify-between align-center"><div><h2>验收管理</h2><p class="desc">对申请验收的项目进行评审，发放结题证书</p></div><el-button size="small" @click="load">刷新</el-button></div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <div v-if="confirmAction" :style="'background:#fff7ed;border:1px solid #fed7aa;padding:12px 16px;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between'"><span>{{ confirmAction === 'review' ? '确认验收评审项目' + review.project_id + '为「' + review.result + '」？' : '确认发放项目' + cert.project_id + '的结题证书？' }}</span><div class="d-flex gap-2"><el-button size="small" @click="cancel">取消</el-button><el-button size="small" type="warning" :loading="submitting" @click="exec">确认</el-button></div></div>
      <el-tabs type="border-card">
        <el-tab-pane><template #label>待验收评审 ({{ acceptanceList.length }})</template>
          <el-table :data="acceptanceList" stripe size="small" v-if="acceptanceList.length" @row-click="selectReview"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column prop="leader_id" label="负责人" width="100"/><el-table-column label="状态" width="100"><template #default="s"><el-tag size="small">{{ s.row.status }}</el-tag></template></el-table-column><el-table-column label="操作" width="220"><template #default="s"><template v-if="review.project_id === s.row.project_id"><el-radio-group v-model="review.result" size="small"><el-radio value="通过">通过</el-radio><el-radio value="不通过">退回</el-radio></el-radio-group><el-button size="small" type="warning" @click="confirm('review')" style="margin-left:8px">确认</el-button></template><el-button v-else size="small" type="primary" @click="selectReview(s.row)">验收评审</el-button></template></el-table-column></el-table>
          <el-empty v-else description="暂无待验收项目" :image-size="80"/>
        </el-tab-pane>
        <el-tab-pane><template #label>发放证书 ({{ passedList.length }})</template>
          <el-table :data="passedList" stripe size="small" v-if="passedList.length"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column prop="acceptance_date" label="验收日期" width="110"/><el-table-column label="操作" width="280"><template #default="s"><template v-if="cert.project_id === s.row.project_id"><input type="file" @change="handleUpload" accept=".pdf,.doc,.docx" style="font-size:12px;width:130px"/><span v-if="uploadMsg" style="font-size:11px;margin:0 4px">{{ uploadMsg }}</span><el-button size="small" type="success" @click="confirm('cert')" style="margin-left:4px">发放</el-button></template><el-button v-else size="small" type="success" @click="selectCert(s.row)">发放证书</el-button></template></el-table-column></el-table>
          <el-empty v-else description="暂无待发放证书的项目" :image-size="80"/>
        </el-tab-pane>
      </el-tabs>
    </div>`
};
