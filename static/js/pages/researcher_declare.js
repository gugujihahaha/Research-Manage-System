/** 科研人员 — 项目申报 */
const ResearcherDeclarePage = {
    props: ['user'],
    data() {
        return {
            notices: [], submitting: false, applyMsg: '', uploading: false, uploadMsg: '',
            budgetOptions: ['设备费', '材料费', '劳务费', '差旅费', '会议费', '出版费', '测试费', '咨询费', '管理费', '其他'],
            applyForm: { name: '', type: '纵向', level: '省部级', leader_id: this.user?.researcher_id || '', start_date: '', end_date: '', budget_total: 0, file_url: '', budgets: [] },
            rules: {
                name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
                start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
                end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
                budget_total: [{ required: true, message: '请输入预算', trigger: 'blur' }]
            }
        };
    },
    mounted() { this.loadNotices(); },
    methods: {
        async loadNotices() { const r = await api.get('/notices'); if (r.code === 200) this.notices = r.data; },
        addBudget() { this.applyForm.budgets.push({ category: '材料费', amount: 0 }); },
        removeBudget(i) { this.applyForm.budgets.splice(i, 1); },
        async handleUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            this.uploading = true; this.uploadMsg = '';
            try {
                const res = await uploadFile(file);
                if (res && res.code === 200) {
                    this.applyForm.file_url = res.data?.url || res.url || '';
                    this.uploadMsg = '上传成功';
                }
            } catch { this.uploadMsg = '上传失败'; }
            finally { this.uploading = false; }
        },
        async doApply(formEl) {
            this.applyMsg = '';
            if (!formEl) return;
            try { await formEl.validate(); } catch { return; }
            this.submitting = true;
            try {
                const d = { ...this.applyForm, budgets: this.applyForm.budgets.filter(b => b.category) };
                const res = await api.post('/projects', d);
                if (res && res.code === 200) {
                    this.applyMsg = res.message || '申报成功';
                } else {
                    this.applyMsg = '申报失败：' + (res?.message || '未知错误');
                }
            } catch (e) {
                this.applyMsg = e?.response?.data?.message || '网络错误，请重试';
            }
            this.submitting = false;
        }
    },
    template: `
    <div>
      <div class="page-head"><h2>项目申报</h2><p class="desc">项目编号由系统自动生成，填写其他信息后提交</p></div>
      <el-row :gutter="20">
        <el-col :span="7"><el-card><template #header>申报通知</template><el-timeline v-if="notices.length"><el-timeline-item v-for="n in notices" :key="n.notice_id" :timestamp="n.publish_date" color="#4f6ef7"><strong>{{ n.title }}</strong><p class="text-muted mt-2 mb-0">{{ n.content }}</p></el-timeline-item></el-timeline><el-empty v-else description="暂无通知" :image-size="60"></el-empty></el-card></el-col>
        <el-col :span="17"><el-card><template #header>在线填报</template>
          <el-form :model="applyForm" :rules="rules" ref="applyRef" label-width="110px" size="small">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="项目名称" prop="name"><el-input v-model="applyForm.name" placeholder="请输入项目名称"></el-input></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="负责人工号"><el-input v-model="applyForm.leader_id" disabled></el-input></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="类型"><el-select v-model="applyForm.type"><el-option label="纵向" value="纵向"/><el-option label="横向" value="横向"/></el-select></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="级别"><el-select v-model="applyForm.level"><el-option label="国家级" value="国家级"/><el-option label="省部级" value="省部级"/><el-option label="市厅级" value="市厅级"/><el-option label="横向" value="横向"/></el-select></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="开始日期" prop="start_date"><el-date-picker v-model="applyForm.start_date" type="date" value-format="YYYY-MM-DD" style="width:100%"></el-date-picker></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="结束日期" prop="end_date"><el-date-picker v-model="applyForm.end_date" type="date" value-format="YYYY-MM-DD" style="width:100%"></el-date-picker></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="总预算(万元)" prop="budget_total"><el-input-number v-model="applyForm.budget_total" :min="0" :precision="2" style="width:100%"></el-input-number></el-form-item></el-col>
            </el-row>
            <el-form-item label="立项报告">
              <div class="d-flex gap-2 align-center">
                <input type="file" @change="handleUpload" accept=".pdf,.doc,.docx" style="font-size:12px"/>
                <span v-if="uploading" class="text-muted">上传中...</span>
                <span v-else-if="uploadMsg" :style="'font-size:12px;color:' + (uploadMsg.includes('成功') ? '#16a34a' : '#dc2626')">{{ uploadMsg }}</span>
                <span v-if="applyForm.file_url" class="text-muted" style="font-size:11px">已上传</span>
              </div>
            </el-form-item>
            <el-divider>预算科目</el-divider>
            <div v-for="(b,i) in applyForm.budgets" :key="i" class="d-flex gap-2 align-center mb-2">
              <el-select v-model="b.category" size="small" style="width:140px"><el-option v-for="o in budgetOptions" :key="o" :label="o" :value="o"></el-option></el-select>
              <el-input-number v-model="b.amount" :min="0" :precision="2" size="small" style="width:120px"></el-input-number>
              <span class="text-muted">万元</span><el-button size="small" circle @click="removeBudget(i)">x</el-button>
            </div>
            <el-button size="small" @click="addBudget">+ 添加预算科目</el-button>
            <div v-if="applyMsg" :style="'color:' + (applyMsg.includes('成功') ? '#16a34a' : '#dc2626') + ';background:' + (applyMsg.includes('成功') ? '#f0fdf4' : '#fef2f2') + ';padding:12px 16px;border-radius:8px;margin-bottom:12px;font-size:14px;font-weight:500'">{{ applyMsg }}</div>
            <el-button type="primary" :loading="submitting" @click="doApply($refs.applyRef)" size="large">提交申报</el-button>
          </el-form></el-card></el-col>
      </el-row>
    </div>`
};
