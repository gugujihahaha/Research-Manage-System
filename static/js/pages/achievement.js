/** 科研成果管理 */
const AchievementPage = {
    props: ['user'],
    data() { return { submitting: false, msg: '', uploadMsg: '', form: { project_id: '', type: '论文', title: '', publish_date: '', author: '', file_url: '' }, queryPid: '', achievements: [], loading: false, projectOptions: [] }; },
    methods: {
        async handleUpload(e) { const file = e.target.files[0]; if (!file) return; try { const res = await uploadFile(file); if (res?.code === 200) { this.form.file_url = res.data?.url || res.url || ''; this.uploadMsg = '已上传'; } } catch { this.uploadMsg = '上传失败'; } },
        async register() { if (!this.form.project_id || !this.form.title) { this.msg = '请填写项目编号和标题'; return; } this.submitting = true; this.msg = ''; try { const res = await api.post('/achievements', this.form); this.msg = res?.message || '登记成功'; this.uploadMsg = ''; setTimeout(() => this.msg = '', 3000); } catch (e) { this.msg = e?.response?.data?.message || '登记失败'; } finally { this.submitting = false; } },
        async loadProjects() { try { const r = await api.get('/projects'); if (r.code === 200) this.projectOptions = r.data; } catch {} },
        async list() { if (!this.queryPid) return; this.loading = true; try { const r = await api.get(`/achievements/${this.queryPid}`); if (r.code === 200) this.achievements = r.data; } finally { this.loading = false; } },
        typeColor(t) { const m = { '论文': '', '专利': 'success', '软件著作权': 'info', '获奖': 'warning', '标准': 'danger', '成果转化': '' }; return m[t] || ''; }
    },
    template: `
    <div>
      <div class="page-head"><h2>成果管理</h2><p class="desc">科研成果登记与查询</p></div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <el-row :gutter="20">
        <el-col :span="10"><el-card><template #header>成果登记</template><el-form :model="form" label-width="100px" size="small"><el-form-item label="项目编号"><el-input v-model="form.project_id"/></el-form-item><el-form-item label="成果类型"><el-select v-model="form.type" style="width:100%"><el-option v-for="t in ['论文','专利','软件著作权','获奖','标准','成果转化']" :key="t" :label="t" :value="t"/></el-select></el-form-item><el-form-item label="标题"><el-input v-model="form.title"/></el-form-item><el-form-item label="发表日期"><el-date-picker v-model="form.publish_date" type="date" value-format="YYYY-MM-DD" style="width:100%"/></el-form-item><el-form-item label="作者"><el-input v-model="form.author"/></el-form-item><el-form-item label="附件"><input type="file" @change="handleUpload" accept=".pdf,.doc,.docx" style="font-size:12px"/><span v-if="uploadMsg" class="text-muted" style="font-size:11px;margin-left:8px">{{ uploadMsg }}</span></el-form-item><el-button type="primary" :loading="submitting" @click="register">登记成果</el-button></el-form></el-card></el-col>
        <el-col :span="14"><el-card><template #header>项目成果查询</template><div class="d-flex gap-2 mb-3"><el-select v-model="queryPid" placeholder="选择项目" style="width:260px" size="small" @focus="loadProjects" filterable @change="list"><el-option v-for="p in projectOptions" :key="p.project_id" :label="p.project_id + ' ' + p.name" :value="p.project_id"/></el-select></div><el-table :data="achievements" stripe size="small" v-if="achievements.length"><el-table-column label="类型" width="100"><template #default="s"><el-tag :type="typeColor(s.row.type)" size="small">{{ s.row.type }}</el-tag></template></el-table-column><el-table-column prop="title" label="标题" show-overflow-tooltip/><el-table-column prop="author" label="作者" width="100"/><el-table-column prop="publish_date" label="日期" width="110"/>
            <el-table-column label="审核" width="80"><template #default="s"><el-tag :type="s.row.status === '已通过' ? 'success' : s.row.status === '已驳回' ? 'danger' : 'warning'" size="small">{{ s.row.status || '待审核' }}</el-tag></template></el-table-column><el-empty v-else-if="queryPid && !loading" description="暂无成果" :image-size="60"/></el-card></el-col>
      </el-row>
    </div>`
};
