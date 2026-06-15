/** 科研人员 — 验收申请 */
const MyAcceptancePage = {
    props: ['user'],
    data() { return { projects: [], submitting: false, msg: '', applyPid: '', materialUrl: '', uploadMsg: '' }; },
    mounted() { this.load(); },
    methods: {
        async load() { const r = await api.get('/projects'); if (r.code === 200) this.projects = r.data.filter(p => p.leader_id === this.user.researcher_id && ['已立项','执行中','验收申请','验收评审'].includes(p.status)); },
        async handleUpload(e) {
            const file = e.target.files[0]; if (!file) return;
            try { const res = await uploadFile(file); if (res?.code === 200) { this.materialUrl = res.data?.url || res.url || ''; this.uploadMsg = '已上传'; } } catch { this.uploadMsg = '上传失败'; }
        },
        async doApply() { if (!this.applyPid) return; this.submitting = true; this.msg = ''; try { const res = await api.post('/acceptance/apply', { project_id: this.applyPid, material_url: this.materialUrl }); this.msg = res?.message || '申请已提交'; this.load(); setTimeout(() => this.msg = '', 3000); } catch (e) { this.msg = e?.response?.data?.message || '申请失败'; } finally { this.submitting = false; } }
    },
    template: `
    <div>
      <div class="page-head"><h2>项目验收</h2><p class="desc">对执行中的项目提交验收申请</p></div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <el-card><template #header>可申请验收的项目</template><el-table :data="projects" stripe size="small" v-if="projects.length"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column prop="status" label="状态" width="100"/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="applyPid = s.row.project_id">申请验收</el-button></template></el-table-column></el-table><el-empty v-else description="暂无可申请验收的项目" :image-size="80"/></el-card>
      <el-card v-if="applyPid" class="mt-3"><template #header>提交验收申请 — {{ applyPid }}</template><el-form label-width="100px" style="max-width:500px"><el-form-item label="项目编号"><el-input :model-value="applyPid" disabled/></el-form-item><el-form-item label="结题材料"><input type="file" @change="handleUpload" accept=".pdf,.doc,.docx" style="font-size:12px"/><span v-if="uploadMsg" class="text-muted" style="font-size:11px;margin-left:8px">{{ uploadMsg }}</span></el-form-item><el-button type="primary" :loading="submitting" @click="doApply">提交申请</el-button></el-form></el-card>
    </div>`
};
